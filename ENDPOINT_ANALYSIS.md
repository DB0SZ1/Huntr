# API Endpoint Analysis & Update Plan

## Current Admin Pages Status

### ✅ Existing Pages (All Working)
1. **overview.js** - Uses `/api/admin/stats/overview`, `/api/admin/activity`, `/api/admin/revenue/breakdown`
2. **users.js** - Uses `/api/admin/users`, `/api/admin/users/{id}`, etc.
3. **activities.js** - Uses `/api/admin/activity` (has own rendering)
4. **health.js** - Uses monitoring endpoints
5. **reports.js** - Uses report endpoints

---

## New Endpoints That Need New Pages

### 🆕 PAYMENTS ADMIN (`/api/payments/*`)
**Endpoints Available:**
- `GET /api/payments/plans` - Get subscription plans with pricing
- `GET /api/payments/subscription/current` - User subscription details
- `POST /api/payments/initialize` - Initialize payment
- `GET /api/payments/verify/{reference}` - Verify payment status
- `POST /api/payments/webhook` - Handle webhooks
- `POST /api/payments/subscription/cancel` - Cancel subscription

**Needs:** New page `admin/pages/payments.js`
- View all payment plans
- View payment history
- Monitor failed payments
- See subscription status

---

### 🆕 PROMOTIONS ADMIN (`/api/promo/*`)
**Endpoints Available:**
- `POST /api/promo/import-csv` - Import promo users
- `POST /api/promo/validate` - Validate promo
- `POST /api/promo/redeem` - Redeem promo
- `GET /api/promo/available` - Get available promos (not redeemed)
- `GET /api/promo/redeemed` - Get redeemed promos
- `GET /api/promo/active-trials` - Get active promotional trials
- `POST /api/promo/check-expirations` - Check for expired trials

**Needs:** New page `admin/pages/promotions.js`
- Manage promotional codes
- View redeemed codes
- Import CSV for bulk promotions
- Monitor active trials

---

### 🆕 DOCUMENT ANALYSIS ADMIN (`/api/documents/*`)
**Endpoints Available:**
- `POST /api/documents/cv/analyze-lite` - Analyze CV (Pro tier)
- `POST /api/documents/cv/analyze-premium` - Premium CV analysis
- `POST /api/documents/proof-of-work/analyze` - Analyze portfolio
- `GET /api/documents/analyses/history` - Get analysis history

**Needs:** New page `admin/pages/documents.js` (Optional - this is user-facing)
- Monitor document analysis usage
- View analysis history
- Track tier-specific features

---

### 🆕 CURATED GIGS ADMIN (`/api/curated/*`)
**Endpoints Available:**
- `GET /api/curated/weekly-top-20` - Get weekly top curated gigs
- `POST /api/curated/save-gig/{gig_id}` - Save gig
- `GET /api/curated/saved` - Get saved gigs
- `POST /api/curated/feedback/{gig_id}` - Submit feedback
- `GET /api/curated/recommendations/personalized` - Get recommendations
- `POST /api/curated/email-digest/configure` - Configure email digest
- `GET /api/curated/email-digest/preview` - Preview email
- `POST /api/curated/niches/{niche_id}/optimize` - Optimize niche
- `POST /api/curated/scams/report/{gig_id}` - Report scam
- `GET /api/curated/niches/{niche_id}/analytics` - Get niche analytics
- `GET /api/curated/analytics/salary-trends` - Get salary trends

**Needs:** New page `admin/pages/curated.js` (Optional - this is user-facing)
- Monitor curated gig performance
- View salary trends
- Monitor scam reports

---

## Endpoints Already Covered

### ✅ Admin Endpoints (In users.js & overview.js)
- ✅ `/api/admin/stats/overview` - overview.js
- ✅ `/api/admin/users` - users.js
- ✅ `/api/admin/users/{user_id}` - users.js
- ✅ `/api/admin/users/{user_id}/tier` - users.js
- ✅ `/api/admin/users/{user_id}/suspend` - users.js
- ✅ `/api/admin/users/{user_id}/activate` - users.js
- ✅ `/api/admin/revenue/breakdown` - overview.js
- ✅ `/api/admin/activity` - activities.js & overview.js

### ✅ Monitoring Endpoints (In health.js)
- ✅ `/api/monitoring/health` - health.js
- ✅ `/api/monitoring/api-metrics` - health.js
- ✅ `/api/monitoring/scraper-status` - health.js
- ✅ `/api/monitoring/active-sessions` - health.js
- ✅ `/api/monitoring/errors` - health.js

### ✅ Report Endpoints (In reports.js)
- ✅ `/api/reports/signups` - reports.js
- ✅ `/api/reports/revenue` - reports.js
- ✅ `/api/reports/engagement` - reports.js
- ✅ `/api/reports/platform-stats` - reports.js

### ✅ Dashboard Endpoints (Could be used by regular dashboard, not admin)
- ✅ `/api/dashboard/overview` - Regular user dashboard
- ✅ `/api/dashboard/stats` - Regular user dashboard
- ✅ `/api/dashboard/activity` - Regular user dashboard
- ✅ `/api/dashboard/keywords` - Regular user dashboard
- ✅ `/api/dashboard/settings` - Regular user dashboard
- ✅ `/api/dashboard/usage` - Regular user dashboard
- ✅ `/api/dashboard/email-preferences` - Regular user dashboard

### ✅ Other Endpoints (User-facing, not admin)
- ✅ `/api/niches/*` - User niche management
- ✅ `/api/opportunities/*` - User opportunity browsing
- ✅ `/api/scans/*` - User scan management
- ✅ `/api/credits/*` - User credit system
- ✅ `/api/auth/*` - Authentication
- ✅ `/api/curated/*` - User curated gigs

---

## Action Items Priority

### PRIORITY 1: Create Payments Admin Page
- File: `admin/pages/payments.js`
- Function: `loadPaymentsPage()`
- Endpoints: `/api/payments/plans`, `/api/payments/subscription/current`
- UI: Plans table, subscription status, payment verification

### PRIORITY 2: Create Promotions Admin Page
- File: `admin/pages/promotions.js`
- Function: `loadPromotionsPage()`
- Endpoints: `/api/promo/available`, `/api/promo/redeemed`, `/api/promo/active-trials`
- UI: Promo codes table, active trials, import interface

### PRIORITY 3: Update Admin Navigation
- Add "Payments" page link to sidebar
- Add "Promotions" page link to sidebar
- Update admin.js router to load new pages

### PRIORITY 4 (Optional): Create Monitoring Dashboards
- Documents analysis monitoring
- Curated gigs performance
- User engagement analytics

---

## Data Parsing Strategy

### Payments Response Format Handling
```javascript
// Try multiple response formats
const plans = Array.isArray(response) ? response : response?.plans || response?.data || [];
```

### Promos Response Format Handling
```javascript
// Handle various response structures
const promos = Array.isArray(response) ? response : response?.promos || response?.data || [];
```

### Consistent Error Handling
```javascript
try {
  const data = await API.call('GET', endpoint);
  console.log('Response:', data);  // Debug logging
  // Extract and display
} catch (error) {
  console.error('Error:', error);
  // Show error state
}
```

---

## Summary of Changes

| File | Change | Status |
|------|--------|--------|
| admin/pages/payments.js | NEW - Payment management | 🔜 TODO |
| admin/pages/promotions.js | NEW - Promo code management | 🔜 TODO |
| admin/admin.js | UPDATE - Add new page routes | 🔜 TODO |
| admin/index.html | UPDATE - Add new sidebar links | 🔜 TODO |
| All pages | VERIFY - Endpoint paths match | ⏳ IN PROGRESS |

