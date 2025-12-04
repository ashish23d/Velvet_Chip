
// ====================================================================
// HOW TO DEPLOY THIS FUNCTION
// ====================================================================
// Supabase Edge Functions CANNOT be created in the Dashboard UI.
// You must use the terminal.
//
// 1. Ensure you are logged in:
//    npx supabase login
//
// 2. Deploy this specific function:
//    npx supabase functions deploy courier-webhook
//
// 3. Set the required secrets (Run this in terminal OR add in Dashboard > Settings > Edge Functions):
//    npx supabase secrets set PROJECT_URL="your_url" SERVICE_ROLE_KEY="your_key"
//
// 4. IMPORTANT: Go to Supabase Dashboard > Edge Functions > courier-webhook
//    and DISABLE "Enforce JWT" so shipping companies can access it publicly.
// ====================================================================

// FIX: Add Deno namespace to fix "Cannot find name 'Deno'"
declare const Deno: any;
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';

// Standardized status map for common courier keywords
const statusMap: Record<string, string> = {
    'picked': 'Shipped',
    'transit': 'In Transit',
    'arrived': 'In Transit',
    'out': 'Out for Delivery',
    'delivered': 'Delivered',
    'returned': 'Return Approved',
    'cancelled': 'Cancelled'
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log(`[courier-webhook] Received ${req.method} request`);

    // Parse payload
    const { tracking_id, status, location, description, timestamp } = await req.json();
    console.log(`[courier-webhook] Payload:`, { tracking_id, status });

    if (!tracking_id || !status) {
        console.error("[courier-webhook] Missing tracking_id or status");
        throw new Error("Missing tracking_id or status in payload");
    }

    // Initialize Admin Client
    const projectUrl = Deno.env.get('PROJECT_URL');
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');
    
    if (!projectUrl || !serviceRoleKey) {
      console.error("[courier-webhook] Missing Secrets");
      throw new Error("Server misconfiguration: Missing PROJECT_URL or SERVICE_ROLE_KEY");
    }

    const supabase = createClient(projectUrl, serviceRoleKey);

    // 1. Find Order by Tracking ID
    const { data: orders, error: findError } = await supabase
        .from('orders')
        .select('id, status_history, current_status')
        .eq('tracking_id', tracking_id);

    if (findError) throw findError;
    
    if (!orders || orders.length === 0) {
        console.error(`[courier-webhook] Order not found for AWB: ${tracking_id}`);
        throw new Error(`Order not found for tracking ID: ${tracking_id}`);
    }

    const order = orders[0];
    console.log(`[courier-webhook] Found Order: ${order.id}`);

    // 2. Determine normalized status
    let newStatus = order.current_status;
    const lowerStatus = status.toLowerCase();
    
    // Simple keyword matching to map courier status to your internal status
    for (const key in statusMap) {
        if (lowerStatus.includes(key)) {
            newStatus = statusMap[key];
            break;
        }
    }
    console.log(`[courier-webhook] Mapped status '${status}' to '${newStatus}'`);

    // 3. Update History
    const newEntry = {
        status: newStatus, // Use normalized status for the main label
        description: description || status, // Use raw status text for description
        location: location || 'Hub',
        timestamp: timestamp || new Date().toISOString()
    };

    const updatedHistory = [...(order.status_history || []), newEntry];

    // 4. Save to DB
    const { error: updateError } = await supabase
        .from('orders')
        .update({ 
            current_status: newStatus,
            status_history: updatedHistory
        })
        .eq('id', order.id);

    if (updateError) throw updateError;

    console.log(`[courier-webhook] Successfully updated order ${order.id}`);

    return new Response(JSON.stringify({ success: true, order_id: order.id, new_status: newStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("[courier-webhook] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
