# 🚀 WellVest - Production Deployment Guide

## Pre-Deployment Checklist

### ✅ Code Ready
- [x] Backend features deployed (Gemini API, Settings Sync, Recurring Transactions)
- [x] All services integrated with Supabase
- [x] Authentication working
- [x] Analytics dashboard built
- [x] Recurring transaction UI created

### ⏳ Testing
- [ ] Manual testing of all features
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness check
- [ ] PWA functionality test
- [ ] Performance audit (Lighthouse score >90)

---

## Deployment Options

### Option 1: Vercel (Recommended⭐)

**Why Vercel:**
- ✅ Zero config for React/Vite
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Free hobby plan

**Steps:**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# Follow the prompts - it will detect Vite automatically

# 4. Set environment variables in Vercel Dashboard:
#    - VITE_SUPABASE_URL
#    - VITE_SUPABASE_ANON_KEY

# 5. Redeploy with env vars
vercel --prod
```

**Custom Domain:**
```bash
# In Vercel Dashboard:
# Settings → Domains → Add Domain
# Point your DNS to Vercel
```

---

### Option 2: Netlify

**Steps:**
```bash
# 1. Create netlify.toml
cat > netlify.toml << EOF
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF

# 2. Deploy via CLI
npm install -g netlify-cli
netlify deploy --prod

# Or connect via GitHub in Netlify Dashboard
```

---

### Option 3: Cloudflare Pages

**Steps:**
1. Push to GitHub
2. Go to Cloudflare Pages
3. Connect repository
4. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Framework preset: Vite
5. Set environment variables
6. Deploy

---

## Environment Variables

Set these in your hosting platform:

```bash
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional (for analytics)
VITE_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX
```

---

## Domain Setup

### DNS Configuration

```
Type    Name    Value                           TTL
A       @       76.76.21.21                     Auto
CNAME   www     your-app.vercel.app             Auto
```

### SSL Certificate
✅ Automatic with Vercel/Netlify/Cloudflare

---

## Post-Deployment Tasks

### 1. Configure Supabase for Production

**Update Allowed URLs:**
```
# In Supabase Dashboard → Authentication → URL Configuration
Site URL: https://your-domain.com
Redirect URLs: https://your-domain.com/**
```

**Enable Email Confirmations:**
```
# Authentication → Providers → Email
Confirm email: ✅ Enabled
```

### 2. Setup Monitoring

**Sentry (Error Tracking):**
```bash
npm install @sentry/react

# In main.tsx:
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

**Analytics:**
```bash
# Google Analytics
npm install react-ga4

# Or Plausible (privacy-friendly)
# Just add script tag in index.html
```

### 3. SEO Optimization

**Update `index.html`:**
```html
<head>
  <title>WellVest - Financial Wellness for Women</title>
  <meta name="description" content="Manage your finances, track your cycle, and achieve wellness goals with WellVest." />
  
  <!-- Open Graph -->
  <meta property="og:title" content="WellVest" />
  <meta property="og:description" content="Financial wellness app" />
  <meta property="og:image" content="/og-image.jpg" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
</head>
```

### 4. Performance Optimization

**Build for Production:**
```bash
# Check bundle size
npm run build
npm run preview

# Analyze bundle
npm install -D rollup-plugin-visualizer
```

**Image Optimization:**
- Use WebP format
- Compress with tinypng.com
- Lazy load images

---

## Launch Checklist

### Before Going Live
- [ ] Test all features in production build
- [ ] Verify environment variables set
- [ ] Check Supabase URL configuration
- [ ] Test auth flow (signup, login, logout, reset password)
- [ ] Verify all API calls work
- [ ] Check mobile responsiveness
- [ ] Run Lighthouse audit
- [ ] Test with different browsers
- [ ] Verify SSL certificate
- [ ] Setup error monitoring
- [ ] Configure analytics

### After Launch
- [ ] Monitor error logs (first 24h)
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Plan first update cycle

---

## Maintenance

### Weekly
- Check error logs in Sentry
- Review analytics
- Monitor Supabase usage

### Monthly
- Update dependencies: `npm update`
- Review and optimize database queries
- Backup Supabase data

### Quarterly
- Major dependency updates
- Performance audit
- Security review

---

## Scaling Considerations

### When you hit 1,000 users:
- Upgrade Supabase plan (Pro - $25/month)
- Enable database replication
- Setup CDN for static assets

### When you hit 10,000 users:
- Consider dedicated hosting
- Implement caching (Redis)
- Database query optimization
- Load testing

---

## Support & Documentation

### For Users
Create these pages:
- `/help` - FAQ and guides
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/contact` - Support form

### For Developers
- README.md (already exists)
- CONTRIBUTING.md (if open source)
- API_DOCS.md (for backend)

---

## Backup Strategy

### Automated Backups
Supabase handles database backups automatically (Pro plan)

### Manual Backups
```bash
# Export user data
npx supabase db dump > backup.sql

# Backup on schedule (GitHub Actions)
# Create .github/workflows/backup.yml
```

---

## Quick Deploy Command

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Deploying WellVest to Production..."

# Build
npm run build

# Deploy to Vercel
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Live at: https://your-domain.com"
```

---

## Emergency Rollback

```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Manual
git revert HEAD
git push
vercel --prod
```

---

## 🎉 You're Ready to Launch!

1. Choose hosting platform (Vercel recommended)
2. Deploy with one command
3. Configure domain
4. Update Supabase settings
5. Monitor for 24 hours
6. Celebrate! 🎊

**Estimated Time to Deploy: 30 minutes**
