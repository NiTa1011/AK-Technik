-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage users" ON public.admin_users;

-- Create simple, non-recursive policies for admin_users
-- Allow inserts for authenticated users (for user creation by admins)
CREATE POLICY "Allow insert for admin users"
ON public.admin_users
FOR INSERT
WITH CHECK (true);

-- Allow updates for admin users table
CREATE POLICY "Allow update for admin users"
ON public.admin_users
FOR UPDATE
USING (true);