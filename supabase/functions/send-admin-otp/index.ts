import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase Client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { email, otp } = await req.json();

        console.log(`📧 Sending Admin OTP to: ${email}`);

        if (!email || !otp) {
            throw new Error('Email and OTP are required');
        }

        // 1. Fetch the Admin OTP template from mail_templates table
        const { data: template, error: templateError } = await supabase
            .from('mail_templates')
            .select('*')
            .eq('name', 'Admin OTP Verification')
            .eq('is_active', true)
            .single();

        if (templateError || !template) {
            console.error('❌ Template not found:', templateError);
            throw new Error('Admin OTP email template not found or inactive');
        }

        // 2. Replace {{otp}} placeholder in the template
        let htmlContent = template.html_content || '';
        let emailSubject = template.subject || 'Admin Verification Code';

        // Replace {{otp}} with actual OTP
        htmlContent = htmlContent.replace(/\{\{otp\}\}/g, otp);
        emailSubject = emailSubject.replace(/\{\{otp\}\}/g, otp);

        // 3. Fetch sender settings from email_settings table
        let senderEmail = "support@awaany.com";
        let senderName = "Velvet Chip";

        try {
            const { data: settingsData } = await supabase
                .from('email_settings')
                .select('*')
                .single();

            if (settingsData) {
                if (settingsData.sender_email) senderEmail = settingsData.sender_email;
                if (settingsData.sender_name) senderName = settingsData.sender_name;
            }
        } catch (err) {
            console.warn("⚠️ Could not fetch email settings, using defaults.", err);
        }

        // 4. Send email via SendGrid
        const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

        if (!SENDGRID_API_KEY) {
            throw new Error("SENDGRID_API_KEY is missing from environment variables");
        }

        console.log(`📤 Sending from: "${senderName}" <${senderEmail}>`);
        console.log(`📤 Subject: ${emailSubject}`);

        const emailPayload = {
            personalizations: [{
                to: [{ email: email }],
                subject: emailSubject,
            }],
            from: { email: senderEmail, name: senderName },
            content: [{
                type: 'text/html',
                value: htmlContent,
            }],
        };

        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
        });

        if (!res.ok) {
            const errorBody = await res.text();
            console.error(`❌ SendGrid API Error: ${res.statusText} - ${errorBody}`);
            throw new Error(`SendGrid API error: ${res.statusText}`);
        }

        console.log('✅ Admin OTP email sent successfully');

        return new Response(
            JSON.stringify({
                success: true,
                message: "OTP email sent successfully"
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );

    } catch (error) {
        console.error("❌ Error sending OTP email:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
