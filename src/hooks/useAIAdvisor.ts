import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface AIAdvisorSettings {
  id: string;
  user_id: string;
  selected_character: 'george' | 'peppa';
  is_enabled: boolean;
  monthly_income: number | null;
  onboarding_completed: boolean;
  onboarding_data: any;
  financial_plan: any;
  plan_created_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export function useAIAdvisor() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AIAdvisorSettings | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_advisor_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSettings(data as AIAdvisorSettings | null);
    } catch (error: any) {
      console.error('Error fetching AI advisor settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_advisor_chats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChatHistory((data as ChatMessage[]) || []);
    } catch (error: any) {
      console.error('Error fetching chat history:', error);
    }
  };

  const selectCharacter = async (character: 'george' | 'peppa') => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('ai_advisor_settings')
        .upsert({
          user_id: user.id,
          selected_character: character,
          is_enabled: false,
          onboarding_completed: false,
        });

      if (error) throw error;
      await fetchSettings();
      return true;
    } catch (error: any) {
      console.error('Error selecting character:', error);
      toast({
        title: 'Error',
        description: 'Failed to select character',
        variant: 'destructive',
      });
      return false;
    }
  };

  const completeOnboarding = async (monthlyIncome: number, onboardingData: any) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to continue',
        variant: 'destructive',
      });
      return null;
    }

    try {
      // Call AI to generate plan
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'ai-advisor',
        {
          body: {
            action: 'generate_plan',
            data: {
              monthlyIncome,
              onboardingAnswers: onboardingData,
            },
          },
        }
      );

      if (functionError) {
        console.error('Function invocation error:', functionError);
        throw functionError;
      }

      if (!functionData?.message) {
        throw new Error('Invalid response from AI advisor');
      }

      // Update settings with plan
      const { error } = await supabase
        .from('ai_advisor_settings')
        .update({
          monthly_income: monthlyIncome,
          onboarding_completed: true,
          onboarding_data: onboardingData,
          financial_plan: functionData.message,
          plan_created_at: new Date().toISOString(),
          is_enabled: true,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchSettings();
      return functionData.message;
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate financial plan',
        variant: 'destructive',
      });
      return null;
    }
  };

  const sendMessage = async (message: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to continue',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'ai-advisor',
        {
          body: {
            action: 'chat',
            data: { message },
          },
        }
      );

      if (functionError) {
        console.error('Function invocation error:', functionError);
        throw functionError;
      }

      if (!functionData?.message) {
        throw new Error('Invalid response from AI advisor');
      }

      await fetchChatHistory();
      return functionData.message;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
      return null;
    }
  };

  const clearChatHistory = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('ai_advisor_chats')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setChatHistory([]);
    } catch (error: any) {
      console.error('Error clearing chat history:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchChatHistory();
  }, [user]);

  return {
    settings,
    chatHistory,
    loading,
    selectCharacter,
    completeOnboarding,
    sendMessage,
    clearChatHistory,
    refreshSettings: fetchSettings,
    refreshChatHistory: fetchChatHistory,
  };
}