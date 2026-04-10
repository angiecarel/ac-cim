
-- Make the idea-files bucket private
UPDATE storage.buckets SET public = false WHERE id = 'idea-files';

-- Drop any existing permissive policies on idea-files objects
DROP POLICY IF EXISTS "Users can view their own idea files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own idea files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own idea files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own idea files" ON storage.objects;

-- Create proper RLS policies scoped to the owner
CREATE POLICY "Users can view their own idea files"
ON storage.objects FOR SELECT
USING (bucket_id = 'idea-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own idea files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'idea-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own idea files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'idea-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own idea files"
ON storage.objects FOR DELETE
USING (bucket_id = 'idea-files' AND auth.uid()::text = (storage.foldername(name))[1]);
