-- Enforce one review per user per product
-- This will prevent a user from inserting multiple reviews for the same product.

-- 1. Optional: Cleanup duplicates (keep the latest one)
-- This is a bit complex logic to do safely in one go without manual supervision, 
-- but we can try to delete older duplicates if they exist, or the user can do it manually.
-- For safety, we will just try to add the constraint. If it fails, the user has duplicates to clean up.

ALTER TABLE public.reviews
ADD CONSTRAINT unique_user_product_review UNIQUE (user_id, product_id);
