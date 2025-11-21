import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No Authorization header found");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Authentication required. Please log in to use the AI Advisor." 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Authorization header present");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError.message);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Authentication failed: " + authError.message 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!user) {
      console.error("No user found from auth token");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Not authenticated. Please log in and try again." 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("User authenticated:", user.id);

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error("Invalid JSON in request body:", error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Invalid request format" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { action, data } = requestBody;

    if (!action) {
      console.error("Missing action in request body");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Missing required field: action" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Processing action:", action, "for user:", user.id);

    // Rate limiting: Check usage
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    if (action === "generate_plan") {
      const { count: planCount } = await supabaseClient
        .from("ai_advisor_usage")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("action", "generate_plan")
        .gte("created_at", oneDayAgo);

      if (planCount && planCount >= 5) {
        console.log("Rate limit exceeded for plan generation:", user.id);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Daily plan generation limit reached (5 per day). Please try again tomorrow." 
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    if (action === "chat") {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { count: chatCount } = await supabaseClient
        .from("ai_advisor_usage")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("action", "chat")
        .gte("created_at", oneHourAgo);

      if (chatCount && chatCount >= 50) {
        console.log("Rate limit exceeded for chat:", user.id);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Hourly chat limit reached (50 per hour). Please try again later." 
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured. Please contact support." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch user's settings and data
    const { data: settings } = await supabaseClient
      .from("ai_advisor_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: transactions } = await supabaseClient
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false })
      .limit(50);

    const { data: budgets } = await supabaseClient
      .from("budgets")
      .select("*")
      .eq("user_id", user.id);

    // Build context for AI
    const characterName = settings?.selected_character === "george" ? "George" : "Peppa";
    const characterPersonality = settings?.selected_character === "george" 
      ? "You are George, a friendly and enthusiastic financial advisor. You're energetic, positive, and love to help people achieve their financial goals! You often use phrases like 'Brilliant!' and 'Let's do this!'"
      : "You are Peppa, a caring and wise financial advisor. You're thoughtful, encouraging, and always know how to make finances fun and easy to understand! You like to say things like 'Lovely!' and 'Well done!'";

    let systemPrompt = `${characterPersonality}

You are helping a user manage their finances for the month. Here's what you know:
- Monthly Income: ₱${settings?.monthly_income || "Not set"}
- Onboarding Data: ${JSON.stringify(settings?.onboarding_data || {})}
- Recent Transactions: ${JSON.stringify(transactions?.slice(0, 10) || [])}
- Active Budgets: ${JSON.stringify(budgets || [])}

Your job is to:
1. Provide personalized financial advice based on the user's data
2. Help them create a monthly budget plan that minimizes overspending
3. Consider their behavior, priorities, needs vs wants
4. Be encouraging and supportive
5. Give specific, actionable recommendations

Always respond in a friendly, conversational tone as ${characterName}.`;

    if (action === "generate_plan") {
      // Validate required fields
      if (!data?.monthlyIncome) {
        console.error("Missing monthlyIncome");
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Monthly income is required" 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!data?.onboardingAnswers) {
        console.error("Missing onboardingAnswers");
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Onboarding answers are required" 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("Generating financial plan for user:", user.id, "income:", data.monthlyIncome);
      
      systemPrompt += `\n\nThe user has completed onboarding. Generate a comprehensive 1-month financial plan based on their income of ₱${data.monthlyIncome} and the following information:
${JSON.stringify(data.onboardingAnswers, null, 2)}

Create a detailed budget breakdown with:
- Essential expenses (rent, utilities, food, transportation)
- Savings goals (emergency fund, future goals)
- Discretionary spending (entertainment, shopping)
- Recommendations to avoid overspending
- Tips specific to their financial behaviors

Return your response as a detailed financial plan with specific amounts and percentages.`;
    }

    let messages = [];

    if (action === "chat") {
      if (!data?.message) {
        console.error("Missing message in chat request");
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Missing required field: message" 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("Fetching chat history for user:", user.id);
      
      // Fetch chat history
      const { data: chatHistory } = await supabaseClient
        .from("ai_advisor_chats")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(20);

      messages = [
        { role: "system", content: systemPrompt },
        ...(chatHistory || []).map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user", content: data.message },
      ];

      // Save user message
      await supabaseClient.from("ai_advisor_chats").insert({
        user_id: user.id,
        role: "user",
        content: data.message,
      });
    } else {
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Please create my monthly financial plan." },
      ];
    }

    console.log("Calling AI gateway with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Rate limit exceeded. Please try again later." 
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Payment required. Please add credits to continue." 
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "AI service temporarily unavailable. Please try again." 
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiResponse = await response.json();
    
    if (!aiResponse.choices || !aiResponse.choices[0]?.message?.content) {
      console.error("Invalid AI response format:", aiResponse);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Invalid response from AI service" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const assistantMessage = aiResponse.choices[0].message.content;
    console.log("AI response received successfully, length:", assistantMessage.length);

    if (action === "chat") {
      // Save assistant message
      await supabaseClient.from("ai_advisor_chats").insert({
        user_id: user.id,
        role: "assistant",
        content: assistantMessage,
      });
    }

    // Log usage for rate limiting
    await supabaseClient.from("ai_advisor_usage").insert({
      user_id: user.id,
      action: action,
      tokens_used: aiResponse.usage?.total_tokens || 0,
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: assistantMessage 
      }), 
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Unexpected error in ai-advisor function:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "An unexpected error occurred. Please try again.",
        details: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});