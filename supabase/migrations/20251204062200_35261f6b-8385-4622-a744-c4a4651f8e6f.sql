-- Add display_name column to profiles table
ALTER TABLE public.profiles ADD COLUMN display_name text;

-- Set default display_name to username for existing users
UPDATE public.profiles SET display_name = username WHERE display_name IS NULL;