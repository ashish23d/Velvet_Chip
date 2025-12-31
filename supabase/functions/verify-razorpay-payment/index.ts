
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
        const secret = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';

        // Generate expected signature
        // formatted string: order_id + "|" + payment_id
        const generated_signature = await hmacSha256(secret, razorpay_order_id + "|" + razorpay_payment_id);

        if (generated_signature === razorpay_signature) {
            return new Response(JSON.stringify({ status: 'success', message: 'Payment verified' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        } else {
            return new Response(JSON.stringify({ status: 'failure', message: 'Invalid signature' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});

// Helper for HMAC SHA256
async function hmacSha256(key: string, data: string) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const dataData = encoder.encode(data);

    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataData);

    // Convert ArrayBuffer to Hex String
    return Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
