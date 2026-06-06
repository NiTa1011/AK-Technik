-- Create music_requests table to store song requests
CREATE TABLE IF NOT EXISTS public.music_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_title text NOT NULL,
  artist_name text NOT NULL,
  request_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.music_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read music requests
CREATE POLICY "Anyone can read music requests"
  ON public.music_requests
  FOR SELECT
  USING (true);

-- Allow anyone to insert music requests
CREATE POLICY "Anyone can insert music requests"
  ON public.music_requests
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update music requests
CREATE POLICY "Anyone can update music requests"
  ON public.music_requests
  FOR UPDATE
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_music_requests_updated_at
  BEFORE UPDATE ON public.music_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index on song and artist for faster lookups
CREATE INDEX idx_music_requests_song_artist 
  ON public.music_requests(song_title, artist_name);