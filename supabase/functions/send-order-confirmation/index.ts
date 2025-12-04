// FIX: Add Deno namespace to fix "Cannot find name 'Deno'" and type resolution errors in non-Deno environments.
declare const Deno: any;
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';
import type { Order, MailTemplate, CartItem } from './types.ts';

serve(async (req) => {
  console.log(`[send-order-confirmation] Function invoked with method: ${req.method}`);

  if (req.method === 'OPTIONS') {
    console.log('[send-order-confirmation] Handling OPTIONS request.');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[send-order-confirmation] Attempting to parse request body.');
    const { orderId } = await req.json();
    console.log(`[send-order-confirmation] Successfully parsed orderId: ${orderId}`);

    if (!orderId) {
      console.error('[send-order-confirmation] Error: Order ID is missing from the request body.');
      throw new Error("Order ID is required.");
    }

    // Correctly reference Deno environment variables with proper types
    const projectUrl = Deno.env.get('PROJECT_URL');
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');

    if (!projectUrl || !serviceRoleKey) {
        console.error("[send-order-confirmation] Error: Missing PROJECT_URL or SERVICE_ROLE_KEY secrets.");
        throw new Error("Supabase credentials are not configured correctly in function secrets.");
    }
    console.log("[send-order-confirmation] Supabase credentials found.");

    const supabaseAdmin = createClient(projectUrl, serviceRoleKey);
    console.log("[send-order-confirmation] Supabase admin client created.");
    
    // 1. Fetch Order and User data
    console.log(`[send-order-confirmation] Fetching order data for orderId: ${orderId}`);
    const { data: orderResult, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, profile:profiles(email)')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;
    console.log('[send-order-confirmation] Order data fetched successfully.');
    
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
      customerName: orderResult.shipping_address.name, // Good enough fallback
      promotionCode: orderResult.promotion_code,
    };

    if (!order.customerEmail) {
        console.error(`[send-order-confirmation] No customer email found for order ${orderId}.`);
        throw new Error(`Customer email not found for order ${orderId}`);
    }

    // 2. Fetch the Email Template
    console.log('[send-order-confirmation] Fetching "Order Successful" email template.');
    const { data: templateData, error: templateError } = await supabaseAdmin
      .from('mail_templates')
      .select('subject, html_content')
      .eq('name', 'Order Successful')
      .single();

    if (templateError || !templateData) throw new Error('Could not find "Order Successful" email template.');
    console.log('[send-order-confirmation] Email template fetched.');

    // 3. Dynamically generate the item list HTML
    console.log('[send-order-confirmation] Generating item list HTML.');
    const getPublicUrl = (path: string) => {
      // Add .jpg for legacy placeholders without extension
      const fullPath = (path && !/\.[^/.]+$/.test(path)) ? `${path}.jpg` : path;
      return supabaseAdmin.storage.from('products').getPublicUrl(fullPath).data.publicUrl;
    }

    const itemsHtml = `<tbody>${order.items.map((item: CartItem) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; display: flex; align-items: center;">
          <img src="${getPublicUrl(item.product.images[0])}" alt="${item.product.name}" width="50" style="border-radius: 4px; margin-right: 10px;" />
          <div>
            <strong style="font-size: 13px;">${item.product.name}</strong>
            <div style="font-size: 11px; color: #666;">
              Size: ${item.selectedSize} | Color: ${item.selectedColor.name}
            </div>
          </div>
        </td>
        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right; font-weight: bold;">₹${(item.product.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `).join('')}</tbody>`;
    console.log('[send-order-confirmation] Item list HTML generated.');
    
    // 4. Replace all placeholders
    console.log('[send-order-confirmation] Replacing placeholders in template.');
    const subtotal = order.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const shipping = subtotal > 499 ? 0 : 50;
    const promoDiscount = order.promotionCode ? (subtotal + shipping - order.totalAmount) : 0;
    
    let finalHtml = templateData.html_content
      .replaceAll('{{customer_name}}', order.shippingAddress.name)
      .replaceAll('{{order_id}}', order.id)
      .replaceAll('{{order_date}}', new Date(order.orderDate).toLocaleDateString())
      .replaceAll('{{total_amount}}', `₹${order.totalAmount.toLocaleString('en-IN')}`)
      .replaceAll('{{shipping_address}}', `${order.shippingAddress.name}<br>${order.shippingAddress.address}, ${order.shippingAddress.locality}<br>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`)
      .replaceAll('{{tracking_link}}', `${Deno.env.get('SITE_URL') || 'https://awaany.com'}/#/track-order/${order.id}`)
      .replaceAll('{{payment_method}}', order.payment.method)
      .replaceAll('{{item_list_table}}', itemsHtml)
      .replaceAll('{{subtotal}}', `₹${subtotal.toLocaleString('en-IN')}`)
      .replaceAll('{{shipping_fee}}', shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`)
      .replaceAll('{{discount_amount}}', `₹${promoDiscount.toLocaleString('en-IN')}`);

    const finalSubject = templateData.subject.replaceAll('{{order_id}}', order.id);
    console.log('[send-order-confirmation] Placeholders replaced.');

    // 5. Send email via SendGrid
    console.log('[send-order-confirmation] Preparing to send email via SendGrid.');
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    if (!SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY is not set in function secrets.");
    console.log('[send-order-confirmation] SendGrid API Key found.');
    
    const emailPayload = {
      personalizations: [{
        to: [{ email: order.customerEmail }],
        subject: finalSubject,
      }],
      from: { email: "support@awaany.com", name: "Awaany" },
      content: [{
        type: 'text/html',
        value: finalHtml,
      }],
    };

    console.log(`[send-order-confirmation] Sending email to: ${order.customerEmail}`);
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
        console.error(`[send-order-confirmation] SendGrid API Error: ${res.statusText} - ${errorBody}`);
        throw new Error(`SendGrid API error: ${res.statusText} - ${errorBody}`);
    }
    console.log('[send-order-confirmation] Email sent successfully via SendGrid.');

    return new Response(JSON.stringify({ message: "Email sent successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("!!! [send-order-confirmation] An error occurred in the function !!!");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});