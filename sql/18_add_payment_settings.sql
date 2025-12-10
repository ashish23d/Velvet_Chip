-- Add payment settings configuration to site_content table
-- This allows configurable Razorpay credentials via admin panel

INSERT INTO site_content (id, data) VALUES (
    'payment_settings',
    '{
        "razorpay_enabled": false,
        "razorpay_key_id": "",
        "cod_enabled": true,
        "upi_enabled": false,
        "test_mode": true
    }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Note: razorpay_key_secret is NOT stored here for security
-- It will be stored separately with encryption via Edge Functions
-- Only the public key_id is stored here for frontend use
