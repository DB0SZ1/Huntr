# Quick Start Guide - Frontend Testing

## ⚡ Quick Setup

### 1. Prerequisites
- Backend running at `http://localhost:8000`
- All 24 API endpoints implemented
- Google OAuth configured in backend
- Frontend served from local server

### 2. Start Testing

#### Option A: Quick Test in Console
```javascript
// Open browser DevTools (F12)

// 1. Check if you're authenticated
localStorage.getItem('access_token')

// 2. Test any API call
await API.getNiches()
await API.getOpportunities(1, 20)
await API.getSubscriptionPlans()
```

#### Option B: Full UI Testing
```
1. Open http://localhost:3000/auth.html
2. Click "Sign in with Google"
3. Complete Google authentication
4. Test each feature in the sidebar:
   - Dashboard
   - Filters (Niches)
   - Opportunities
   - History
   - Settings
5. Click "Upgrade to Pro" to test payments
```

## 🧪 Critical Test Cases

### Must Work
- [ ] Google login redirects correctly
- [ ] Tokens save to localStorage
- [ ] Dashboard loads after login
- [ ] Can view niches
- [ ] Can create niche
- [ ] Can view opportunities
- [ ] Upgrade modal loads plans
- [ ] Payment initialization works

### Expected Behavior
```
Login Flow:
auth.html → Google → auth_callback.html → dashboard.html

Niche Flow:
View → Create → Update → Toggle → Delete

Opportunity Flow:
View List → View Details → Save/Apply → Delete

Payment Flow:
Upgrade Button → Modal Opens → Select Plan → Initialize Payment → Redirect
```

## 🔍 Debugging

### Check API Response
```javascript
// In console, test any endpoint:
try {
  const result = await API.getNiches();
  console.log('Success:', result);
} catch (error) {
  console.log('Error:', error.message);
}
```

### Check Token Status
```javascript
TokenManager.isAuthenticated()           // true/false
localStorage.getItem('access_token')    // Shows token
localStorage.getItem('refresh_token')   // Shows refresh token
```

### Monitor Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Perform action in UI
5. Click request to see details

## 📋 All Integrated Endpoints

**Auth:** 5 endpoints
- Login, Callback, Refresh, Get User, Logout

**Niches:** 7 endpoints
- List, Create, Get, Update, Delete, Toggle, Stats

**Opportunities:** 7 endpoints
- List, Get, Save, Apply, Delete, Stats, Platforms

**Payments:** 5 endpoints
- Plans, Initialize, Verify, Current, Cancel

**Total: 24 endpoints ✅**

## 🚀 What's Changed

### ✅ What Works
- All 24 API endpoints connected
- Real data from backend
- Token-based authentication
- Payment flow integration
- Error handling & retry logic

### ❌ What's Removed
- Mock pricing data
- Mock scan history
- Mock admin dashboard
- Mock user statistics
- All hardcoded test data

## 🎯 Next Steps

1. **Verify each endpoint** using the testing guide
2. **Check backend logs** for any errors
3. **Test payment flow** with your payment provider
4. **Monitor performance** in DevTools Network tab
5. **Deploy to production** with real backend URL

## 💡 Pro Tips

### Speed up testing
```javascript
// Create multiple niches quickly
const niches = ['Web3', 'AI', 'SaaS'];
for (const name of niches) {
  await API.createNiche({
    name,
    description: `${name} opportunities`,
    keywords: [name.toLowerCase()]
  });
}
```

### Test error handling
```javascript
// Trigger 401 error
localStorage.removeItem('access_token');
await API.getCurrentUser();  // Should fail
// Should auto-redirect to login
```

### Monitor all API calls
```javascript
// Wrap fetch to see all requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('API Request:', args[0]);
  return originalFetch.apply(this, args);
};
```

## 📞 Support

If something doesn't work:

1. **Check the testing guide:** `API_INTEGRATION_TESTING_GUIDE.md`
2. **Check the summary:** `API_INTEGRATION_SUMMARY.md`
3. **Verify backend is running:** `http://localhost:8000`
4. **Check browser console:** F12 → Console tab
5. **Check network requests:** F12 → Network tab

## ✅ Checklist Before Production

- [ ] All 24 endpoints tested
- [ ] No console errors
- [ ] Authentication flow works
- [ ] Payment gateway configured
- [ ] Backend CORS enabled
- [ ] Error handling works
- [ ] Tokens refresh automatically
- [ ] UI updates after API calls

---

**Ready to test! Start with the full testing guide: `API_INTEGRATION_TESTING_GUIDE.md`**
