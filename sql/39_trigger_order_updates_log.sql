-- Trigger Function: Log Order Status Changes to Profile
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_title text;
    v_message text;
    v_json_entry jsonb;
    v_item_names text;
BEGIN
    -- Only proceed if status is actually changed
    IF OLD.current_status IS DISTINCT FROM NEW.current_status THEN
        
        -- Determine Message based on status
        v_title := 'Order Update';
        v_message := 'Your order status has changed to ' || NEW.current_status;

        IF NEW.current_status = 'processing' THEN
            v_title := 'Order Processing';
            v_message := 'We are packing your order! 📦';
        ELSIF NEW.current_status = 'shipped' THEN
            v_title := 'Order Shipped';
            v_message := 'Your order is on the way! 🚚';
        ELSIF NEW.current_status = 'delivered' THEN
            v_title := 'Order Delivered';
            v_message := 'Your order has arrived! 🎉';
        ELSIF NEW.current_status = 'cancelled' THEN
            v_title := 'Order Cancelled';
            v_message := 'Your order has been cancelled.';
        END IF;

        -- Construct JSON Entry
        -- We include timestamp and 'read': false (though 'read' is managed locally usually, 
        -- putting it here helps if we ever sync it).
        v_json_entry := jsonb_build_object(
            'title', v_title,
            'message', v_message,
            'order_id', NEW.id,
            'status', NEW.current_status,
            'timestamp', now(),
            'item_count', jsonb_array_length(NEW.items)
        );

        -- Update the user's profile by prepending the new log entry
        -- We append to the BEGINNING of the array (conceptually) or end? 
        -- profiles.updates || v_json_entry appends to end.
        -- jsonb_build_array(v_json_entry) || profiles.updates prepends.
        -- Let's append (default) and frontend can reverse, OR prepend.
        -- Prepending is better for JSON arrays if we limit size.
        
        -- Use the helper function if available, or direct update
        -- Direct update is safer for a trigger.
        UPDATE public.profiles
        SET updates = updates || v_json_entry
        WHERE id = NEW.user_id;
        
    END IF;
    RETURN NEW;
END;
$$;

-- Create Trigger
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
CREATE TRIGGER on_order_status_change
AFTER UPDATE OF current_status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_order_status_change();
