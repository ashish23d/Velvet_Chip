# Deploying the Generate Invoice Function

This guide explains how to deploy the `generate-invoice` Edge Function to your Supabase project and configure it correctly.

### Prerequisites

1.  **Supabase CLI:** You must have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed on your machine.
2.  **Logged In:** You should be logged into the Supabase CLI using `supabase login`.
3.  **Project Linked:** Your local project should be linked to your Supabase project using `supabase link --project-ref <your-project-ref>`.

---

### Step 1: Deploy the Function

Open your terminal in the root directory of your project and run the following command.

```bash
supabase functions deploy generate-invoice
```

This command bundles and deploys the function to your Supabase project.

---

### Step 2: Set Environment Variables (Secrets)

The Edge Function needs two critical pieces of information to connect to your database with admin privileges. You must set these as secrets in your Supabase project dashboard.

1.  **Navigate to your Supabase Project Dashboard.**
2.  Go to **Settings** (the gear icon in the left sidebar).
3.  Click on **Edge Functions**.
4.  Under the "Secrets" section, add two new secrets:

    *   **Secret 1:**
        *   **Name:** `PROJECT_URL`
        *   **Value:** Your project's URL (e.g., `https://kkmqanhkffyllsmutllw.supabase.co`). You can find this in your project's **API Settings**.

    *   **Secret 2:**
        *   **Name:** `SERVICE_ROLE_KEY`
        *   **Value:** Your project's `service_role` key. **Important:** This key bypasses all Row Level Security policies. Keep it secret. You can find this in your project's **API Settings** (you may need to click "Show" to reveal it).

---

### Step 3: Verify

Once the function is deployed and the secrets are set, you can verify it's working:
1.  Go to your application's **Admin Panel**.
2.  Navigate to the **Orders** page.
3.  Find an order without an invoice and click the **"Generate"** button.

If successful, the button will turn into a loading state and then be replaced by links to view the invoice and print the label. If you encounter any errors, check the function's logs in the Supabase dashboard (Edge Functions > `generate-invoice` > Logs).
