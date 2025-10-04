/*
  # Update Storage Policies for Public Access

  1. Changes
    - Allow public (unauthenticated) uploads to images bucket
    - Allow public deletes from images bucket
    - Keep public read access
  
  2. Security Note
    - Application uses custom admin authentication (not Supabase auth)
    - Admin panel access is controlled at application level
    - Storage bucket allows public operations for admin functionality
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Create new policies with public access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Public update access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images');

CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
USING (bucket_id = 'images');