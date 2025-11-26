# API Integration Testing Guide

This guide walks you through testing all integrated APIs to ensure everything works correctly with your backend at `http://localhost:8000`.

## Prerequisites

1. Backend running on `http://localhost:8000`
2. Frontend running on a local server (e.g., `http://localhost:3000` or similar)
3. Google OAuth credentials configured in your backend
4. Modern browser with Developer Tools (F12)

## API Endpoints Integrated

### Authentication
- ✅ `GET /api/auth/google/login` - Google login redirect
- ✅ `GET /api/auth/google/callback` - OAuth callback handler
- ✅ `POST /api/auth/refresh` - Token refresh
- ✅ `GET /api/auth/me` - Get current user
- ✅ `POST /api/auth/logout` - Logout

### Niches
- ✅ `GET /api/niches` - List user niches
- ✅ `POST /api/niches` - Create niche
- ✅ `GET /api/niches/{niche_id}` - Get niche
- ✅ `PUT /api/niches/{niche_id}` - Update niche
- ✅ `DELETE /api/niches/{niche_id}` - Delete niche
- ✅ `POST /api/niches/{niche_id}/toggle` - Toggle niche status
- ✅ `GET /api/niches/{niche_id}/stats` - Get niche statistics

### Opportunities
- ✅ `GET /api/opportunities` - List opportunities with pagination
- ✅ `GET /api/opportunities/{opportunity_id}` - Get single opportunity
- ✅ `POST /api/opportunities/{opportunity_id}/save` - Save opportunity
- ✅ `POST /api/opportunities/{opportunity_id}/apply` - Mark as applied
- ✅ `DELETE /api/opportunities/{opportunity_id}` - Delete opportunity
- ✅ `GET /api/opportunities/stats/summary` - Get opportunity stats
- ✅ `GET /api/opportunities/platforms/available` - Get available platforms

### Payments
- ✅ `GET /api/payments/plans` - Get subscription plans
- ✅ `POST /api/payments/initialize` - Initialize payment
- ✅ `GET /api/payments/verify/{reference}` - Verify payment
- ✅ `GET /api/payments/subscription/current` - Get current subscription
- ✅ `POST /api/payments/subscription/cancel` - Cancel subscription

---

## Testing Workflow

### 1. Test Authentication

#### Step 1: Access Auth Page
```
1. Open http://localhost:3000/auth.html (or your frontend URL)
2. You should see the login page with "Sign in with Google" button
```

#### Step 2: Login with Google
```
1. Click "Sign in with Google"
2. You'll be redirected to Google OAuth login
3. After authentication, you'll be redirected to /auth_callback.html
4. Check browser console (F12) for any errors
5. You should be redirected to /dashboard.html after ~1 second
```

#### Step 3: Verify Tokens Stored
```
1. Open Developer Tools (F12)
2. Go to Application > Local Storage
3. Verify `access_token` and `refresh_token` are stored
4. Copy the access_token and check its contents at jwt.io to verify it's valid
```

**Expected Result:** ✅ Tokens stored and valid, dashboard loads with user data

---

### 2. Test Niches API

#### Step 1: View Existing Niches
```
1. After login, navigate to "Filters" page from sidebar
2. You should see a list of your niches (empty if first time)
3. Check console for any API errors
```

#### Step 2: Create New Niche
```
1. Click "Add Niche" button
2. Fill in the form:
   - Name: "Web3 Development"
   - Description: "Opportunities for blockchain developers"
   - Keywords: "web3", "ethereum", "solidity" (comma-separated)
   - Platforms: Select relevant platforms
3. Click "Create Niche"
4. Check console for POST /api/niches call
5. New niche should appear in the list
```

#### Step 3: Update Niche
```
1. Click edit (pencil) icon on a niche
2. Modify the fields
3. Save changes
4. Verify the update in the API response
```

#### Step 4: Toggle Niche Status
```
1. Click play/pause icon to activate/deactivate niche
2. Check that the niche status changes visually
3. Verify POST /api/niches/{id}/toggle call
```

#### Step 5: Get Niche Stats
```
1. In console, run: await API.getNicheStats('NICHE_ID_HERE')
2. Replace NICHE_ID with actual ID from the page
3. Verify you get stats response with matches count
```

#### Step 6: Delete Niche
```
1. Click trash icon on a niche
2. Confirm deletion
3. Verify niche is removed from list
4. Check DELETE /api/niches/{id} call in console
```

**Expected Result:** ✅ All CRUD operations work, no 401/403 errors

---

### 3. Test Opportunities API

#### Step 1: View Opportunities
```
1. Click "Opportunities" in sidebar
2. You should see a grid of opportunities
3. If empty, check API response in console
4. Verify GET /api/opportunities call succeeded
```

#### Step 2: View Opportunity Details
```
1. Click on any opportunity card
2. Modal should open with full details
3. Check the modal has:
   - Title, platform, company
   - Description
   - Match percentage
   - Requirements (if available)
4. Verify GET /api/opportunities/{id} call
```

#### Step 3: Save Opportunity
```
1. In opportunity modal, click "Save" button
2. Bookmark icon should change state
3. Verify POST /api/opportunities/{id}/save call
4. Close modal and reopen - bookmark should persist
```

#### Step 4: Mark as Applied
```
1. In opportunity modal, click "Mark as Applied" button
2. Modal should close
3. Alert should show confirmation
4. Verify POST /api/opportunities/{id}/apply call
```

#### Step 5: Test Pagination
```
1. On Opportunities page, scroll to see more opportunities
2. If you have 20+ opportunities, pagination should work
3. Check the page parameter in GET /api/opportunities calls
```

#### Step 6: Get Opportunities Stats
```
1. In console, run: await API.getOpportunitiesStats()
2. You should get stats about total, saved, applied opportunities
3. Verify GET /api/opportunities/stats/summary call
```

#### Step 7: Get Available Platforms
```
1. In console, run: await API.getAvailablePlatforms()
2. Should return list of available platforms for your tier
3. Verify GET /api/opportunities/platforms/available call
```

**Expected Result:** ✅ All opportunity operations work, modals display correctly

---

### 4. Test Payments API

#### Step 1: Get Subscription Plans
```
1. Click the "Upgrade to Pro" button in sidebar
2. Upgrade modal should load with plans
3. Verify GET /api/payments/plans call in console
4. You should see at least 3 plans (Free, Pro, Ultra or similar)
5. Current plan should be marked as "Current Plan"
```

#### Step 2: Initialize Payment
```
1. Click "Upgrade to [TIER]" button for non-current plan
2. Loading state should show "Processing..."
3. Verify POST /api/payments/initialize call
4. You should be redirected to payment URL
5. If payment gateway not available, check response for authorization_url
```

#### Step 3: Get Current Subscription
```
1. In console, run: await API.getCurrentSubscription()
2. Should return current subscription details
3. Verify GET /api/payments/subscription/current call
```

#### Step 4: Test Cancel Subscription (if Premium)
```
1. If you have an active paid subscription, test cancellation
2. In console, run: await API.cancelSubscription()
3. Verify POST /api/payments/subscription/cancel call
4. Subscription status should change
```

**Expected Result:** ✅ Payment plans load, initialization works, subscription queries work

---

## Debugging Guide

### Issue: 401 Unauthorized Errors

**Cause:** Token expired or invalid

**Solution:**
```javascript
// In console:
localStorage.getItem('access_token')  // Check if token exists
localStorage.getItem('refresh_token')  // Check if refresh token exists

// Force token refresh:
await refreshAccessToken()

// Try request again
await API.getCurrentUser()
```

### Issue: CORS Errors

**Cause:** Backend doesn't allow cross-origin requests

**Solution:**
1. Check backend CORS configuration
2. Ensure backend allows requests from your frontend URL
3. Add proper CORS headers to backend responses

### Issue: API Calls Return 404

**Cause:** Endpoint doesn't exist or wrong method

**Solution:**
1. Verify backend has all endpoints listed in this guide
2. Check HTTP method (GET, POST, PUT, DELETE)
3. Verify endpoint paths match exactly
4. Check network tab in DevTools for actual request URL

### Issue: "No opportunities yet" Message

**Cause:** Either no data or API not returning data

**Solution:**
```javascript
// In console:
const data = await API.getOpportunities(1, 20)
console.log('Opportunities:', data)
// Check structure of returned data
```

### Issue: Payment Gateway Redirect Not Working

**Cause:** Missing authorization_url or payment_url in response

**Solution:**
1. Check API.initializePayment response structure
2. Verify backend is returning payment URL correctly
3. Ensure payment configuration is set up in backend
4. Check browser console for exact error

---

## Console Testing Reference

Quick commands to test in browser console (F12):

```javascript
// Authentication
localStorage.getItem('access_token')
TokenManager.getAccessToken()
await API.getCurrentUser()
await API.logout()

// Niches
await API.getNiches()
await API.createNiche({ name: "Test", description: "Test", keywords: ["test"] })
await API.updateNiche('NICHE_ID', { name: "Updated" })
await API.deleteNiche('NICHE_ID')
await API.toggleNiche('NICHE_ID')
await API.getNicheStats('NICHE_ID')

// Opportunities
await API.getOpportunities(1, 20)
await API.getOpportunity('OPP_ID')
await API.saveOpportunity('OPP_ID')
await API.markApplied('OPP_ID')
await API.deleteOpportunity('OPP_ID')
await API.getOpportunitiesStats()
await API.getAvailablePlatforms()

// Payments
await API.getSubscriptionPlans()
await API.getCurrentSubscription()
await API.cancelSubscription()
```

---

## Testing Checklist

- [ ] Google authentication works
- [ ] Tokens are stored in localStorage
- [ ] Dashboard loads after authentication
- [ ] Can view list of niches
- [ ] Can create new niche
- [ ] Can edit niche
- [ ] Can delete niche
- [ ] Can toggle niche active/inactive
- [ ] Can view niche statistics
- [ ] Can view list of opportunities
- [ ] Can view opportunity details
- [ ] Can save opportunity
- [ ] Can mark opportunity as applied
- [ ] Can delete opportunity
- [ ] Pagination works for opportunities
- [ ] Can view opportunity stats
- [ ] Can view available platforms
- [ ] Can open upgrade modal
- [ ] Payment plans load in modal
- [ ] Can initialize payment
- [ ] Can get current subscription
- [ ] No console errors during navigation

---

## Network Monitoring Tips

1. **Open DevTools Network Tab** (F12 > Network)
2. **Filter by Fetch/XHR** to see API calls only
3. **Click on each request** to see:
   - Request headers (verify Authorization header)
   - Request body (for POST/PUT calls)
   - Response status (200, 201, 400, 401, etc.)
   - Response data (the actual response)
4. **Check timing** to identify slow requests

---

## Success Indicators

✅ All API calls return 2xx status codes
✅ Token refresh happens automatically on 401
✅ UI updates correctly after each API call
✅ No unhandled promise rejections in console
✅ Error messages display properly when API fails
✅ Pagination works smoothly
✅ Payment flow initiates without errors

---

## Next Steps

If all tests pass:
1. Deploy frontend to production
2. Configure production backend URL
3. Update Google OAuth redirect URIs
4. Test payment gateway integration end-to-end
5. Monitor error logs in production

