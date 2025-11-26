# Authentication Quick Reference Guide

## 🚀 Quick Start

### Using Auth Functions in Your Code

```javascript
// Import the auth API utilities
<script src="assets/js/auth-api.js"></script>

// Check if user is logged in
if (isAuthenticated()) {
  // User is authenticated
  const token = getAccessToken();
}

// Logout user
logout(); // Clears tokens and redirects to auth.html

// Get auth header for API calls
const headers = getAuthHeader();
// Returns: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' }
```

---

## 📝 Authentication Flows

### 1. Sign Up
```javascript
await signupUser({
  email: 'user@example.com',
  password: 'SecurePassword123',
  name: 'John Doe'
});
// User receives verification email
```

### 2. Login
```javascript
await loginUser({
  email: 'user@example.com',
  password: 'SecurePassword123'
});
// Tokens stored in localStorage automatically
// User redirected to dashboard.html
```

### 3. Verify Email
```javascript
const token = new URLSearchParams(window.location.search).get('token');
await verifyEmail(token);
// User is logged in and redirected to dashboard
```

### 4. Forgot Password
```javascript
await forgotPassword('user@example.com');
// Email sent with password reset link
```

### 5. Reset Password
```javascript
await resetPassword({
  token: 'token-from-email',
  new_password: 'NewPassword123'
});
// Password changed, redirect to login
```

### 6. Change Password (Authenticated)
```javascript
await changePassword({
  old_password: 'CurrentPassword123',
  new_password: 'NewPassword456'
});
// Must be logged in
// Uses Bearer token from localStorage
```

---

## 🔒 Security Functions

```javascript
// Check authentication
if (!isAuthenticated()) {
  window.location.href = '/auth.html';
}

// Get current token
const token = getAccessToken();

// Get refresh token
const refreshToken = getRefreshToken();

// Make authenticated API call
const response = await fetch('/api/data', {
  headers: getAuthHeader()
});

// Clear everything and logout
logout();
```

---

## 📄 API Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/auth/signup` | Create account | ❌ No |
| POST | `/api/auth/login` | Login | ❌ No |
| POST | `/api/auth/verify-email` | Verify email | ❌ No |
| POST | `/api/auth/forgot-password` | Request reset | ❌ No |
| POST | `/api/auth/reset-password` | Reset password | ❌ No |
| POST | `/api/auth/change-password` | Change password | ✅ Yes |

---

## 🎨 Frontend Pages

### Sign Up / Login
- **File:** `auth.html`
- **JavaScript:** `assets/js/auth.js`
- **CSS:** `assets/css/auth.css`

### Email Verification
- **File:** `email-verification.html`
- **JavaScript:** `assets/js/email-verification.js`
- **URL:** `?token=verification-token`

### Password Reset
- **File:** `password-reset.html`
- **JavaScript:** `assets/js/password-reset.js`
- **URLs:**
  - Forgot: `password-reset.html`
  - Reset: `password-reset.html?token=reset-token`

### Change Password
- **File:** `change-password.html`
- **JavaScript:** `assets/js/change-password.js`
- **Auth:** ✅ Requires login

---

## 💾 LocalStorage Keys

```javascript
// Access token for authenticated requests
localStorage.getItem('access_token')

// Refresh token for getting new access token
localStorage.getItem('refresh_token')

// Authentication flag
localStorage.getItem('is_authenticated')
```

---

## ⚠️ Error Handling

```javascript
try {
  await loginUser(credentials);
} catch (error) {
  console.error('Login failed:', error);
  alert(error.message);
}

// Error format from API
{
  "detail": "Invalid email or password"
}

// Validation error format
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "invalid email format",
      "type": "value_error.email"
    }
  ]
}
```

---

## 🔐 Password Requirements

- ✓ Minimum 8 characters
- ✓ At least one UPPERCASE letter
- ✓ At least one lowercase letter
- ✓ At least one number

---

## 📱 Integration in Components

### Protect a Page (Require Login)
```html
<script>
  // Check at page load
  if (!isAuthenticated()) {
    window.location.href = '/auth.html';
  }
</script>
```

### Show/Hide Elements Based on Auth
```html
<script>
  if (isAuthenticated()) {
    document.getElementById('userMenu').style.display = 'block';
    document.getElementById('loginBtn').style.display = 'none';
  } else {
    document.getElementById('userMenu').style.display = 'none';
    document.getElementById('loginBtn').style.display = 'block';
  }
</script>
```

### Make Authenticated API Call
```javascript
const response = await fetch('/api/user/profile', {
  method: 'GET',
  headers: getAuthHeader()
});

const data = await response.json();
```

### Logout Button
```html
<button onclick="logout()">
  <i class="fas fa-sign-out-alt"></i> Logout
</button>
```

---

## 🧪 Testing

### Test Account
```
Email: test@example.com
Password: TestPassword123
```

### Quick Test Script
```javascript
// Open browser console and run:

// Test 1: Check if authenticated
console.log('Authenticated:', isAuthenticated());

// Test 2: Get token
console.log('Token:', getAccessToken());

// Test 3: Make API call
fetch('/api/user/profile', {
  headers: getAuthHeader()
}).then(r => r.json()).then(d => console.log(d));

// Test 4: Logout
logout();
```

---

## 🐛 Common Issues

### "Not authenticated" but localStorage has token
- Token may have expired
- Token format may be invalid
- Browser localStorage may be cleared
- Solution: Login again

### Password reset email not received
- Check spam folder
- Verify email address is correct
- Check backend email configuration
- Check rate limiting

### Email verification link expired
- Verification links expire after 24 hours
- User can request new verification from signup page
- Backend should provide resend option

### Change password fails
- User must be logged in
- Old password must be correct
- New password must meet requirements
- New password must differ from old

---

## 📚 File Structure

```
/
├── auth.html                    // Sign up & login page
├── password-reset.html          // Password reset page
├── email-verification.html      // Email verification page
├── change-password.html         // Change password page
├── assets/
│   ├── js/
│   │   ├── auth.js             // Form handlers
│   │   ├── auth-api.js         // API utilities ⭐ IMPORT THIS
│   │   ├── password-reset.js   // Reset logic
│   │   ├── email-verification.js // Verification logic
│   │   └── change-password.js  // Change password logic
│   ├── css/
│   │   ├── auth.css            // Auth page styling
│   │   └── dash.css            // Dashboard styling
│   └── docs/
│       └── AUTH_API_INTEGRATION.md // Full API docs
└── AUTHENTICATION_INTEGRATION_SUMMARY.md
```

---

## 🔗 Links

- **Auth Page:** `/auth.html`
- **Forgot Password:** `/password-reset.html`
- **Change Password:** `/change-password.html`
- **API Docs:** `/assets/docs/AUTH_API_INTEGRATION.md`

---

## 💡 Pro Tips

1. **Always check `isAuthenticated()`** before accessing protected pages
2. **Use `getAuthHeader()`** for all authenticated API calls
3. **Log errors properly** for debugging in production
4. **Test on mobile** - all auth pages are responsive
5. **Monitor localStorage** - don't store sensitive data
6. **Handle token expiration** - implement refresh token logic when needed

---

**Quick Reference Version:** 1.0
**Last Updated:** November 22, 2025
