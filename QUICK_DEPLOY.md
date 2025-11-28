# 🎯 Quick Deployment Reference

## ⚡ Fast Track Deployment (5 Minutes)

### 1. Edge Function (2 min)
```bash
npx supabase login
npx supabase link --project-ref YOUR_REF
npx supabase functions deploy gemini-chat
npx supabase secrets set GEMINI_API_KEY=your_key
```

### 2. Database Migration (1 min)
- Dashboard → SQL Editor → New Query
- Paste `supabase/recurring_logic.sql`
- Run ✅

### 3. Verify (2 min)
```bash
# Test Edge Function
npx supabase functions invoke gemini-chat --body '{"history":[],"newMessage":"hi"}'

# In app: Profile → Toggle Dark Mode → Check Supabase profiles table
```

---

## 🧪 Quick Test Commands

### Test Settings Sync
```sql
-- In Supabase SQL Editor
SELECT id, email, settings FROM profiles;
-- Look for settings JSON with your preferences
```

### Test Edge Function
```bash
npx supabase functions invoke gemini-chat \
  --body '{"history":[],"newMessage":"Are you working?"}'
```

### Test Recurring Function
```sql
-- In Supabase SQL Editor
SELECT process_recurring_transactions();
-- Should return 'void' (means it ran successfully)
```

---

## 📍 Where Everything Is

| Feature | Code Location | Deploy Location |
|---------|--------------|-----------------|
| Settings Sync | `components/Profile.tsx` | Auto (already in app) |
| Gemini Edge Fn | `supabase/functions/gemini-chat/` | Supabase Edge Functions |
| Recurring Logic | `supabase/recurring_logic.sql` | Supabase SQL Editor |
| Notifications | `public/sw.js` | Auto (already in app) |

---

## 🔍 How to Verify Each Feature

### ✅ Settings Sync
1. App → Profile → Toggle Dark Mode
2. Supabase → Table Editor → profiles → Your row
3. Check `settings` column has: `{"darkMode": true, ...}`

### ✅ Gemini Chat
1. App → Wellness → Mental Health Chat
2. Send: "Hello"
3. Receive AI response
4. Browser Network tab shows `gemini-chat` call (not direct Gemini API)

### ✅ Recurring Transactions
1. Supabase SQL Editor:
```sql
-- Insert test
INSERT INTO transactions (user_id, title, category, amount, date, type, icon, color, is_recurring, recurring_frequency, next_recurring_date)
VALUES (auth.uid(), 'Test', 'bills', 10, NOW(), 'expense', '💳', '#ef4444', true, 'monthly', NOW() - INTERVAL '1 day');

-- Process
SELECT process_recurring_transactions();

-- Check
SELECT * FROM transactions WHERE title = 'Test' ORDER BY created_at DESC;
-- Should see 2 rows: template + new instance
```

### ✅ Notifications
1. App → Profile → Notifications toggle
2. Browser shows permission prompt
3. Console: "Service Worker registered"

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "settings column doesn't exist" | `ALTER TABLE profiles ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;` |
| "function gemini-chat not found" | Run: `npx supabase functions deploy gemini-chat` |
| "GEMINI_API_KEY not set" | Run: `npx supabase secrets set GEMINI_API_KEY=your_key` |
| "process_recurring_transactions not found" | Run `recurring_logic.sql` in SQL Editor |

---

## 📞 Support Files

- **Full Guide:** `TESTING_DEPLOYMENT_GUIDE.md`
- **Summary:** `BACKEND_IMPLEMENTATION_SUMMARY.md`
- **Next Steps:** `NEXT_STEPS.md`
- **Deploy Script:** `scripts/deploy-backend.sh`

---

## ⏱️ Time Estimates

- Settings Sync: 0 min (already working)
- Edge Function Deploy: 2 min
- SQL Migration: 1 min
- Testing All: 5 min
- **Total: ~8 minutes**

---

## 🎉 When You're Done

All 4 backend features will be:
✅ Secure (API key hidden)
✅ Persistent (settings in DB)
✅ Automated (recurring transactions)
✅ Ready (notifications infrastructure)

Start with Edge Function → then SQL Migration → then test! 🚀
