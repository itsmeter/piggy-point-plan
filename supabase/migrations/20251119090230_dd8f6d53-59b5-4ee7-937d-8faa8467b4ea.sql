-- Fix transaction type check to allow project-contribution
ALTER TABLE public.transactions DROP CONSTRAINT transactions_type_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check 
  CHECK (type IN ('income', 'expense', 'bill', 'project', 'project-contribution'));

-- Create table to track project contribution history
CREATE TABLE IF NOT EXISTS public.project_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  contribution_date TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.project_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own project contributions"
  ON public.project_contributions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project contributions"
  ON public.project_contributions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);