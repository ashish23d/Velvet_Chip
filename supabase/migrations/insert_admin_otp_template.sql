-- SQL Script to Insert/Update Admin OTP Email Template
-- Run this in Supabase SQL Editor

INSERT INTO public.mail_templates (name, subject, html_content, template_type, is_active)
VALUES (
  'Admin OTP Verification',
  'Admin Access Verification - Your Security Code',
  '<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
    <div style="background-color:purple; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0; font-family: ''Playfair Display'', serif;">Admin Verification</h2>
    </div>
    <div style="padding: 20px;">
        <p>Hello Admin,</p>
        <p>You requested to view or edit sensitive shipping settings. Please use the verification code below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; padding: 15px 30px; background-color: #f8f8f8; border: 2px solid #C22255; color: #C22255; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px;">{{otp}}</span>
        </div>
        <p>This code will expire in 10 minutes. Do not share this code with anyone.</p>
    </div>
    <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        <p>&copy; 2026 Velvet Chip. All Rights Reserved.</p>
    </div>
</div>',
  'order_status',
  true
)
ON CONFLICT (name) DO UPDATE
SET 
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  template_type = EXCLUDED.template_type,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
