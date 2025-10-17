/*
  # Create Storage Bucket for Images

  1. New Storage Bucket
    - Creates 'images' bucket for storing all application images
    - Publicly accessible for reading
    - Allows authenticated users to upload/delete
  
  2. Security
    - Public bucket for easy image access
    - RLS policies for upload/delete operations
    - Organized folder structure: logos/, kategoriler/, urunler/
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');