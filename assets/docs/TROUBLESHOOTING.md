# Common Issues & Solutions

## 🔴 Issue: "Not authenticated" error on every page

**Symptom:**
- Page redirects to auth.html immediately
- Tokens don't appear in localStorage
- Messages like "Authentication failed"

**Solutions:**
```javascript
// 1. Check if tokens exist
localStorage.getItem('access_token')           // Should show token
localStorage.getItem('refresh_token')          // Should show token

// 2. If empty, authentication didn't complete
// → Check auth_callback.html is working
// → Check Google OAuth is configured
// → Check backend is returning tokens

// 3. If tokens exist but still getting errors
// → Tokens might be invalid
// → Try logging out and back in:
localStorage.clear()
location.href = '/auth.html'
```

---

## 🔴 Issue: 401 Unauthorized on API calls

**Symptom:**
- API calls fail with 401
- "Unauthorized" error messages
- Token appears valid but rejected

**Solutions:**
```javascript
// 1. Check token format
const token = localStorage.getItem('access_token')
// Should look like: eyJhbGciOiJIUzI1NiIs...

// 2. Verify token isn't expired
// Use https://jwt.io to decode and check 'exp'

// 3. Force refresh token
await refreshAccessToken()

// 4. If still failing, token might be from wrong environment
// Delete tokens and re-authenticate
localStorage.clear()
location.href = '/auth.html'

// 5. Check backend token validation:
// - Is backend using correct secret key?
// - Is backend checking exp time?
// - Is Authorization header parsed correctly?
```

---

## 🔴 Issue: CORS errors ("blocked by CORS policy")

**Symptom:**
```
Access to XMLHttpRequest at 'http://localhost:8000/api/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solutions:**
```javascript
// This is a BACKEND issue, not frontend

// 1. Check backend CORS configuration:
// Backend MUST include these headers:
// Access-Control-Allow-Origin: http://localhost:3000
// Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
// Access-Control-Allow-Headers: Content-Type, Authorization

// 2. Backend should handle OPTIONS requests
// (Most frameworks do this automatically)

// 3. If using Python/FastAPI:
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

// 4. If using Node/Express:
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

## 🔴 Issue: "GET /api/niches returns undefined or empty"

**Symptom:**
- API call returns null/undefined
- Page shows "No niches" forever
- No error in console

**Solutions:**
```javascript
// 1. Check actual response structure
const result = await API.getNiches()
console.log(result)  // What does it actually return?

// 2. Backend might return different structure
// Expected: Array of niche objects
// Received: { niches: [...] } or { data: [...] }?

// 3. If structure different, update API call:
// In pages.js, change:
// const niches = await API.getNiches()
// To:
// const response = await API.getNiches()
// const niches = response.niches || response  // Handle both formats

// 4. Check backend returns actual data
// Test in console:
// GET http://localhost:8000/api/niches
// (with Authorization header)
// Should return array or { niches: [] }
```

---

## 🔴 Issue: "Payment button doesn't trigger payment"

**Symptom:**
- Click "Upgrade to Pro"
- Loading shows but nothing happens
- No redirect to payment provider

**Solutions:**
```javascript
// 1. Check payment initialization response
const plans = await API.getSubscriptionPlans()
console.log('Plans:', plans)

const result = await API.initializePayment(plans[0].id)
console.log('Payment response:', result)
// Should have: authorization_url or payment_url

// 2. If no URL in response:
// - Backend isn't configured for payments
// - Plan ID might be wrong format
// - Payment provider not set up

// 3. Check payment provider configuration:
// - Is Paystack account linked?
// - Are API keys correct?
// - Is public key in frontend?

// 4. Test Paystack integration separately:
// Initialize payment with test credentials
// Check Paystack dashboard for transactions
```

---

## 🔴 Issue: "Niches won't delete or toggle"

**Symptom:**
- Click delete, nothing happens
- No error, no success message
- Niche stays in list

**Solutions:**
```javascript
// 1. Check niche ID format
const niches = await API.getNiches()
console.log('First niche:', niches[0])
// Check _id or id field name

// 2. Try delete manually
try {
  await API.deleteNiche(niches[0]._id || niches[0].id)
  console.log('Deleted!')
} catch (error) {
  console.log('Error:', error.message)
}

// 3. If 404 error:
// - Niche ID format wrong
// - Niche doesn't exist on backend
// - Wrong user's niche (auth issue)

// 4. If 403 error:
// - User doesn't own this niche
// - Check user authentication

// 5. If no error but nothing happens:
// - Button might not be firing event
// - Check console for JavaScript errors
// - Ensure page refreshes after delete
```

---

## 🔴 Issue: "Modal doesn't open or appears blank"

**Symptom:**
- Click "Upgrade to Pro"
- Modal appears empty or doesn't show
- No error in console

**Solutions:**
```javascript
// 1. Check modal HTML exists
document.getElementById('upgradeModal')  // Should find element

// 2. Check if loadUpgradeModal() completes
// Add console.log to see progress:
async function loadUpgradeModal() {
  try {
    console.log('Loading plans...')
    const plans = await API.getSubscriptionPlans()
    console.log('Plans received:', plans)
    // ... rest of code
  } catch (error) {
    console.log('Error loading modal:', error)
  }
}

// 3. If API fails:
// - Check network tab for failed request
// - Verify user is authenticated (401 error?)
// - Check backend has /api/payments/plans endpoint

// 4. If modal appears but empty:
// - CSS might be hiding content
// - Check dash.css for modal styling
// - Check z-index isn't too low
```

---

## 🔴 Issue: "Can't see opportunities in the grid"

**Symptom:**
- Opportunities page shows "No opportunities yet"
- Network shows 200 response
- But grid stays empty

**Solutions:**
```javascript
// 1. Check actual API response
const result = await API.getOpportunities(1, 20)
console.log('Full response:', result)
console.log('Opportunities:', result.opportunities)
console.log('Count:', result.opportunities.length)

// 2. Check response structure:
// Expected: { opportunities: [...], pagination: {...} }
// Or: { data: [...], meta: {...} }

// 3. If different structure:
// Update renderOpportunitiesPage() to match:
// Change: data.opportunities
// To: data.data or result.data or whatever backend returns

// 4. If empty array:
// - No opportunities in database yet
// - Query filters might exclude all
// - Create test data in backend

// 5. If count shows but grid empty:
// - HTML rendering might be broken
// - Check div.opportunities-grid for errors
// - Check opportunity-card CSS
```

---

## 🔴 Issue: "Token refresh not working (keeps getting 401)"

**Symptom:**
- API calls fail with 401
- Automatic redirect to login
- Even with refresh token in storage

**Solutions:**
```javascript
// 1. Check refresh token exists and valid
const refreshToken = localStorage.getItem('refresh_token')
console.log('Refresh token:', refreshToken)

// 2. Test refresh manually
try {
  const success = await refreshAccessToken()
  console.log('Refresh result:', success)
} catch (error) {
  console.log('Refresh failed:', error)
}

// 3. Check backend refresh endpoint:
// POST /api/auth/refresh
// Body: { refresh_token: "..." }
// Should return: { access_token: "..." }

// 4. If refresh returns 401:
// - Refresh token expired
// - Refresh token doesn't match access token
// - Backend validation issue

// 5. Force new login to get fresh tokens:
localStorage.clear()
location.href = '/auth.html'
```

---

## 🔴 Issue: "Saving opportunities doesn't persist"

**Symptom:**
- Click save on opportunity
- Success message shows
- Refresh page, bookmark is gone

**Solutions:**
```javascript
// 1. Check API response
try {
  const result = await API.saveOpportunity(oppId)
  console.log('Save response:', result)
} catch (error) {
  console.log('Save error:', error)
}

// 2. If error 404:
// - Opportunity ID format wrong
// - Opportunity doesn't exist

// 3. If error 400:
// - Already saved (maybe expected)
// - Invalid operation

// 4. If success but not persisting:
// - Backend received but didn't save
// - Database transaction issue
// - Wrong user association

// 5. Verify in database:
// - Check opportunity.saved_by in backend
// - Check current user ID matches
// - Check database actually updated
```

---

## 🔴 Issue: "Settings won't save"

**Symptom:**
- Change name/email in settings
- Click save
- Settings revert after refresh

**Solutions:**
```javascript
// 1. Check what saveSettings() does
// Edit pages.js saveSettings() function
// Should call: API.updateProfile()

// 2. Verify endpoint exists:
// PUT /api/auth/profile (or similar)
// Should accept: { name, email, ... }

// 3. Test manually:
try {
  await API.updateProfile({ 
    name: 'Test Name',
    whatsapp_number: '+234...'
  })
  console.log('Settings updated!')
} catch (error) {
  console.log('Update error:', error)
}

// 4. If 404:
// - Endpoint doesn't exist in backend
// - Wrong path in API.updateProfile()
// - Check API_BASE_URL is correct

// 5. If 400:
// - Validation error in data
// - Check field names match backend
// - Check data format
```

---

## 🟡 Debugging Steps (General)

**When anything doesn't work:**

```javascript
// Step 1: Check console (F12 > Console)
// Look for red errors

// Step 2: Check network (F12 > Network)
// 1. Filter by Fetch/XHR
// 2. Perform the action
// 3. Click each request to see:
//    - Status (200, 401, 404, 500, etc.)
//    - Request headers (Authorization?)
//    - Response body (what did server return?)

// Step 3: Check localStorage
// F12 > Application > Local Storage > Your domain
// Verify access_token exists and looks valid

// Step 4: Test in console manually
// Try the API call directly:
const user = await API.getCurrentUser()
console.log('Current user:', user)

// Step 5: Check backend logs
// Look for error messages on backend
// Search for the endpoint being called
// Check for auth/validation errors

// Step 6: Verify data format
// JSON responses from backend should be objects
// Arrays wrapped in { key: [...] } or returned directly
// Make sure frontend code expects correct format
```

---

## 📊 Quick Reference

| Issue | Check | Fix |
|-------|-------|-----|
| 401 errors | Tokens in storage | Clear storage, re-login |
| CORS errors | Backend CORS headers | Add CORS middleware |
| Empty data | API response structure | Match frontend to backend |
| Modal blank | API completing | Check network requests |
| Buttons not working | Event listeners | Check JavaScript errors |
| Styling wrong | CSS selectors | Check dash.css |
| Slow performance | API response time | Check database |
| Data not saving | API call status | Check backend |

---

## 📞 When Everything Fails

```
1. Check all console errors (F12)
2. Check all network requests (F12 Network tab)
3. Check backend logs
4. Clear localStorage and re-authenticate
5. Restart frontend server
6. Restart backend server
7. Check API_BASE_URL is correct
8. Verify 24 endpoints are all implemented
9. Test each endpoint separately in console
10. Review this guide again for your specific issue
```

**Most issues are one of these:**
- ❌ Wrong API_BASE_URL
- ❌ Missing tokens/auth
- ❌ Response structure mismatch
- ❌ Backend endpoint not implemented
- ❌ CORS configuration issue
- ❌ JavaScript errors in console

Fix one of these and you'll likely solve it!
