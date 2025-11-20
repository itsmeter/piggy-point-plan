-- Create AI advisor settings table
CREATE TABLE public.ai_advisor_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  selected_character TEXT NOT NULL CHECK (selected_character IN ('george', 'peppa')),
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  monthly_income NUMERIC,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  onboarding_data JSONB,
  financial_plan JSONB,
  plan_created_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.ai_advisor_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own AI advisor settings"
  ON public.ai_advisor_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI advisor settings"
  ON public.ai_advisor_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI advisor settings"
  ON public.ai_advisor_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create AI advisor chat history table
CREATE TABLE public.ai_advisor_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_advisor_chats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own chat history"
  ON public.ai_advisor_chats
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON public.ai_advisor_chats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_ai_advisor_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_ai_advisor_settings_updated_at
  BEFORE UPDATE ON public.ai_advisor_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_advisor_settings_updated_at();