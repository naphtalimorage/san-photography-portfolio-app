-- ========================================
-- SUPABASE VIDEO REELS (table + storage)
-- ========================================
-- Storage bucket must be created via Supabase Dashboard.
-- Create bucket: "video_reels"
-- Public: Yes
-- Then run the storage policies below.

-- 1) Create table
CREATE TABLE IF NOT EXISTS video_reels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),

  title text NOT NULL,

  -- Where Supabase Storage objects live
  storage_video_path text NOT NULL,
  storage_thumbnail_path text NOT NULL,

  -- Optional convenience URL snapshot
  -- (can be omitted if you always compute public URL on the client)
  thumbnail_url text,

  sort_order integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_video_reels_sort_order ON video_reels(sort_order);
CREATE INDEX IF NOT EXISTS idx_video_reels_title ON video_reels(title);

-- 2) Enable RLS
ALTER TABLE video_reels ENABLE ROW LEVEL SECURITY;

-- 3) Policies
-- Public can view reels
DROP POLICY IF EXISTS "Video reels are viewable by everyone" ON video_reels;
CREATE POLICY "Video reels are viewable by everyone"
ON video_reels FOR SELECT
USING (true);

-- Authenticated users can insert/update/delete (admin is authenticated)
DROP POLICY IF EXISTS "Video reels can be inserted by authenticated users" ON video_reels;
CREATE POLICY "Video reels can be inserted by authenticated users"
ON video_reels FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Video reels can be updated by authenticated users" ON video_reels;
CREATE POLICY "Video reels can be updated by authenticated users"
ON video_reels FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Video reels can be deleted by authenticated users" ON video_reels;
CREATE POLICY "Video reels can be deleted by authenticated users"
ON video_reels FOR DELETE
TO authenticated
USING (true);

-- ========================================
-- STORAGE POLICIES (bucket: video_reels)
-- ========================================

-- Public read for reels objects
DROP POLICY IF EXISTS "Video reels objects are publicly accessible" ON storage.objects;
CREATE POLICY "Video reels objects are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'video_reels');

-- Authenticated upload
DROP POLICY IF EXISTS "Authenticated users can upload to video_reels" ON storage.objects;
CREATE POLICY "Authenticated users can upload to video_reels"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'video_reels');

-- Authenticated update
DROP POLICY IF EXISTS "Authenticated users can update video_reels" ON storage.objects;
CREATE POLICY "Authenticated users can update video_reels"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'video_reels')
WITH CHECK (bucket_id = 'video_reels');

-- Authenticated delete
DROP POLICY IF EXISTS "Authenticated users can delete video_reels" ON storage.objects;
CREATE POLICY "Authenticated users can delete video_reels"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'video_reels');

