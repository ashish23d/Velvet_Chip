// FIX: Add Deno namespace to fix "Cannot find name 'Deno'" and type resolution errors in non-Deno environments.
declare const Deno: any;
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';
import type { Order } from './types.ts';

serve(async (req) => {
  console.log(`[send-order-update] Function invoked with method: ${req.method}`);

  if (req.method === 'OPTIONS') {
    console.log('[send-order-update] Handling OPTIONS request.');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[send-order-update] Attempting to parse request body.');
    const { orderId, templateName } = await req.json();
    console.log(`[send-order-update] Successfully parsed orderId: ${orderId}, templateName: ${templateName}`);

    if (!orderId) throw new Error("Order ID is required.");
    if (!templateName) throw new Error("Template name is required.");

    // Correctly reference Deno environment variables with proper types
    const projectUrl = Deno.env.get('PROJECT_URL');
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');

    if (!projectUrl || !serviceRoleKey) {
        console.error("[send-order-update] Error: Missing PROJECT_URL or SERVICE_ROLE_KEY secrets.");
        throw new Error("Supabase credentials are not configured correctly in function secrets.");
    }
    console.log("[send-order-update] Supabase credentials found.");

    const supabaseAdmin = createClient(projectUrl, serviceRoleKey);
    console.log("[send-order-update] Supabase admin client created.");
    
    // 1. Fetch Order and User data
    console.log(`[send-order-update] Fetching order data for orderId: ${orderId}`);
    const { data: orderResult, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, profile:profiles(email)')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;
    if (!orderResult) throw new Error(`Order ${orderId} not found.`);
    console.log('[send-order-update] Order data fetched successfully.');
    
    // FIX: Map snake_case from DB to camelCase for application logic
    const order: Order = {
      id: orderResult.id,
      userId: orderResult.user_id,
      orderDate: orderResult.order_date,
      currentStatus: orderResult.current_status,
      statusHistory: orderResult.status_history || [],
      totalAmount: orderResult.total_amount,
      shippingAddress: orderResult.shipping_address,
      items: orderResult.items || [],
      payment: orderResult.payment,
      customerEmail: (orderResult.profile as any)?.email,
      customerName: orderResult.shipping_address.name,
      promotionCode: orderResult.promotion_code,
    };

    if (!order.customerEmail) {
      throw new Error(`Customer email not found for order ${orderId}`);
    }

    // 2. Fetch the specified Email Template
    console.log(`[send-order-update] Fetching "${templateName}" email template.`);
    const { data: templateData, error: templateError } = await supabaseAdmin
      .from('mail_templates')
      .select('subject, html_content')
      .eq('name', templateName)
      .single();

    if (templateError || !templateData) throw new Error(`Could not find the "${templateName}" email template in the database.`);
    console.log('[send-order-update] Email template fetched.');

    // 3. Replace all placeholders
    console.log('[send-order-update] Replacing placeholders in template.');
    const finalHtml = templateData.html_content
      .replaceAll('{{customer_name}}', order.shippingAddress.name)
      .replaceAll('{{order_id}}', order.id)
      .replaceAll('{{order_status}}', order.currentStatus)
      .replaceAll('{{shipping_address}}', `${order.shippingAddress.name}<br>${order.shippingAddress.address}, ${order.shippingAddress.locality}<br>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`)
      .replaceAll('{{tracking_link}}', `${Deno.env.get('SITE_URL') || 'https://awaany.com'}/#/track-order/${order.id}`);

    const finalSubject = templateData.subject.replaceAll('{{order_id}}', order.id).replaceAll('{{order_status}}', order.currentStatus);
    console.log('[send-order-update] Placeholders replaced.');

    // 4. Send email via SendGrid
    console.log('[send-order-update] Preparing to send email via SendGrid.');
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    if (!SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY is not set in function secrets.");
    console.log('[send-order-update] SendGrid API Key found.');
    
    const emailPayload = {
      personalizations: [{ to: [{ email: order.customerEmail }] }],
      from: { email: "support@awaany.com", name: "Awaany" },
      subject: finalSubject,
      content: [{ type: 'text/html', value: finalHtml }],
    };

    console.log(`[send-order-update] Sending email to: ${order.customerEmail}`);
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
        console.error(`[send-order-update] SendGrid API Error: ${res.statusText} - ${errorBody}`);
        throw new Error(`SendGrid API error: ${res.statusText} - ${errorBody}`);
    }
    console.log('[send-order-update] Email sent successfully via SendGrid.');

    return new Response(JSON.stringify({ message: "Order update email sent successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("!!! [send-order-update] An error occurred in the function !!!");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});