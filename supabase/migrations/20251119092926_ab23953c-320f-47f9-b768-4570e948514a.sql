-- Allow unauthenticated users to query profiles by username for login
-- This is necessary for username-based login to work
CREATE POLICY "Allow username lookup for login"
ON public.profiles
FOR SELECT
TO anon
USING (true);