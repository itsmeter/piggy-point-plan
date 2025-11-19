-- Fix the handle_new_user function to atomically create all user records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email
  );
  
  -- Insert piggy_points atomically
  INSERT INTO public.piggy_points (user_id, total_points, current_level, points_to_next_level, login_streak)
  VALUES (new.id, 0, 1, 1000, 0);
  
  -- Insert user_settings atomically
  INSERT INTO public.user_settings (user_id, first_setup_completed, notifications_enabled, theme)
  VALUES (new.id, false, true, 'light');
  
  RETURN new;
END;
$$;

-- Add INSERT policy for piggy_points (for trigger to work)
DROP POLICY IF EXISTS "Allow trigger to insert points" ON public.piggy_points;
CREATE POLICY "Allow trigger to insert points" ON public.piggy_points
FOR INSERT 
WITH CHECK (true);

-- Add INSERT policy for user_settings (for trigger to work)
DROP POLICY IF EXISTS "Allow trigger to insert settings" ON public.user_settings;
CREATE POLICY "Allow trigger to insert settings" ON public.user_settings
FOR INSERT 
WITH CHECK (true);

-- Add INSERT policy for profiles (for trigger to work)
DROP POLICY IF EXISTS "Allow trigger to insert profiles" ON public.profiles;
CREATE POLICY "Allow trigger to insert profiles" ON public.profiles
FOR INSERT 
WITH CHECK (true);