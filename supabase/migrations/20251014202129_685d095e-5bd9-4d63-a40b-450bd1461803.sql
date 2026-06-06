-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Add role column to admin_users and can_manage_requests permission
ALTER TABLE public.admin_users ADD COLUMN can_manage_requests BOOLEAN DEFAULT false;

-- Add status column to music_requests
ALTER TABLE public.music_requests ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Set Nick as admin with all permissions
UPDATE public.admin_users SET can_manage_requests = true WHERE username = 'Nick';

-- Insert Nick into user_roles as admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM public.admin_users
WHERE username = 'Nick'
ON CONFLICT (user_id, role) DO NOTHING;

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role((SELECT id FROM public.admin_users WHERE id = (SELECT user_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role((SELECT id FROM public.admin_users WHERE id = (SELECT user_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)), 'admin'));

CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (user_id IN (SELECT id FROM public.admin_users));

-- Update admin_users RLS to allow admins to manage users
CREATE POLICY "Admins can manage users"
ON public.admin_users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.admin_users au ON au.id = ur.user_id
    WHERE au.username = current_setting('request.jwt.claims', true)::json->>'username'
      AND ur.role = 'admin'
  )
);

-- Add index for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_music_requests_status ON public.music_requests(status);