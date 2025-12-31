
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initializes Supabase Client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { templateName, returnId, orderId, email, status, body: extraBody, ...rest } = await req.json();

    console.log(`📧 Sending email via SendGrid: Template="${templateName}", To="${email || 'Default'}"`);

    // 1. Fetch Template from Database
    const { data: template, error: templateError } = await supabase
      .from('mail_templates')
      .select('*')
      .eq('name', templateName)
      .eq('is_active', true)
      .single();

    let htmlContent = '';
    let emailSubject = '';

    if (templateError || !template) {
      console.warn(`⚠️ Template "${templateName}" not found or inactive. Falling back to simple message.`);
      // Fallback
      emailSubject = `Notification: ${templateName}`;
      htmlContent = `<p>Status Update: ${status || 'No status'}</p><p>Order ID: ${orderId || 'N/A'}</p>`;
    } else {
      emailSubject = template.subject || 'Notification';
      htmlContent = template.html_content || '';
    }

    // 1.5 FETCH ORDER DETAILS (Items, Address, Date) if orderId is present
    let itemsHtml = '';
    let addressHtml = '';
    let orderDateFormatted = '';
    let amountPaidFormatted = '';
    let itemTitleSummary = 'Items';

    if (orderId) {
      const { data: orderData } = await supabase
        .from('orders')
        .select('items, total_amount, order_date, shipping_address, payment')
        .eq('id', orderId)
        .single();

      if (orderData) {
        // Format Date
        if (orderData.order_date) {
          const date = new Date(orderData.order_date);
          orderDateFormatted = date.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
        }

        // Format Amount & Payment Label
        const isCOD = orderData.payment?.method === 'cod' || orderData.payment?.method === 'COD';
        const isDelivered = status?.toLowerCase() === 'delivered';

        // Logic: If COD and NOT Delivered -> "Amount to be Paid on Delivery"
        // Else (Prepaid or already Delivered) -> "Total Amount Paid"
        let paymentLabel = 'Total Amount Paid';
        if (isCOD && !isDelivered) {
          paymentLabel = 'Amount to be Paid on Delivery';
        }
        amountPaidFormatted = `Rs. ${orderData.total_amount?.toLocaleString('en-IN') || '0'}`;

        // Format Address
        if (orderData.shipping_address) {
          const addr = orderData.shipping_address;
          addressHtml = `
                <div style="font-size: 14px; color: #333; line-height: 1.6;">
                    <strong style="font-size: 16px;">${addr.name || 'Customer'}</strong><br/>
                    ${addr.address || ''}, ${addr.locality || ''}<br/>
                    ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}<br/>
                    <strong>Phone:</strong> ${addr.phone || 'N/A'}
                </div>
            `;
        }

        // Generate Items Table
        if (orderData.items && orderData.items.length > 0) {
          // Logic for Subject Line: "Product Name & X more"
          const firstItemName = orderData.items[0].name;
          const remainingCount = orderData.items.length - 1;
          if (remainingCount > 0) {
            itemTitleSummary = `${firstItemName} & ${remainingCount} more`;
          } else {
            itemTitleSummary = firstItemName;
          }

          const getPublicUrl = (path: string) => {
            const fullPath = (path && !/\.[^/.]+$/.test(path)) ? `${path}.jpg` : path;
            return supabase.storage.from('products').getPublicUrl(fullPath).data.publicUrl;
          }

          itemsHtml = `
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-family: sans-serif;">
                    ${orderData.items.map((item: any) => `
                        <tr>
                            <td style="padding: 15px 0; border-bottom: 1px solid #eee; width: 60px; vertical-align: top;">
                                <img src="${getPublicUrl(item.image)}" alt="${item.name}" width="60" height="auto" style="border-radius: 4px; object-fit: cover;" />
                            </td>
                            <td style="padding: 15px 10px; border-bottom: 1px solid #eee; vertical-align: top;">
                                <div style="font-weight: 500; font-size: 14px; color: #333; margin-bottom: 4px;">${item.name}</div>
                                <div style="font-size: 12px; color: #777; line-height: 1.4;">
                                    Size: ${item.size} <br/>
                                    Qty: ${item.quantity}
                                </div>
                            </td>
                            <td style="padding: 15px 0; border-bottom: 1px solid #eee; text-align: right; vertical-align: top; font-weight: 600; font-size: 14px; color: #333;">
                                Rs. ${(item.price * item.quantity).toLocaleString('en-IN')}
                            </td>
                        </tr>
                    `).join('')}
                    <tr>
                        <td colspan="2" style="padding-top: 15px; text-align: right; font-size: 14px; color: #555;">${paymentLabel}</td>
                        <td style="padding-top: 15px; text-align: right; font-size: 16px; font-weight: bold; color: #333;">${amountPaidFormatted}</td>
                    </tr>
                </table>`;
        }
      }
    }

    // 2. Prepare Replacements
    const replacements: Record<string, string> = {
      '{{order_id}}': orderId ? orderId.toString().slice(0, 8) : '',
      '{{full_order_id}}': orderId || '',
      '{{status}}': status || '',
      '{{return_id}}': returnId || '',
      '{{reason}}': rest.reason || '',
      '{{user_name}}': rest.userName || 'Customer',
      '{{items_summary}}': itemsHtml || rest.itemsSummary || '',
      '{{tracking_id}}': rest.trackingId || '',
      '{{courier_name}}': rest.courierName || '',
      '{{shipping_address_html}}': addressHtml || 'Address not available',
      '{{order_date}}': orderDateFormatted || '',
      '{{amount_paid}}': amountPaidFormatted || '',
      '{{item_title_summary}}': itemTitleSummary || 'Order'
    };

    // 3. Perform Replacement on Subject and Body
    // Replace all occurrences
    Object.keys(replacements).forEach(key => {
      const value = replacements[key];
      // Regex to replace all instances globally
      const regex = new RegExp(key, 'g');
      emailSubject = emailSubject.replace(regex, value);
      htmlContent = htmlContent.replace(regex, value);
    });

    // 4. Send Email via SendGrid
    const recipient = email || 'velvetchip2025@gmail.com'; // Fallback for dev/testing
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

    if (!SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY is missing from environment variables");
    }

    // 5. FETCH SENDER IDENTITY FROM DATABASE
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
      console.warn("Could not fetch email settings, using defaults.", err);
    }

    console.log(`📤 Sending to ${recipient} with subject "${emailSubject}"`);
    console.log(`📤 From: "${senderName}" <${senderEmail}>`);

    const emailPayload = {
      personalizations: [{
        to: [{ email: recipient }],
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

    console.log('✅ Email sent successfully via SendGrid.');

    return new Response(JSON.stringify({ message: "Email sent successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("❌ Email Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});