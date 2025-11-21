-- Create table to track AI advisor usage for rate limiting
CREATE TABLE IF NOT EXISTS public.ai_advisor_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  tokens_used integer DEFAULT 0
);

-- Add index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_time ON public.ai_advisor_usage(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_advisor_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own usage
CREATE POLICY "Users can view own AI usage"
ON public.ai_advisor_usage
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Allow edge function to insert usage records
CREATE POLICY "Allow edge function to insert usage"
ON public.ai_advisor_usage
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);