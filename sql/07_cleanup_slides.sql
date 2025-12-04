-- Optional: Clean up slides with invalid IDs (if any exist and are causing issues)
-- This is useful if you have old "slide-1" entries that conflict with UUIDs.

-- Delete slides where ID is not a valid UUID format (simple check)
DELETE FROM slides
WHERE id NOT LIKE '________-____-____-____-____________';

-- Alternatively, if you want to wipe all slides and start fresh:
-- TRUNCATE TABLE slides;
