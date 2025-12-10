-- Quick setup: Add Razorpay credentials to payment_settings
-- Run this AFTER you've run 18_add_payment_settings.sql

-- REPLACE 'YOUR_KEY_ID' and 'YOUR_KEY_SECRET' with your actual Razorpay credentials
-- Get these from: https://dashboard.razorpay.com/app/keys

UPDATE site_content
SET data = '{
    "razorpay_enabled": true,
    "razorpay_key_id": "rzp_test_RfbGBqnd4wD9QG",
    "cod_enabled": true,
    "upi_enabled": true,
    "test_mode": true
}'::jsonb
WHERE id = 'payment_settings';

-- IMPORTANT NOTES:
-- 1. For TEST mode: Use keys starting with "rzp_test_"
-- 2. For LIVE mode: Use keys starting with "rzp_live_" and set test_mode to false
-- 3. The razorpay_key_secret is NOT stored in database for security
--    (In production, you'd use Supabase Edge Functions to handle secret key)
-- 4. For now, the integration works with just the key_id for basic checkout

-- To disable Razorpay and use only COD:
-- UPDATE site_content SET data = jsonb_set(data, '{razorpay_enabled}', 'false') WHERE id = 'payment_settings';
