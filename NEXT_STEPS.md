# Next Steps for Backend Implementation

You have successfully implemented the code changes. To make everything work in production, please follow these steps:

## 1. Secure Gemini API (Edge Function)

1.  **Deploy the Function**:
    Run the following command in your terminal to deploy the new Edge Function:
    ```bash
    npx supabase functions deploy gemini-chat
    ```

2.  **Set Environment Variables**:
    Set your Gemini API key as a secret for the Edge Function:
    ```bash
    npx supabase secrets set GEMINI_API_KEY=your_actual_api_key_here
    ```

## 2. Recurring Transactions

1.  **Run SQL Migration**:
    - Go to your Supabase Dashboard -> SQL Editor.
    - Open the file `supabase/recurring_logic.sql` from this project.
    - Copy the content and run it in the SQL Editor. This will create the necessary columns and the `process_recurring_transactions` function.

2.  **Schedule the Job**:
    - If you have `pg_cron` enabled (available on Pro plans or self-hosted), run this SQL to schedule the job daily:
      ```sql
      SELECT cron.schedule('0 0 * * *', $$SELECT process_recurring_transactions()$$);
      ```
    - Alternatively, you can call this function manually or via an external cron service (like GitHub Actions or a simple script) by calling the Supabase RPC API:
      ```javascript
      await supabase.rpc('process_recurring_transactions')
      ```

## 3. Notifications

1.  **VAPID Keys**:
    - To fully enable Push Notifications, you need to generate VAPID keys.
    - Update `services/notificationService.ts` with your public key.
    - Implement the backend logic to store the subscription in the `profiles` table (the code currently has a placeholder for this).

## 4. User Settings

- The settings sync is now active. Any change made in the Profile page (Dark Mode, Notifications toggle) is automatically saved to the `profiles` table in Supabase.
