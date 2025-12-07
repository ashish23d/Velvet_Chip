-- Add video_url column to card_addons table
-- This allows storing pasted video URLs (YouTube, Vimeo, direct links)
-- alongside the existing image_path column for uploaded video files

ALTER TABLE card_addons 
ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN card_addons.video_url IS 'URL for external video (YouTube, Vimeo, or direct video link). Alternative to uploaded video in image_path';
