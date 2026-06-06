-- Create venues/discos table
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Anyone can read active venues
CREATE POLICY "Anyone can read venues"
  ON public.venues
  FOR SELECT
  USING (true);

-- Only admins can manage venues
CREATE POLICY "Admins can manage venues"
  ON public.venues
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Add venue_id to music_requests
ALTER TABLE public.music_requests
ADD COLUMN venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_music_requests_venue_id ON public.music_requests(venue_id);