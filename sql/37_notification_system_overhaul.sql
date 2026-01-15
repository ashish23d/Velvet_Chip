-- 1. Updates Column in Profiles
-- Stores personal order updates log: [{ title, message, orderId, timestamp, read }]
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updates jsonb DEFAULT '[]'::jsonb;

-- 2. Enhance Broadcast Notifications for Deep Linking
ALTER TABLE public.broadcast_notifications
ADD COLUMN IF NOT EXISTS action_type text CHECK (action_type IN ('none', 'product', 'category', 'url')),
ADD COLUMN IF NOT EXISTS action_id text, -- Product ID / Category ID / External URL
ADD COLUMN IF NOT EXISTS action_label text; -- For display purposes (e.g. "Product Name")

-- 3. Ensure action_type defaults to 'none' for existing rows
UPDATE public.broadcast_notifications 
SET action_type = 'none' 
WHERE action_type IS NULL;

-- 4. Function to append to profile updates (Helper for Edge Functions)
-- Usage: select append_profile_update(user_id, '{"title": "..."}'::jsonb);
CREATE OR REPLACE FUNCTION append_profile_update(p_user_id uuid, p_update_entry jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET updates = updates || p_update_entry
  WHERE id = p_user_id;
END;
$$;
