-- Create storage bucket for speaker profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('speaker-images', 'speaker-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own speaker images
CREATE POLICY "Speakers can upload their own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'speaker-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own images
CREATE POLICY "Speakers can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'speaker-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Speakers can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'speaker-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to speaker images
CREATE POLICY "Public can view speaker images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'speaker-images');