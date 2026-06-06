-- Add theme management permission to admin_users
ALTER TABLE public.admin_users ADD COLUMN can_change_theme BOOLEAN DEFAULT false;

-- Set Nick as able to change themes
UPDATE public.admin_users SET can_change_theme = true WHERE username = 'Nick';

-- Create themes table
CREATE TABLE public.app_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_name TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.app_themes ENABLE ROW LEVEL SECURITY;

-- Insert default themes
INSERT INTO public.app_themes (theme_name, active) VALUES 
  ('default', true),
  ('halloween', false),
  ('fasching', false);

-- RLS for themes - everyone can read, only theme managers can update
CREATE POLICY "Anyone can read themes"
ON public.app_themes
FOR SELECT
USING (true);

CREATE POLICY "Theme managers can update themes"
ON public.app_themes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE can_change_theme = true
  )
);