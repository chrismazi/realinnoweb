# 🚀 YOUR CUSTOM DEPLOYMENT COMMANDS

## Current Status
✅ Supabase CLI: Installed
✅ Settings Column: Already exists
✅ Recurring Function: Already deployed
⏳ Edge Function: Needs deployment

---

## STEP-BY-STEP DEPLOYMENT

### ✅ Step 1: Login to Supabase
Status: Running in background (check your browser)

Command already running: `npx supabase login`

**Action Required:**
1. Check your browser - it should have opened Supabase
2. Click "Authorize" to grant access
3. Return here when done

---

### Step 2: Link Your Project

**Once Step 1 is complete**, run this command:

```bash
npx supabase link --project-ref [YOUR_PROJECT_REF]
```

**To find YOUR_PROJECT_REF:**
- Go to: https://supabase.com/dashboard
- Click on your WellVest project
- Look at the URL bar
- Copy the code after `/project/`

Example URL: `https://supabase.com/dashboard/project/abcdefghijklmnop`
Your ref would be: `abcdefghijklmnop`

---

### Step 3: Deploy the Edge Function

```bash
npx supabase functions deploy gemini-chat
```

This uploads your function to Supabase. Takes about 30 seconds.

---

### Step 4: Set Your Gemini API Key

```bash
npx supabase secrets set GEMINI_API_KEY="YOUR_GEMINI_KEY_HERE"
```

**Note:** Replace `YOUR_GEMINI_KEY_HERE` with your actual Gemini API key.

Your key is in `.env.local` as `VITE_GEMINI_API_KEY`.

---

### Step 5: Verify Everything Works

```bash
node scripts/verify-backend.js
```

Should show: ✅ 4/4 features working!

---

## 🎯 QUICK CHECKLIST

- [ ] Step 1: Login complete (browser authorization done)
- [ ] Step 2: Project linked
- [ ] Step 3: Function deployed
- [ ] Step 4: Secret set
- [ ] Step 5: Verified (4/4 passing)

---

## ⚠️ If You Get Errors

**"Not logged in"**
→ Run: `npx supabase login` again

**"Project not found"**
→ Double-check your project ref from the dashboard URL

**"Permission denied"**
→ Make sure you authorized the CLI in the browser

**"Function already exists"**
→ This is OK! It will update the existing function

---

## 🎉 When Complete

Your app will:
✅ Have settings synced to database
✅ Use secure Edge Function for AI chat
✅ Process recurring transactions automatically
✅ Support push notifications

---

**Let me know when Step 1 (login) is complete and I'll help with the rest!**
