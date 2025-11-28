# Backend Testing & Deployment Guide

## ✅ What We've Implemented

### 1. **User Settings Sync** (Ready to Test)
- Profile settings now sync to Supabase `profiles.settings` column
- Changes to Dark Mode, Notifications, and Biometrics are automatically saved

### 2. **Secure Gemini API** (Requires Deployment)
- Edge Function created: `supabase/functions/gemini-chat/index.ts`
- Frontend updated to use Edge Function instead of exposing API key

### 3. **Recurring Transactions** (Requires SQL Migration)
- SQL migration: `supabase/recurring_logic.sql`
- Automated function to process recurring transactions

### 4. **Push Notifications** (Ready to Test)
- Service Worker: `public/sw.js`
- Notification service with permission handling

---

## 🧪 Testing Guide

### Test 1: User Settings Sync

**Status:** ✅ Ready to test in the app

**Steps:**
1. Start your app: `npm run dev`
2. Open http://localhost:3000
3. Log in or create an account
4. Navigate to Profile page
5. Toggle any setting (Dark Mode, Notifications, Face ID)
6. Open Supabase Dashboard → Table Editor → `profiles`
7. Find your user row and check the `settings` column
8. You should see a JSON object with your preferences!

**Example settings JSON:**
```json
{
  "darkMode": true,
  "notifications": true,
  "biometrics": false,
  "language": "en",
  "currency": "USD"
}
```

### Test 2: Push Notifications Permission

**Status:** ✅ Ready to test in the app

**Steps:**
1. In the app, go to Profile
2. Click the "Push Notifications" toggle
3. Your browser should show a permission prompt
4. Accept the permission
5. Check browser console - you should see "Service Worker registered"

**Note:** Full push notifications require VAPID keys (see deployment steps below)

### Test 3: Gemini Edge Function (Requires Deployment)

**Prerequisites:**
- Supabase CLI installed: `npm install -g supabase`
- Gemini API key

**Deployment Steps:**
```bash
# 1. Login to Supabase
npx supabase login

# 2. Link your project
npx supabase link --project-ref YOUR_PROJECT_REF

# 3. Deploy the Edge Function
npx supabase functions deploy gemini-chat

# 4. Set the Gemini API key as a secret
npx supabase secrets set GEMINI_API_KEY=your_actual_gemini_api_key_here

# 5. Test the function
npx supabase functions invoke gemini-chat --body '{"history":[],"newMessage":"Hello, test!"}'
```

**After Deployment - Test in App:**
1. Go to Wellness → Mental Health Chat
2. Send a message
3. The AI should respond (now using the secure Edge Function)
4. Check browser Network tab - you should see a call to `gemini-chat` function

### Test 4: Recurring Transactions

**Status:** ⚠️ Requires SQL Migration

**Deployment Steps:**

1. **Run the migration:**
   - Open Supabase Dashboard → SQL Editor
   - Click "New Query"
   - Copy contents of `supabase/recurring_logic.sql`
   - Paste and click "Run"
   - Look for "Success. No rows returned" message

2. **Verify columns exist:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'transactions' 
   AND column_name IN ('recurring_frequency', 'next_recurring_date');
   ```

3. **Test with dummy data:**
   ```sql
   -- Insert a test recurring transaction
   INSERT INTO transactions (
     user_id, 
     title, 
     category, 
     amount, 
     date, 
     type, 
     icon, 
     color, 
     is_recurring, 
     recurring_frequency, 
     next_recurring_date
   ) VALUES (
     (SELECT id FROM auth.users LIMIT 1), -- Your user ID
     'Test Subscription',
     'bills',
     9.99,
     NOW(),
     'expense',
     '💳',
     '#ef4444',
     true,
     'monthly',
     NOW() - INTERVAL '1 day' -- Make it due yesterday
   );

   -- Run the processing function
   SELECT process_recurring_transactions();

   -- Check if new transaction was created
   SELECT * FROM transactions 
   WHERE title = 'Test Subscription' 
   ORDER BY created_at DESC;
   ```

4. **Schedule automatic processing (Optional - requires Pro plan):**
   ```sql
   -- Run daily at midnight
   SELECT cron.schedule(
     'process-recurring-transactions',
     '0 0 * * *',
     $$SELECT process_recurring_transactions()$$
   );
   ```

---

## 🚀 Quick Start Checklist

- [x] Code implemented and built successfully
- [ ] User logged in to app
- [ ] Settings sync tested (Profile toggles)
- [ ] Notifications permission requested
- [ ] Edge Function deployed
- [ ] GEMINI_API_KEY secret set
- [ ] Recurring transactions SQL migration run
- [ ] Mental health chat tested with new Edge Function

---

## 📝 Manual Testing Checklist

### Settings Sync
- [ ] Change Dark Mode → settings column updates
- [ ] Toggle Notifications → settings column updates
- [ ] Toggle Face ID → settings column updates
- [ ] Logout and login → settings persist

### Gemini Chat (After Edge Function Deployment)
- [ ] Send message in Mental Health Chat
- [ ] Receive AI response
- [ ] No API key visible in browser Network tab
- [ ] Check Supabase Logs → Edge Function shows in logs

### Recurring Transactions (After SQL Migration)
- [ ] Create recurring transaction in app
- [ ] Set next_recurring_date to yesterday
- [ ] Run process_recurring_transactions()
- [ ] New transaction instance created
- [ ] Original template's next_recurring_date updated

### Notifications
- [ ] Permission prompt appears
- [ ] Service Worker registers
- [ ] Console shows registration successful

---

## 🐛 Troubleshooting

### "Settings column doesn't exist"
Run this SQL:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
```

### "Edge Function not found"
Make sure you've deployed it:
```bash
npx supabase functions deploy gemini-chat
```

### "GEMINI_API_KEY not set"
Set the secret:
```bash
npx supabase secrets set GEMINI_API_KEY=your_key
```

### "process_recurring_transactions does not exist"
Run the `supabase/recurring_logic.sql` migration in SQL Editor.

---

## 📞 Next Steps

1. **Now:** Test Settings Sync in the app
2. **Deploy:** Edge Function for secure Gemini API
3. **Migrate:** Run recurring_logic.sql
4. **Advanced:** Set up VAPID keys for full push notifications

All backend features are code-complete and ready for deployment! 🎉
