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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const { action, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices[0].message.content;

    if (action === "chat") {
      // Save assistant message
      await supabaseClient.from("ai_advisor_chats").insert({
        user_id: user.id,
        role: "assistant",
        content: assistantMessage,
      });
    }

    return new Response(JSON.stringify({ message: assistantMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in ai-advisor function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});