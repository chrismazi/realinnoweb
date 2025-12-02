# 🐛 WellVest - Issues & Bugs Report

**Analysis Date:** December 2, 2025  
**Total Issues Found:** 23  
**Critical:** 6 | **High:** 5 | **Medium:** 8 | **Low:** 4  

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### 1. **Hardcoded Encryption Key**
**Severity:** 🔴 **CRITICAL - SECURITY**  
**File:** `services/storageService.ts:10`  
**Line:** 
```typescript
const ENCRYPTION_KEY = 'temp_encryption_key'; // TODO: Replace with proper key derivation
```

**Impact:**
- Anyone with code access can decrypt health data
- GDPR/HIPAA compliance issue
- User privacy compromised

**Solution:**
- Derive encryption key from user credentials
- Use Web Crypto API (PBKDF2)
- Store salt in database per user

**Priority:** Fix TODAY ⚠️

---

### 2. **App Not Installable (No PWA Manifest)**
**Severity:** 🔴 **CRITICAL - FUNCTIONALITY**  
**Files Missing:**
- `public/manifest.json`
- `public/icons/*.png`

**Impact:**
- Users can't "Add to Home Screen"
- App doesn't feel native
- Missing key PWA functionality

**Solution:**
- Create manifest.json
- Generate icons (72x72 to 512x512)
- Link in index.html

**Priority:** Fix this week

---

### 3. **Wrong App Title**
**Severity:** 🔴 **CRITICAL - BRANDING**  
**File:** `index.html:9`  
**Current:** `<title>RealWorks</title>`  
**Should be:** `<title>WellVest</title>`

**Impact:**
- Wrong brand name displayed
- SEO issues
- Browser tabs show "RealWorks"

**Solution:**
```html
<title>WellVest - Your Holistic Wealth & Wellness Companion</title>
```

**Priority:** Fix NOW (1 minute)

---

### 4. **Recurring Transactions Incomplete**
**Severity:** 🔴 **CRITICAL - FEATURE**  
**Files:**
- `components/RecurringTransactionForm.tsx` exists but NOT used
- `components/BudgetPlanner.tsx` doesn't import it

**Impact:**
- Feature half-complete
- Backend ready but no UI
- Users can't create recurring bills

**Solution:**
- Import RecurringTransactionForm
- Add toggle in transaction form
- Display recurring badge on list

**Priority:** Complete this week

---

### 5. **Budget Limits Not Synced to Database**
**Severity:** 🔴 **CRITICAL - DATA LOSS**  
**File:** `components/BudgetPlanner.tsx`  
**Current:** Stored in localStorage only

**Impact:**
- Budget limits lost on browser clear
- No sync across devices
- Not backed up

**Solution:**
- Create `budget_categories` table
- Move localStorage data to Supabase
- Use RLS for security

**Priority:** Fix this week

---

### 6. **No Error Retry Queue**
**Severity:** 🔴 **CRITICAL - RELIABILITY**  
**File:** `store/useAppStore.ts:187`  
**Code:** `// TODO: Handle rollback or retry queue`

**Impact:**
- Failed Supabase writes are lost
- No offline support
- Data inconsistency

**Solution:**
- Implement retry queue
- Store failed operations
- Retry on reconnect

**Priority:** Week 2

---

## 🟠 HIGH PRIORITY ISSUES

### 7. **SexualHealth Component Too Large**
**Severity:** 🟠 **HIGH - PERFORMANCE**  
**File:** `components/SexualHealth.tsx`  
**Size:** 102KB (!)

**Impact:**
- Slow initial load
- Large bundle size
- Poor performance on mobile

**Solution:**
- Code split into sub-components
- Lazy load sections
- Target: < 30KB per file

**Priority:** Week 3

---

### 8. **No Pagination on Transactions**
**Severity:** 🟠 **HIGH - PERFORMANCE**  
**File:** `components/BudgetPlanner.tsx`  
**Current:** Loads ALL transactions at once

**Impact:**
- Slow with 1000+ transactions
- Memory issues
- Poor UX

**Solution:**
- Implement pagination (20 items per page)
- Or infinite scroll
- Lazy load from Supabase

**Priority:** Week 3

---

### 9. **Tailwind Loaded via CDN**
**Severity:** 🟠 **HIGH - PERFORMANCE**  
**File:** `index.html:10`  
**Current:** `<script src="https://cdn.tailwindcss.com"></script>`

**Impact:**
- Large bundle (~3MB)
- No tree-shaking
- Slow page load
- Blocks rendering

**Solution:**
- Install Tailwind via npm
- Use PostCSS build
- Only include used classes

**Priority:** Week 3

---

### 10. **No Loading Skeletons**
**Severity:** 🟠 **HIGH - UX**  
**Files:** All components use spinners

**Impact:**
- Looks unprofessional
- Layout shift on load
- Poor perceived performance

**Solution:**
- Replace spinners with skeleton loaders
- Match actual content layout
- Smooth fade-in transitions

**Priority:** Week 2

---

### 11. **No 2FA Support**
**Severity:** 🟠 **HIGH - SECURITY**  
**File:** `services/supabaseAuth.ts`

**Impact:**
- Account security risk
- No TOTP, SMS, or app-based auth
- Vulnerable to password leaks

**Solution:**
- Add 2FA toggle in Profile
- Implement TOTP (Google Authenticator)
- Store secret in profiles table

**Priority:** Phase 2 (future)

---

## 🟡 MEDIUM PRIORITY ISSUES

### 12. **Analytics Not Accessible**
**Severity:** 🟡 **MEDIUM - FEATURE**  
**File:** `components/Analytics.tsx` exists but no route

**Impact:**
- Analytics dashboard hidden
- Feature complete but unusable
- Wasted development effort

**Solution:**
- Add ANALYTICS tab to Navigation
- Update Tab enum in types.ts

**Priority:** Week 3

---

### 13. **Push Notifications Incomplete**
**Severity:** 🟡 **MEDIUM - FEATURE**  
**Files:** 
- `services/notificationService.ts` (basic wrapper only)
- No VAPID keys

**Impact:**
- Notifications toggle does nothing
- No bill reminders
- No goal milestone alerts

**Solution:**
- Generate VAPID keys
- Create Edge Function for sending
- Implement notification triggers

**Priority:** Week 3

---

### 14. **No Data Export (CSV/PDF)**
**Severity:** 🟡 **MEDIUM - FEATURE**  
**File:** `services/exportService.ts` (JSON only)

**Impact:**
- Users can't export for taxes
- No printable reports
- Limited usefulness

**Solution:**
- Add CSV export (transactions)
- Add PDF export (monthly report)
- Use libraries: papaparse, jsPDF

**Priority:** Week 3

---

### 15. **Learn Articles Hardcoded**
**Severity:** 🟡 **MEDIUM - SCALABILITY**  
**File:** `components/Learn.tsx`

**Impact:**
- Can't add new articles without code change
- No admin panel
- Not scalable

**Solution:**
- Move articles to Supabase table
- Create admin interface
- Allow user-submitted content (future)

**Priority:** Phase 2 (future)

---

### 16. **No Receipt Photo Upload**
**Severity:** 🟡 **MEDIUM - FEATURE**  
**File:** `components/BudgetPlanner.tsx`

**Impact:**
- Can't attach receipts to expenses
- No proof of purchase
- Limited usefulness for returns

**Solution:**
- Add photo upload to transaction form
- Store in Supabase Storage
- Compress images before upload

**Priority:** Week 2

---

### 17. **No Biometric Login**
**Severity:** 🟡 **MEDIUM - UX**  
**File:** `components/Profile.tsx`  
**Toggle exists but does nothing**

**Impact:**
- Face ID/Touch ID toggle is fake
- Users expect this to work
- Poor UX

**Solution:**
- Implement WebAuthn
- Use Web Authentication API
- Store credentials securely

**Priority:** Phase 2 (future)

---

### 18. **No Search on Transactions**
**Severity:** 🟡 **MEDIUM - UX**  
**File:** `components/BudgetPlanner.tsx`

**Impact:**
- Hard to find specific transaction
- Poor UX with many transactions
- Have to scroll through list

**Solution:**
- Add search bar
- Search by title, amount, category
- Use fuzzy matching

**Priority:** Week 3

---

### 19. **Gemini Key in Vite Config**
**Severity:** 🟡 **MEDIUM - SECURITY**  
**File:** `vite.config.ts:14-15`

**Impact:**
- API key visible in build
- Though Edge Function is used
- Confusing/redundant

**Solution:**
- Remove Gemini key from vite.config
- Rely solely on Edge Function
- Clean up legacy code

**Priority:** Week 2

---

## 🟢 LOW PRIORITY ISSUES

### 20. **No Session Timeout**
**Severity:** 🟢 **LOW - SECURITY**  
**File:** `services/supabaseAuth.ts`

**Impact:**
- Sessions last forever
- Security risk on shared devices
- No auto-logout

**Solution:**
- Add session timeout (30 min inactive)
- Show timeout warning
- Auto-refresh before expiry

**Priority:** Phase 2 (future)

---

### 21. **No Login History**
**Severity:** 🟢 **LOW - SECURITY**  
**File:** `components/Profile.tsx`

**Impact:**
- Can't see login history
- Can't detect unauthorized access
- No active session management

**Solution:**
- Create `login_history` table
- Show last 10 logins
- Allow logout from all devices

**Priority:** Phase 2 (future)

---

### 22. **No Offline Mode**
**Severity:** 🟢 **LOW - FEATURE**  
**File:** Service worker not implemented

**Impact:**
- App doesn't work offline
- Not a true PWA
- Poor connectivity UX

**Solution:**
- Implement service worker caching
- Cache static assets
- Queue writes when offline

**Priority:** Phase 2 (future)

---

### 23. **No Tests**
**Severity:** 🟢 **LOW - QUALITY**  
**Files:** None exist

**Impact:**
- No automated testing
- Regressions possible
- Hard to refactor safely

**Solution:**
- Add Vitest
- Unit tests for critical logic
- E2E tests with Playwright

**Priority:** Phase 2 (future)

---

## 📊 Summary by Category

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| **Security** | 2 | 1 | 1 | 2 | 6 |
| **Features** | 3 | 0 | 5 | 2 | 10 |
| **Performance** | 0 | 3 | 0 | 0 | 3 |
| **UX** | 0 | 1 | 2 | 0 | 3 |
| **Data** | 1 | 0 | 0 | 0 | 1 |

**Total Issues:** 23  
**Must Fix for Launch:** 11 (Critical + High)  
**Can Wait:** 12 (Medium + Low)

---

## 🎯 Quick Fix List (Do This Week)

1. ✅ Fix app title (1 min)
2. 🔐 Replace encryption key (2 hrs)
3. 📱 Add PWA manifest (1 hr)
4. 🔄 Complete recurring transactions (4 hrs)
5. 💾 Move budget limits to DB (3 hrs)
6. 🖼️ Replace spinners with skeletons (6 hrs)

**Total Time:** ~16 hours (~2 working days)

---

## 📈 Priority Matrix

```
High Impact  │ 1. Encryption Key        │ 7. Code Split SexualHealth
             │ 2. PWA Manifest          │ 8. No Pagination
             │ 3. Recurring Transactions│ 9. Tailwind CDN
             │ 4. Budget Limits         │
─────────────┼──────────────────────────┼────────────────────────────
Low Impact   │ 14. Learn Articles       │ 20. Session Timeout
             │ 17. Biometric Login      │ 21. Login History
             │                          │ 23. No Tests
             │                          │
             └──────────────────────────┴────────────────────────────
               Low Effort                 High Effort
```

**Focus on:** Top-left quadrant (high impact, low effort)

---

## ✅ Resolution Tracking

As issues are fixed, update this:

- [ ] #1: Encryption Key (CRITICAL)
- [ ] #2: PWA Manifest (CRITICAL)
- [ ] #3: App Title (CRITICAL) ← **Do NOW**
- [ ] #4: Recurring Transactions (CRITICAL)
- [ ] #5: Budget Limits (CRITICAL)
- [ ] #6: Retry Queue (CRITICAL)
- [ ] #7: Code Split (HIGH)
- [ ] #8: Pagination (HIGH)
- [ ] #9: Tailwind CDN (HIGH)
- [ ] #10: Loading Skeletons (HIGH)
- [ ] #11: 2FA (HIGH)
- [ ] #12: Analytics Route (MEDIUM)
- [ ] #13: Notifications (MEDIUM)
- [ ] #14: CSV/PDF Export (MEDIUM)
- [ ] #15: Learn CMS (MEDIUM)
- [ ] #16: Receipt Upload (MEDIUM)
- [ ] #17: Biometric Login (MEDIUM)
- [ ] #18: Transaction Search (MEDIUM)
- [ ] #19: Gemini in vite.config (MEDIUM)
- [ ] #20: Session Timeout (LOW)
- [ ] #21: Login History (LOW)
- [ ] #22: Offline Mode (LOW)
- [ ] #23: Tests (LOW)

---

**Ready to fix these? Let's start with the 1-minute fix (app title) and work our way up! 🚀**
