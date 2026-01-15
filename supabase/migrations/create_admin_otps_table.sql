-- Create admin_otps table for OTP verification
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.admin_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    otp TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_otps_user_id ON public.admin_otps(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_otps_otp ON public.admin_otps(otp);
CREATE INDEX IF NOT EXISTS idx_admin_otps_expires_at ON public.admin_otps(expires_at);

-- Enable Row Level Security
ALTER TABLE public.admin_otps ENABLE ROW LEVEL SECURITY;

-- Create policy: Admins can insert their own OTPs
CREATE POLICY "Admins can insert own OTPs" ON public.admin_otps
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy: Admins can read their own OTPs
CREATE POLICY "Admins can read own OTPs" ON public.admin_otps
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy: Admins can update their own OTPs
CREATE POLICY "Admins can update own OTPs" ON public.admin_otps
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy: Admins can delete their own OTPs
CREATE POLICY "Admins can delete own OTPs" ON public.admin_otps
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to auto-delete expired OTPs (optional cleanup)
CREATE OR REPLACE FUNCTION delete_expired_admin_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM public.admin_otps
    WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a scheduled job to clean up expired OTPs daily
-- (Requires pg_cron extension - uncomment if you have it enabled)
-- SELECT cron.schedule('delete-expired-otps', '0 2 * * *', 'SELECT delete_expired_admin_otps();');
