// FIX: Add Deno namespace to fix "Cannot find name 'Deno'" and type resolution errors in non-Deno environments.
declare const Deno: any;
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';
import type { ReturnRequestStatus, ReturnStatusUpdate, Notification, CartItem } from './types.ts';

// Helper to add notification using service role
async function addNotification(supabaseAdmin: SupabaseClient, userId: string, notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const { data: profile } = await supabaseAdmin.from('profiles').select('notifications').eq('id', userId).single();
    if (!profile) {
      console.warn(`[admin-action] Profile not found for user ${userId}, cannot add notification.`);
      return;
    }

    const currentNotifications = profile.notifications || [];
    const newNotification: Notification = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        read: false,
        ...notification
    };

    const { error } = await supabaseAdmin.from('profiles').update({ notifications: [newNotification, ...currentNotifications] }).eq('id', userId);
    if (error) {
        console.error(`[admin-action] Failed to add notification for user ${userId}:`, error);
        throw error;
    }
}


serve(async (req) => {
  console.log(`[admin-action] Function invoked with method: ${req.method}`);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Initialize Supabase client with Admin privileges
    // Correctly reference Deno environment variables with proper types
    const projectUrl = Deno.env.get('PROJECT_URL');
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');

    if (!projectUrl || !serviceRoleKey) {
        console.error("[admin-action] Error: Missing PROJECT_URL or SERVICE_ROLE_KEY secrets.");
        throw new Error("Supabase credentials are not configured correctly in function secrets.");
    }
    const supabaseAdmin = createClient(projectUrl, serviceRoleKey);
    console.log("[admin-action] Supabase admin client created.");

    // 2. Check if the calling user is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');
    
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) throw new Error('Invalid token');

    const { data: adminProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    if (profileError || adminProfile?.role !== 'admin') {
        throw new Error('Unauthorized: User is not an admin.');
    }
    console.log(`[admin-action] Verified admin user: ${user.email}`);
    
    // 3. Process the action
    const { action, payload } = await req.json();

    if (action === 'UPDATE_RETURN_STATUS') {
      console.log(`[admin-action] Processing action: UPDATE_RETURN_STATUS for returnId: ${payload.returnId}`);
      const { returnId, status } = payload;
      if (!returnId || !status) throw new Error("Missing returnId or status in payload.");

      // Step 3.1: Fetch current history to append to it.
      const { data: currentReturn, error: fetchError } = await supabaseAdmin
          .from('returns')
          .select('status_history, user_id, item_id, order_id')
          .eq('id', returnId)
          .single();
      
      if (fetchError) throw fetchError;
      if (!currentReturn) throw new Error(`Return request ${returnId} not found.`);

      // Step 3.2: Prepare the update payload
      const newHistoryEntry: ReturnStatusUpdate = {
          status: status,
          timestamp: new Date().toISOString(),
          description: `Status updated to "${status}" by admin.`
      };
      const newHistory = [...(currentReturn.status_history || []), newHistoryEntry];
      
      const updatePayload = {
          status: status,
          status_history: newHistory
      };

      // Step 3.3: Perform the update and select the rich data in one go.
      const { data: updatedReturnRequest, error: updateError } = await supabaseAdmin
          .from('returns')
          .update(updatePayload)
          .eq('id', returnId)
          .select('*, order:orders(*, profile:profiles(id,name,email)), user:profiles(id,name,email)')
          .single();

      if (updateError) {
          console.error(`[admin-action] DB update failed for return ${returnId}:`, updateError);
          throw updateError;
      }
      if (!updatedReturnRequest) {
          throw new Error('Failed to update and retrieve the return record.');
      }
      console.log(`[admin-action] Successfully updated and fetched return ${returnId}`);
      
      // Step 3.4: Send notification (wrapped in try/catch to not fail the whole request)
      try {
          const orderItems = updatedReturnRequest.order?.items as CartItem[] | undefined;
          const item = orderItems?.find((i: CartItem) => i.id === currentReturn.item_id);
          const productName = item?.product?.name || 'your item';

          await addNotification(supabaseAdmin, currentReturn.user_id, {
              type: 'return',
              title: `Return Status: ${status}`,
              message: `Your return for "${productName}" is now ${status}.`,
              link: `/profile`
          });
          console.log(`[admin-action] Notification sent to user ${currentReturn.user_id}`);
      } catch (notificationError) {
          console.error(`[admin-action] Failed to send notification for return ${returnId}, but status was updated successfully. Error:`, notificationError.message);
      }

      // Step 3.5: Return the rich data to the client
      return new Response(JSON.stringify({ success: true, data: updatedReturnRequest }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
      });
    }


    throw new Error(`Unknown action: ${action}`);

  } catch (error) {
    console.error("!!! [admin-action] An error occurred in the function !!!");
    console.error("Error message:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
