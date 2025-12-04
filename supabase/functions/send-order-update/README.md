# Deploying the Send Order Update Function

This guide explains how to deploy the `send-order-update` Edge Function and configure it to send emails via SendGrid when an order's status is updated by an admin.

### Prerequisites

1.  **Supabase CLI:** You must have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed.
2.  **Logged In & Linked:** Your local project should be linked to your Supabase project (`supabase link`).
3.  **SendGrid Account:** You need a SendGrid account with a verified sender email and an API key.

---

### Step 1: Deploy the Function

Open your terminal in the root directory of your project and run:

```bash
supabase functions deploy send-order-update
```

---

### Step 2: Set Environment Variables (Secrets)

This function requires the same secrets as the other email functions to operate correctly.

1.  Navigate to your **Supabase Project Dashboard**.
2.  Go to **Settings** (the gear icon) > **Edge Functions**.
3.  Ensure the following secrets are set. If you've set them for other functions, they will be available to this one as well.

    *   `PROJECT_URL`: Your project's URL (e.g., `https://kkmqanhkffyllsmutllw.supabase.co`).
    *   `SERVICE_ROLE_KEY`: Your project's `service_role` key (from API settings).
    *   `SENDGRID_API_KEY`: Your API key from SendGrid with **Mail Send** permissions.
    *   `SITE_URL`: The public URL of your website (e.g., `https://www.awaany.com`).

---

### Step 3: Verify

Once deployed, go to your application's **Admin Panel** > **Orders**. Change an order's status (e.g., from "Shipped" to "Out for Delivery"). The customer associated with that order should receive an update email, provided a template exists for that status change. If not, check the function's logs in the Supabase dashboard.
