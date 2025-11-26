# Authentication API Integration Guide

## Overview
This document covers the authentication endpoints and their integration with the Niche Finder frontend application.

## API Base URL
```
http://localhost:8000
```

## Endpoints

### 1. Sign Up (Register)
**Endpoint:** `POST /api/auth/signup`

**Purpose:** Create a new user account with email and password. Sends a verification email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Response (200 - Success):**
```json
{
  "message": "Account created. Please verify your email.",
  "email": "user@example.com"
}
```

**Response (422 - Validation Error):**
```json
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

**Implementation:**
```javascript
// File: assets/js/auth-api.js
const response = await signupUser({
  email: 'user@example.com',
  password: 'SecurePassword123',
  name: 'John Doe'
});
```

---

### 2. Login
**Endpoint:** `POST /api/auth/login`

**Purpose:** Authenticate user and return JWT tokens for session management.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 - Success):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Response (422 - Validation Error):**
```json
{
  "detail": "Invalid email or password"
}
```

**Implementation:**
```javascript
// File: assets/js/auth-api.js
const response = await loginUser({
  email: 'user@example.com',
  password: 'SecurePassword123'
});

// Tokens are automatically stored in localStorage
// - access_token
// - refresh_token
// - is_authenticated
```

---

### 3. Verify Email
**Endpoint:** `POST /api/auth/verify-email`

**Purpose:** Verify user email using a token sent via email.

**Request Body:**
```json
{
  "token": "verification-token-from-email"
}
```

**Response (200 - Success):**
```json
{
  "message": "Email verified successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Flow:**
1. User receives email with link: `https://yoursite.com/email-verification.html?token=xxx`
2. Page automatically calls `verifyEmail(token)`
3. On success, user is logged in and redirected to dashboard
4. On failure, user sees error message and is offered to resend email

**Implementation:**
```javascript
// File: assets/js/email-verification.js
const token = new URLSearchParams(window.location.search).get('token');
const response = await verifyEmail(token);
```

---

### 4. Forgot Password
**Endpoint:** `POST /api/auth/forgot-password`

**Purpose:** Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 - Success):**
```json
{
  "message": "Password reset email sent to user@example.com"
}
```

**Flow:**
1. User enters email in forgot password form
2. Backend sends email with reset link: `https://yoursite.com/password-reset.html?token=xxx`
3. Email link redirects to password reset page

**Implementation:**
```javascript
// File: assets/js/password-reset.js
const response = await forgotPassword('user@example.com');
```

---

### 5. Reset Password
**Endpoint:** `POST /api/auth/reset-password`

**Purpose:** Set new password using reset token from email.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "new_password": "NewSecurePassword123"
}
```

**Response (200 - Success):**
```json
{
  "message": "Password reset successfully"
}
```

**Flow:**
1. User clicks reset link from email
2. Page displays password reset form
3. User enters new password
4. Form validates password strength before submission
5. On success, user is redirected to login

**Implementation:**
```javascript
// File: assets/js/password-reset.js
const response = await resetPassword({
  token: 'reset-token-xxx',
  new_password: 'NewSecurePassword123'
});
```

---

### 6. Change Password
**Endpoint:** `POST /api/auth/change-password`

**Purpose:** Change password for authenticated user.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "old_password": "CurrentPassword123",
  "new_password": "NewSecurePassword456"
}
```

**Response (200 - Success):**
```json
{
  "message": "Password changed successfully"
}
```

**Response (401 - Unauthorized):**
```json
{
  "detail": "Invalid current password"
}
```

**Flow:**
1. User must be logged in to access page
2. User enters current and new passwords
3. Form validates:
   - Passwords match (new password confirmed)
   - New password meets strength requirements
   - New password different from old password
4. On success, user can optionally logout and login with new password

**Implementation:**
```javascript
// File: assets/js/change-password.js
const response = await changePassword({
  old_password: 'CurrentPassword123',
  new_password: 'NewSecurePassword456'
});
```

---

## Frontend Files

### HTML Pages
- **auth.html** - Sign up and login page
- **password-reset.html** - Forgot password and reset password flows
- **email-verification.html** - Email verification page
- **change-password.html** - Change password for authenticated users

### JavaScript Files
- **assets/js/auth.js** - Main authentication form handlers
- **assets/js/auth-api.js** - API utility functions
- **assets/js/password-reset.js** - Password reset logic
- **assets/js/email-verification.js** - Email verification logic
- **assets/js/change-password.js** - Change password logic

### CSS Files
- **assets/css/auth.css** - Authentication pages styling
- **assets/css/dash.css** - Includes change password styling

## Token Management

### Access Token
- Used for authenticated API requests
- Stored in `localStorage.access_token`
- Include in Authorization header: `Bearer {token}`
- Typically short-lived (15-30 minutes)

### Refresh Token
- Used to obtain new access token when expired
- Stored in `localStorage.refresh_token`
- Should be kept secure

### Checking Authentication
```javascript
// Check if user is logged in
if (isAuthenticated()) {
  // User is authenticated
}

// Get access token
const token = getAccessToken();

// Get authorization header for API calls
const headers = getAuthHeader();
```

## Security Best Practices

1. **Password Requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number

2. **HTTPS Only:**
   - Always use HTTPS in production
   - Never send tokens over unencrypted connections

3. **Token Storage:**
   - Tokens are stored in localStorage
   - Consider using httpOnly cookies for additional security
   - Clear tokens on logout

4. **Password Handling:**
   - Never store plain passwords
   - Always validate on both client and server
   - Use HTTPS for password transmission

## Error Handling

All error responses follow this format:
```json
{
  "detail": "Error message or list of validation errors"
}
```

### Common Error Codes
- **200** - Success
- **422** - Validation Error (invalid input)
- **401** - Unauthorized (invalid credentials or missing token)
- **403** - Forbidden (insufficient permissions)
- **500** - Server Error

## Testing

### Manual Testing Checklist
- [ ] Sign up with valid credentials
- [ ] Verify email with token
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials (error)
- [ ] Forgot password flow
- [ ] Reset password with token
- [ ] Change password when logged in
- [ ] Logout clears tokens
- [ ] Protected pages redirect to login if not authenticated

### Test Credentials
```
Email: test@example.com
Password: TestPassword123
```

## Troubleshooting

### "Invalid token" error
- Token may have expired
- Token may have been tampered with
- Refresh page and login again

### "Email already registered" error
- Try forgot password flow
- Use different email address

### "Password reset link expired"
- Reset links typically expire after 24 hours
- Request new password reset

## Future Enhancements

- [ ] OAuth2 integration (Google, GitHub)
- [ ] Two-factor authentication (2FA)
- [ ] Session management and device tracking
- [ ] Account deactivation/deletion
- [ ] Email notifications for security events
- [ ] Rate limiting on authentication endpoints
