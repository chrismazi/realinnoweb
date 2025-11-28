# 🚀 Quick Deployment Guide - Go Live in 10 Minutes!

## Option 2: Production Deployment - Step by Step

### Prerequisites ✅
- [x] Code is ready (all features built)
- [x] Backend deployed (Supabase Edge Functions working)
- [x] Local testing complete
- [ ] Vercel account (free) - Create at https://vercel.com/signup

---

## 🎯 Deployment Steps (10 minutes)

### Step 1: Install Vercel CLI (2 minutes)

```powershell
# In PowerShell
npm install -g vercel
```

### Step 2: Build Production Bundle (1 minute)

```powershell
npm run build
```

**Expected Output:**
```
✓ built in 3.78s
dist/index.html
dist/assets/...
```

### Step 3: Deploy to Vercel (2 minutes)

```powershell
# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# When prompted:
# - Set up and deploy? Yes
# - Which scope? (Choose your account)
# - Link to existing project? No
# - What's your project's name? wellvest
# - In which directory is your code located? ./
# - Want to modify settings? No
```

**You'll get a preview URL like:**
```
https://wellvest-abc123.vercel.app
```

### Step 4: Set Environment Variables (3 minutes)

**Go to Vercel Dashboard:**
1. Open https://vercel.com/dashboard
2. Click on your "wellvest" project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
Name: VITE_SUPABASE_URL
Value: (paste from your .env.local)
Environment: Production, Preview, Development

Name: VITE_SUPABASE_ANON_KEY
Value: (paste from your .env.local)
Environment: Production, Preview, Development
```

5. Click **Save**

### Step 5: Redeploy with Environment Variables (1 minute)

```powershell
vercel --prod
```

**You'll get your production URL:**
```
✅ Production: https://wellvest.vercel.app
```

### Step 6: Update Supabase Settings (1 minute)

**In Supabase Dashboard:**
1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs:**
   ```
   https://your-app.vercel.app/**
   ```
3. Update **Site URL:**
   ```
   https://your-app.vercel.app
   ```
4. Click **Save**

---

## ✅ Verification

### Test Your Production Site:

1. **Open your Vercel URL** in a browser
2. **Try to sign up** with a new account
3. **Test login** with: wellvest.test@gmail.com / TestPass123!
4. **Check features:**
   - Dark mode toggle
   - Mental Health Chat
   - Transactions

---

## 🎨 Custom Domain (Optional - 5 minutes)

### If you have a domain (e.g., wellvest.app):

**In Vercel Dashboard:**
1. Project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain: `wellvest.app`
4. Follow DNS setup instructions
5. Add these DNS records at your registrar:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

6. Wait for DNS propagation (5-30 minutes)
7. Your app will be live at `https://wellvest.app` 🎉

---

## 🐛 Troubleshooting

### Build Fails?
```powershell
# Clear cache and rebuild
rm -r node_modules
rm -r dist
npm install
npm run build
```

### Environment Variables Not Working?
- Make sure you added them in Vercel Dashboard, not just .env.local
- Redeploy after adding: `vercel --prod`

### Can't Login on Production?
- Check Supabase **Redirect URLs** include your Vercel URL
- Verify environment variables are set correctly

---

## 📊 Post-Deployment

### Monitor Your App:

**Vercel Analytics (Free):**
- Dashboard → Your Project → Analytics
- See page views, performance, etc.

**Supabase Logs:**
- Dashboard → Logs
- Monitor database queries, auth events

---

## 🎉 You're Live!

Once deployed, you can:
- Share your URL with friends/family
- Update code and auto-deploy with `git push`
- Monitor usage in Vercel Dashboard
- Scale as you grow (Vercel auto-scales)

---

## Quick Commands Reference

```powershell
# Deploy preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm wellvest
```

---

**Estimated Total Time: 10 minutes**
**Cost: $0 (Free tier includes everything you need)**

**Next: Option 3 - Integrate New Features** 🎨
