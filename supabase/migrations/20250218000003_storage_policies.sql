-- Storage policies for bucket acj-media (create the bucket in Dashboard first: Storage → New bucket → name: acj-media, Public: on)
-- Then run this in SQL Editor so authenticated users can upload and everyone can read.

-- Allow anyone to read (public bucket)
CREATE POLICY "Public read acj-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'acj-media');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated upload acj-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'acj-media');

-- Allow authenticated users to update (e.g. upsert)
CREATE POLICY "Authenticated update acj-media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'acj-media');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated delete acj-media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'acj-media');
