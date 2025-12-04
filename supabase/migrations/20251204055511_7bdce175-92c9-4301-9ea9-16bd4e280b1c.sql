-- Add last_daily_reward_claimed to piggy_points for daily rewards tracking
ALTER TABLE public.piggy_points 
ADD COLUMN IF NOT EXISTS last_daily_reward_claimed date DEFAULT NULL;