-- Create admin_users table for simple username/password authentication
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only allow reading for authentication (no public access to passwords ideally, but we need it for simple auth)
CREATE POLICY "Admin users can be read for auth"
  ON public.admin_users
  FOR SELECT
  USING (true);

-- Insert the initial admin user (Nick with password AK-Technik)
INSERT INTO public.admin_users (username, password)
VALUES ('Nick', 'AK-Technik')
ON CONFLICT (username) DO NOTHING;