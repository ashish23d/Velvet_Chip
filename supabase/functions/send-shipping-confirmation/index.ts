// FIX: Add Deno namespace to fix "Cannot find name 'Deno'" and type resolution errors in non-Deno environments.
declare const Deno: any;
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';
import type { Order, Address, CartItem } from './types.ts';

serve(async (req) => {
  console.log(`[send-shipping-confirmation] Function invoked with method: ${req.method}`);

  if (req.method === 'OPTIONS') {
    console.log('[send-shipping-confirmation] Handling OPTIONS request.');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[send-shipping-confirmation] Attempting to parse request body.');
    const { orderId } = await req.json();
    console.log(`[send-shipping-confirmation] Successfully parsed orderId: ${orderId}`);

    if (!orderId) {
      console.error('[send-shipping-confirmation] Error: Order ID is missing from the request body.');
      throw new Error("Order ID is required.");
    }
    
    // Correctly reference Deno environment variables with proper types
    const projectUrl = Deno.env.get('PROJECT_URL');
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');

    if (!projectUrl || !serviceRoleKey) {
        console.error("[send-shipping-confirmation] Error: Missing PROJECT_URL or SERVICE_ROLE_KEY secrets.");
        throw new Error("Supabase credentials are not configured correctly in function secrets.");
    }
    console.log("[send-shipping-confirmation] Supabase credentials found.");

    const supabaseAdmin = createClient(projectUrl, serviceRoleKey);
    console.log("[send-shipping-confirmation] Supabase admin client created.");
    
    // 1. Fetch Order and User data
    console.log(`[send-shipping-confirmation] Fetching order data for orderId: ${orderId}`);
    const { data: orderResult, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, profile:profiles(email)')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;
    if (!orderResult) throw new Error(`Order ${orderId} not found.`);
    console.log('[send-shipping-confirmation] Order data fetched successfully.');
    
    // Map snake_case DB response to camelCase Order type
    const order: Order = {
        id: orderResult.id,
        userId: orderResult.user_id,
        orderDate: orderResult.order_date,
        currentStatus: orderResult.current_status,
        statusHistory: orderResult.status_history || [],
        totalAmount: orderResult.total_amount,
        shippingAddress: orderResult.shipping_address as unknown as Address,
        items: (orderResult.items as unknown as CartItem[]) || [],
        payment: orderResult.payment,
        customerEmail: (orderResult.profile as any)?.email,
        promotionCode: orderResult.promotion_code,
    };

    if (!order.customerEmail) throw new Error(`Customer email not found for order ${orderId}`);

    // 2. Fetch the 'Order Shipped' Email Template
    console.log('[send-shipping-confirmation] Fetching "Order Shipped" email template.');
    const { data: templateData, error: templateError } = await supabaseAdmin
      .from('mail_templates')
      .select('subject, html_content')
      .eq('name', 'Order Shipped')
      .single();

    if (templateError || !templateData) throw new Error('Could not find the "Order Shipped" email template in the database.');
    console.log('[send-shipping-confirmation] Email template fetched.');

    // 3. Replace all placeholders
    console.log('[send-shipping-confirmation] Replacing placeholders in template.');
    const finalHtml = templateData.html_content
      .replaceAll('{{customer_name}}', order.shippingAddress.name)
      .replaceAll('{{order_id}}', order.id)
      .replaceAll('{{shipping_address}}', `${order.shippingAddress.name}<br>${order.shippingAddress.address}, ${order.shippingAddress.locality}<br>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`)
      .replaceAll('{{tracking_link}}', `${Deno.env.get('SITE_URL') || 'https://awaany.com'}/#/track-order/${order.id}`);

    const finalSubject = templateData.subject.replaceAll('{{order_id}}', order.id);
    console.log('[send-shipping-confirmation] Placeholders replaced.');

    // 4. Send email via SendGrid
    console.log('[send-shipping-confirmation] Preparing to send email via SendGrid.');
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    if (!SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY is not set in function secrets.");
    console.log('[send-shipping-confirmation] SendGrid API Key found.');
    
    const emailPayload = {
      personalizations: [{ to: [{ email: order.customerEmail }] }],
      from: { email: "support@awaany.com", name: "Awaany" },
      subject: finalSubject,
      content: [{ type: 'text/html', value: finalHtml }],
    };
    
    console.log(`[send-shipping-confirmation] Sending email to: ${order.customerEmail}`);
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
        console.error(`[send-shipping-confirmation] SendGrid API Error: ${res.statusText} - ${errorBody}`);
        throw new Error(`SendGrid API error: ${res.statusText} - ${errorBody}`);
    }
    console.log('[send-shipping-confirmation] Email sent successfully via SendGrid.');

    return new Response(JSON.stringify({ message: "Shipping confirmation sent successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("!!! [send-shipping-confirmation] An error occurred in the function !!!");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});