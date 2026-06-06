-- Drop existing policies
DROP POLICY IF EXISTS "Admin users can be read for auth" ON public.admin_users;
DROP POLICY IF EXISTS "Allow insert for admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow update for admin users" ON public.admin_users;

-- Create comprehensive policies that allow all operations
CREATE POLICY "Allow all operations for admin users"
  ON public.admin_users
  FOR ALL
  USING (true)
  WITH CHECK (true);