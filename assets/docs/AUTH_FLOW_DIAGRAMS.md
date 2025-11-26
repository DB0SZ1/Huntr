# Authentication Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend Application                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐ │
│  │  auth.html  │  │   Pages     │  │  Protected Components    │ │
│  │  (Auth UI)  │  │   Files     │  │  (Dashboard, Analytics)  │ │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬─────────────┘ │
│         │                 │                      │                │
│         └─────────────────┼──────────────────────┘                │
│                           │                                       │
│  ┌────────────────────────▼─────────────────────────────────┐   │
│  │            assets/js/auth-api.js                         │   │
│  │       (Central API Utility Functions)                    │   │
│  │  • signupUser()                                          │   │
│  │  • loginUser()                                           │   │
│  │  • verifyEmail()                                         │   │
│  │  • forgotPassword()                                      │   │
│  │  • resetPassword()                                       │   │
│  │  • changePassword()                                      │   │
│  │  • Token Management Functions                           │   │
│  └────────────────────┬──────────────────────────────────────┘   │
│                       │                                           │
│                       │ HTTP Requests                            │
│                       ▼                                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │          localStorage Token Storage                        │  │
│  │  • access_token                                            │  │
│  │  • refresh_token                                           │  │
│  │  • is_authenticated                                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Backend API Server                              │
│               (localhost:8000)                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  POST /api/auth/signup          ─→  User Registration          │
│  POST /api/auth/login           ─→  User Authentication        │
│  POST /api/auth/verify-email    ─→  Email Verification        │
│  POST /api/auth/forgot-password ─→  Password Reset Request    │
│  POST /api/auth/reset-password  ─→  Password Reset            │
│  POST /api/auth/change-password ─→  Password Change (Auth)     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sign Up Flow Diagram

```
┌─────────────┐
│  User      │
│ Opens      │
│ auth.html  │
└──────┬──────┘
       │
       ▼
┌───────────────────────┐
│ Sign Up Form          │
│ • First Name          │
│ • Last Name           │
│ • Email              │
│ • Password           │
│ • Confirm Password   │
└──────┬────────────────┘
       │
       ▼ User clicks "Create an account"
┌───────────────────────────┐
│ Validate Form Data        │
│ • Email format            │
│ • Password strength       │
│ • Passwords match         │
└──────┬────────────────────┘
       │
       ├─ Invalid? → Show Error
       │
       └─ Valid
           │
           ▼
┌─────────────────────────────┐
│ POST /api/auth/signup       │
│ {                           │
│   "email": "...",           │
│   "password": "...",        │
│   "name": "..."             │
│ }                           │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Backend Creates Account      │
│ • Validate credentials       │
│ • Hash password              │
│ • Create user record         │
│ • Generate verification token│
│ • Send verification email    │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Response 200 OK              │
│ "Account created. Please     │
│  verify your email."         │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Show Confirmation Message    │
│ Switch to Sign In Tab        │
└────────┬─────────────────────┘
         │
         ▼ User receives email with link
┌──────────────────────────────────────┐
│ Email received:                      │
│ "Verify your email"                  │
│ [Click here to verify]               │
│ ↓                                    │
│ https://app.com/email-verification  │
│ .html?token=xxx                      │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ email-verification.html      │
│ Detects token in URL         │
└────────┬─────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ POST /api/auth/verify-email │
│ {                           │
│   "token": "xxx"            │
│ }                           │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Backend Verifies Token       │
│ • Check token validity       │
│ • Mark email as verified     │
│ • Generate JWT tokens        │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Response 200 OK              │
│ {                            │
│   "access_token": "jwt...",  │
│   "refresh_token": "jwt..."  │
│ }                            │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Frontend:                    │
│ • Store access_token         │
│ • Store refresh_token        │
│ • Set is_authenticated=true  │
│ • Show success message       │
└────────┬─────────────────────┘
         │
         ▼ Auto-redirect after 3 seconds
┌──────────────────────────────┐
│ Redirect to dashboard.html   │
│ User now fully registered    │
│ and authenticated            │
└──────────────────────────────┘
```

---

## Login Flow Diagram

```
┌─────────────┐
│  User      │
│ Opens      │
│ auth.html  │
└──────┬──────┘
       │
       ▼ Click "Sign in" tab
┌──────────────────────────────┐
│ Sign In Form                 │
│ • Email                      │
│ • Password                   │
│ • [Sign In] button           │
│ • Forgot password? link      │
└──────┬───────────────────────┘
       │
       ▼ User enters credentials
┌──────────────────────────────┐
│ Validate Form Data           │
│ • Email format               │
│ • Password not empty         │
└──────┬───────────────────────┘
       │
       ├─ Invalid? → Show Error
       │
       └─ Valid
           │
           ▼
┌──────────────────────────────┐
│ POST /api/auth/login         │
│ {                            │
│   "email": "...",            │
│   "password": "..."          │
│ }                            │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Backend Authenticates User   │
│ • Find user by email         │
│ • Verify password hash       │
│ • Check email verified       │
│ • Generate JWT tokens        │
└────────┬─────────────────────┘
         │
         ├─ Auth Failed? → Error 401
         │   ↓
         │   Show error message
         │
         └─ Auth Success
             │
             ▼
┌──────────────────────────────┐
│ Response 200 OK              │
│ {                            │
│   "access_token": "jwt...",  │
│   "refresh_token": "jwt...", │
│   "user": {...}              │
│ }                            │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Frontend:                    │
│ • Store access_token         │
│ • Store refresh_token        │
│ • Set is_authenticated=true  │
└────────┬─────────────────────┘
         │
         ▼ Auto-redirect
┌──────────────────────────────┐
│ Redirect to dashboard.html   │
│ User is now logged in        │
└──────────────────────────────┘
```

---

## Forgot Password Flow Diagram

```
┌──────────────────────────────────┐
│ User Forgot Password             │
│ Goes to password-reset.html      │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Forgot Password Form         │
│ • Email input                │
│ • [Send Reset Link] button   │
└──────┬───────────────────────┘
       │
       ▼ User enters email
┌──────────────────────────────┐
│ Validate Email Format        │
└──────┬───────────────────────┘
       │
       ├─ Invalid? → Show Error
       │
       └─ Valid
           │
           ▼
┌──────────────────────────────┐
│ POST /api/auth/forgot-password
│ {                            │
│   "email": "..."             │
│ }                            │
└────────┬─────────────────────┘
         │
         ▼
┌───────────────────────────────────┐
│ Backend:                          │
│ • Find user by email              │
│ • Generate reset token            │
│ • Set token expiration (1 hour)   │
│ • Send email with reset link      │
└────────┬────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Response 200 OK              │
│ "Check your email for the    │
│  password reset link"        │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Show Confirmation Message    │
└────────┬─────────────────────┘
         │
         ▼ User receives email
┌──────────────────────────────────┐
│ Email received:                  │
│ "Reset Your Password"            │
│ [Click here to reset password]   │
│ ↓                                │
│ https://app.com/password-reset   │
│ .html?token=xxx                  │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ password-reset.html          │
│ Detects token in URL         │
│ Shows password reset form     │
└────────┬─────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Password Reset Form         │
│ • New Password              │
│ • Confirm Password          │
│ • [Reset Password] button   │
│ • Password strength display │
└────────┬────────────────────┘
         │
         ▼ User enters new password
┌─────────────────────────────────────┐
│ Validate Password                   │
│ • Length ≥ 8                        │
│ • Contains UPPERCASE                │
│ • Contains lowercase                │
│ • Contains number                   │
│ • Passwords match                   │
└────────┬────────────────────────────┘
         │
         ├─ Invalid? → Show Error
         │
         └─ Valid
             │
             ▼
┌────────────────────────────────┐
│ POST /api/auth/reset-password  │
│ {                              │
│   "token": "xxx",              │
│   "new_password": "..."        │
│ }                              │
└────────┬───────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Backend:                        │
│ • Validate reset token          │
│ • Check token not expired       │
│ • Check token not already used  │
│ • Hash new password             │
│ • Update user password          │
│ • Invalidate reset token        │
└────────┬────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Response 200 OK              │
│ "Password reset successfully"│
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Frontend:                    │
│ • Show success message       │
│ • Auto-redirect after 2 sec  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Redirect to auth.html        │
│ User can now login with      │
│ new password                 │
└──────────────────────────────┘
```

---

## Change Password Flow Diagram (Authenticated Users)

```
┌──────────────────────────────┐
│ Logged In User               │
│ Goes to change-password.html │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Check Authentication         │
│ isAuthenticated() === true?  │
└────────┬─────────────────────┘
         │
         ├─ Not Authenticated? → Redirect to auth.html
         │
         └─ Authenticated
             │
             ▼
┌──────────────────────────────────┐
│ Change Password Form             │
│ • Current Password               │
│ • New Password                   │
│ • Confirm New Password           │
│ • [Change Password] button       │
│ • Password strength indicator    │
└────────┬─────────────────────────┘
         │
         ▼ User enters passwords
┌──────────────────────────────────┐
│ Validate Form                    │
│ • Current password not empty     │
│ • New password meets criteria    │
│ • Passwords match                │
│ • New ≠ Old password             │
└────────┬─────────────────────────┘
         │
         ├─ Invalid? → Show Error & Stop
         │
         └─ Valid
             │
             ▼
┌────────────────────────────────┐
│ POST /api/auth/change-password │
│ Headers:                        │
│ Authorization: Bearer {token}   │
│ {                              │
│   "old_password": "...",        │
│   "new_password": "..."         │
│ }                              │
└────────┬───────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Backend (Authenticated Request)         │
│ • Validate Bearer token                 │
│ • Get current user from token           │
│ • Verify old password matches            │
│ • Hash new password                     │
│ • Update user password                  │
└────────┬────────────────────────────────┘
         │
         ├─ Old Password Wrong? → Error 401
         │   ↓
         │   Show "Current password is incorrect"
         │
         ├─ New Password Invalid? → Error 422
         │   ↓
         │   Show validation error
         │
         └─ Success
             │
             ▼
┌──────────────────────────────┐
│ Response 200 OK              │
│ "Password changed successfully
│ "                            │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Frontend:                    │
│ • Show success message       │
│ • Clear form                 │
│ • Optional: Auto-logout      │
│ • Auto-redirect after 2 sec  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Redirect to dashboard.html   │
│ or auth.html (if auto-logout)│
└──────────────────────────────┘
```

---

## Token Lifecycle Diagram

```
                   ┌─────────────────────┐
                   │ User Login/Signup   │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Backend Issues JWT  │
                   │ Tokens              │
                   └──────────┬──────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
                    ▼                    ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │ Access Token         │  │ Refresh Token        │
        │                      │  │                      │
        │ • Short-lived        │  │ • Longer-lived       │
        │ • Used in requests   │  │ • For token renewal  │
        │ • Expires: 15-30min  │  │ • Expires: 7-30 days │
        └──────────┬───────────┘  └──────────┬───────────┘
                   │                         │
                   ▼                         ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │ Stored in            │  │ Stored in            │
        │ localStorage         │  │ localStorage         │
        │ .access_token        │  │ .refresh_token       │
        └──────────┬───────────┘  └──────────┬───────────┘
                   │                         │
                   ▼                         │
        ┌──────────────────────┐             │
        │ Used in API requests │             │
        │ Authorization header │             │
        │ Bearer {access_token}│             │
        └──────────┬───────────┘             │
                   │                         │
                   ▼                         │
        ┌──────────────────────┐             │
        │ Token Expires        │             │
        │ (15-30 minutes)      │             │
        └──────────┬───────────┘             │
                   │                         │
                   │◄────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Use Refresh Token    │
        │ to get new           │
        │ Access Token         │
        │ (Future feature)     │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ New Access Token     │
        │ Stored in            │
        │ localStorage         │
        └──────────┬───────────┘
                   │
                   └──── Continues until...
                        │
                        ▼
                ┌──────────────────────┐
                │ User Clicks Logout   │
                │ or Refresh Token     │
                │ Expires              │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Clear All Tokens     │
                │ .access_token = null │
                │ .refresh_token = null│
                │ .is_authenticated=   │
                │ false                │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Redirect to Login    │
                │ auth.html            │
                └──────────────────────┘
```

---

## Component Integration Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Dashboard Application                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Niches Page │  │ Analytics    │  │ Settings/Profile     │  │
│  │  (Protected) │  │ (Protected)  │  │ (Protected)          │  │
│  └────────┬─────┘  └────────┬─────┘  └──────────┬───────────┘  │
│           │                 │                    │               │
│           └─────────────────┼────────────────────┘               │
│                             │                                    │
│            Check: isAuthenticated()                              │
│                             │                                    │
│             ┌───────────────┼───────────────┐                    │
│             │               │               │                    │
│             ├─ False → Redirect to auth.html  │                    │
│             │               │               │                    │
│             └─ True ────────┼───────────────┘                    │
│                             │                                    │
│                             ▼                                    │
│         ┌────────────────────────────────┐                       │
│         │  Get Authorization Header      │                       │
│         │  headers = getAuthHeader()      │                       │
│         │  {                             │                       │
│         │    'Authorization':            │                       │
│         │    'Bearer {access_token}'     │                       │
│         │  }                             │                       │
│         └────────────┬───────────────────┘                       │
│                      │                                           │
│                      ▼                                           │
│         ┌────────────────────────────────┐                       │
│         │  Make Authenticated API Calls  │                       │
│         │  fetch('/api/data', {          │                       │
│         │    headers: getAuthHeader()    │                       │
│         │  })                            │                       │
│         └────────────┬───────────────────┘                       │
│                      │                                           │
│                      ▼                                           │
│         ┌────────────────────────────────┐                       │
│         │  Render Protected Content      │                       │
│         │  Display user data, charts,    │                       │
│         │  and user-specific features    │                       │
│         └────────────────────────────────┘                       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ User Menu / Header                                       │  │
│  │ • User Name / Avatar (from token)                        │  │
│  │ • [Change Password] link                                 │  │
│  │ • [Logout] button → logout()                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

**Version:** 1.0  
**Last Updated:** November 22, 2025
