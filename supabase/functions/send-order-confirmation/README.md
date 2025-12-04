# Deploying the Send Order Confirmation Function

This guide explains how to deploy the `send-order-confirmation` Edge Function and configure it to send emails via SendGrid.

### Prerequisites

1.  **Supabase CLI:** You must have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed.
2.  **Logged In & Linked:** You should be logged into the Supabase CLI (`supabase login`) and have your local project linked (`supabase link`).
3.  **SendGrid Account:** You need a SendGrid account with a verified sender email and an API key.

---

### Step 1: Deploy the Function

Open your terminal in the root directory of your project and run:

```bash
supabase functions deploy send-order-confirmation
```

---

### Step 2: Set Environment Variables (Secrets)

This function requires several secrets to operate correctly.

1.  Navigate to your **Supabase Project Dashboard**.
2.  Go to **Edge Functions**, select the **`send-order-confirmation`** function.
3.  Go to the **Secrets** tab.
4.  Add the following secrets:

    *   **`PROJECT_URL`**: Your project's URL (e.g., `https://kkmqanhkffyllsmutllw.supabase.co`).
    *   **`SERVICE_ROLE_KEY`**: Your project's `service_role` key (found in API settings).
    *   **`SENDGRID_API_KEY`**: The API key you generated in your SendGrid account. This key needs **Mail Send** permissions.
    *   **`SITE_URL`**: The public URL of your website (e.g., `https://www.awaany.com`). This is used to create correct links in the emails.

---

### Step 3: Verify

Once deployed with the secrets set, place a test order on your website. You should receive the formatted "Order Successful" email in the customer's inbox. If not, check the function's logs in the Supabase dashboard.