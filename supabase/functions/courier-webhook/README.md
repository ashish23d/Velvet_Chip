
# Courier Tracking Webhook

This Edge Function acts as a listener for shipping partners (like FedEx, Delhivery, or aggregators like Shiprocket). It receives real-time tracking updates and automatically updates the order status in your Supabase database.

## Deployment

1.  **Navigate to Project Root:**
    Open your terminal and `cd` to your project folder (the one containing the `supabase` folder).
    *   Example: `cd Documents/MyProject`

2.  **Deploy the function:**
    ```bash
    npx supabase functions deploy courier-webhook
    ```

3.  **Set Secrets:**
    This function requires admin privileges to update orders without a user session. Go to your Supabase Dashboard > Settings > Edge Functions and set the following secrets:
    *   `PROJECT_URL`: Your Supabase Project URL.
    *   `SERVICE_ROLE_KEY`: Your Supabase Service Role Key (found in API settings).

## Troubleshooting

### Error: "The system cannot find the path specified" or "Entrypoint path does not exist"
This error happens if you run the command from the wrong folder (e.g., `C:\Users\Admin`).
*   **Fix:** Use the `cd` command to go to your project folder first.
*   **Verify:** Type `dir` (Windows) or `ls` (Mac/Linux). You should see the `supabase` folder in the list. Then try the deploy command again.

## Integration

Give the function URL to your shipping partner or configure it in your shipping dashboard settings.

**URL Format:**
`https://[your-project-ref].supabase.co/functions/v1/courier-webhook`

## Payload Format

The function expects a JSON POST request in the following format:

```json
{
  "tracking_id": "AWB123456789",
  "status": "Out for Delivery",
  "location": "Mumbai Hub",
  "description": "Package is out for delivery",
  "timestamp": "2023-10-27T14:30:00Z"
}
```

### Status Mapping
The function automatically maps common courier statuses to your internal `OrderStatus`:

*   "Picked Up" -> **Shipped**
*   "In Transit" / "Arrived" -> **In Transit**
*   "Out for Delivery" -> **Out for Delivery**
*   "Delivered" -> **Delivered**
*   "RTO" / "Returned" -> **Return Approved**
