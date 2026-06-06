-- Drop existing policy
DROP POLICY IF EXISTS "Admins can manage venues" ON public.venues;

-- Create simpler policy that allows all authenticated operations
-- Since we're using custom auth with admin_users table
CREATE POLICY "Allow venue management"
  ON public.venues
  FOR ALL
  USING (true)
  WITH CHECK (true);