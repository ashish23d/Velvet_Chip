# Deploying the Admin Action Function

This guide explains how to deploy the `admin-action` Edge Function and configure it correctly. This function is designed to handle various administrative tasks securely.

### Prerequisites

1.  **Supabase CLI:** You must have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed on your machine.
2.  **Logged In & Linked:** Your local project should be linked to your Supabase project using `supabase link`.

---

### Step 1: Deploy the Function

Open your terminal in the root directory of your project and run the following command.

```bash
supabase functions deploy admin-action
```

This command bundles and deploys the function to your Supabase project.

---

### Step 2: Set Environment Variables (Secrets)

The Edge Function needs secrets to connect to your database with admin privileges.

1.  **Navigate to your Supabase Project Dashboard.**
2.  Go to **Settings** > **Edge Functions**.
3.  Under the "Secrets" section, ensure the following secrets are added. If you have set them for other functions, they will already be available.

    *   **Secret 1:**
        *   **Name:** `PROJECT_URL`
        *   **Value:** Your project's URL (e.g., `https://kkmqanhkffyllsmutllw.supabase.co`). Find this in your project's **API Settings**.

    *   **Secret 2:**
        *   **Name:** `SERVICE_ROLE_KEY`
        *   **Value:** Your project's `service_role` key. **Important:** This key bypasses all Row Level Security policies. Keep it secret. Find this in your project's **API Settings**.

---

### Step 3: Verify

Once the function is deployed and the secrets are set, you can verify it's working:
1.  Go to your application's **Admin Panel**.
2.  Navigate to the **Returns** page.
3.  Find a pending return request and click "Approve" or "Reject".

The status should update in the list, and the user should receive a notification. If you encounter any errors, check the function's logs in the Supabase dashboard (Edge Functions > `admin-action` > Logs).