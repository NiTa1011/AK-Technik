-- Enable realtime for app_themes table so theme changes are instant
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_themes;