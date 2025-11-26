# Admin Dashboard - API Endpoint Specifications

**Version:** 1.0
**Date:** November 23, 2025
**Status:** Production Ready

---

## 📡 Core Endpoints (8 Total)

### 1. GET /api/admin/stats/overview
**Purpose:** Get admin dashboard overview statistics

**Request:**
```
GET /api/admin/stats/overview
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "total_users": 1250,
  "active_users": 980,
  "suspended_users": 50,
  "total_revenue": 15234.50
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "detail": "Not authenticated"
}
```

**Used By:** `pages/overview.js` - Overview page stats cards

---

### 2. GET /api/admin/users
**Purpose:** List all users in the system

**Request:**
```
GET /api/admin/users
Authorization: Bearer {access_token}
```

**Query Parameters (Optional):**
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 50)
- `search` - Search by email/username
- `status` - Filter by status (active/suspended)

**Response:** `200 OK`
```json
[
  {
    "id": "user_123abc",
    "email": "user@example.com",
    "tier": "pro",
    "is_suspended": false,
    "created_at": "2025-01-15T10:30:00Z",
    "last_login": "2025-11-23T14:22:00Z",
    "subscription_tier": "pro"
  },
  {
    "id": "user_456def",
    "email": "another@example.com",
    "tier": "free",
    "is_suspended": true,
    "created_at": "2025-03-20T08:15:00Z",
    "last_login": null,
    "subscription_tier": "free"
  }
]
```

**Alternative Response (Paginated):**
```json
{
  "users": [...],
  "total": 1250,
  "page": 1,
  "per_page": 50,
  "total_pages": 25
}
```

**Error Response:** `401 Unauthorized` / `403 Forbidden`

**Used By:** `pages/users.js` - Load users table

---

### 3. GET /api/admin/users/{user_id}
**Purpose:** Get detailed information about a specific user

**Request:**
```
GET /api/admin/users/{user_id}
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `user_id` - The user's ID (e.g., "user_123abc")

**Response:** `200 OK`
```json
{
  "id": "user_123abc",
  "email": "user@example.com",
  "tier": "pro",
  "is_suspended": false,
  "created_at": "2025-01-15T10:30:00Z",
  "last_login": "2025-11-23T14:22:00Z",
  "subscription_tier": "pro",
  "subscription_expires_at": "2025-12-15T10:30:00Z",
  "total_scans": 487,
  "active_subscriptions": 1,
  "payment_method": "card",
  "last_payment": "2025-11-15T00:00:00Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "detail": "User not found"
}
```

**Used By:** `pages/users.js` - Load user details modal

---

### 4. PUT /api/admin/users/{user_id}/tier
**Purpose:** Update a user's subscription tier

**Request:**
```
PUT /api/admin/users/{user_id}/tier
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "tier": "premium"
}
```

**Path Parameters:**
- `user_id` - The user's ID

**Request Body:**
```json
{
  "tier": "free|pro|premium|enterprise"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user_id": "user_123abc",
  "previous_tier": "pro",
  "new_tier": "premium",
  "updated_at": "2025-11-23T15:45:00Z"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "detail": "Invalid tier specified"
}
```

**Used By:** `pages/users.js` - Update tier modal

---

### 5. GET /api/admin/revenue/breakdown
**Purpose:** Get revenue breakdown by tier or category

**Request:**
```
GET /api/admin/revenue/breakdown
Authorization: Bearer {access_token}
```

**Query Parameters (Optional):**
- `period` - Time period (daily/weekly/monthly, default: monthly)
- `type` - Breakdown type (tier/payment_method/region, default: tier)

**Response:** `200 OK`
```json
{
  "free": 0,
  "pro": 5234.50,
  "premium": 8500.00,
  "enterprise": 1500.00
}
```

**Alternative Response (by Payment Method):**
```json
{
  "card": 12500.00,
  "paypal": 2734.50,
  "stripe": 1000.00
}
```

**Used By:** `pages/overview.js` - Revenue breakdown section

---

### 6. GET /api/admin/activity
**Purpose:** Get admin activity log

**Request:**
```
GET /api/admin/activity
Authorization: Bearer {access_token}
```

**Query Parameters (Optional):**
- `limit` - Number of records (default: 10, max: 100)
- `offset` - Offset for pagination (default: 0)
- `type` - Activity type filter (user_created/user_suspended/tier_updated, etc.)
- `start_date` - Filter by date (ISO 8601)
- `end_date` - Filter by date (ISO 8601)

**Response:** `200 OK`
```json
[
  {
    "id": "activity_789xyz",
    "action": "User Suspended",
    "user_id": "admin_user_001",
    "target_user_id": "user_456def",
    "timestamp": "2025-11-23T15:30:00Z",
    "details": "Suspended user_456 for policy violation",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  },
  {
    "id": "activity_790xyz",
    "action": "Tier Updated",
    "user_id": "admin_user_001",
    "target_user_id": "user_123abc",
    "timestamp": "2025-11-23T14:15:00Z",
    "details": "Updated tier from pro to premium",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  }
]
```

**Alternative Response (with Pagination):**
```json
{
  "activities": [...],
  "total": 5432,
  "limit": 10,
  "offset": 0
}
```

**Used By:** `pages/overview.js` - Recent activity table

---

### 7. POST /api/admin/users/{user_id}/suspend
**Purpose:** Suspend a user's account

**Request:**
```
POST /api/admin/users/{user_id}/suspend
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "reason": "Policy violation",
  "notify_user": true
}
```

**Path Parameters:**
- `user_id` - The user's ID

**Request Body (Optional):**
```json
{
  "reason": "Description of why user is being suspended",
  "notify_user": true|false,
  "duration": 7,
  "comments": "Admin notes"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user_id": "user_456def",
  "status": "suspended",
  "suspended_at": "2025-11-23T15:45:00Z",
  "suspended_by": "admin_user_001",
  "reason": "Policy violation",
  "notification_sent": true
}
```

**Error Response:** `400 Bad Request`
```json
{
  "detail": "User is already suspended"
}
```

**Used By:** `pages/users.js` - Suspend user button

---

### 8. POST /api/admin/users/{user_id}/activate
**Purpose:** Activate a suspended user's account

**Request:**
```
POST /api/admin/users/{user_id}/activate
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "notify_user": true
}
```

**Path Parameters:**
- `user_id` - The user's ID

**Request Body (Optional):**
```json
{
  "notify_user": true|false,
  "comments": "Admin notes"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user_id": "user_456def",
  "status": "active",
  "activated_at": "2025-11-23T16:00:00Z",
  "activated_by": "admin_user_001",
  "notification_sent": true
}
```

**Error Response:** `400 Bad Request`
```json
{
  "detail": "User is already active"
}
```

**Used By:** `pages/users.js` - Activate user button

---

## 🔐 Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer {access_token}
```

**Token Location:** `localStorage.getItem('access_token')`

**Token Refresh:**
- If 401 Unauthorized, API client automatically refreshes token
- Refresh token stored in `localStorage.getItem('refresh_token')`
- Retry request with new token

---

## 📊 Error Response Format

All error responses follow this format:

```json
{
  "detail": "Error description",
  "error_code": "ERROR_TYPE",
  "timestamp": "2025-11-23T15:45:00Z"
}
```

**Common Error Codes:**
- `UNAUTHORIZED` - Missing or invalid token
- `FORBIDDEN` - User doesn't have permission
- `NOT_FOUND` - Resource doesn't exist
- `BAD_REQUEST` - Invalid request parameters
- `VALIDATION_ERROR` - Input validation failed
- `INTERNAL_ERROR` - Server error

---

## 🔄 Request/Response Headers

**Required Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Response Headers (Expected):**
```
Content-Type: application/json
X-Request-ID: {request_id}
Cache-Control: no-cache
```

---

## ⏱️ Timeout & Rate Limiting

**Timeouts:**
- Default: 30 seconds
- Can be configured in API client

**Rate Limiting:**
- Recommended: 100 requests per minute per admin user
- Should be configured on backend

**Retry Logic:**
- Automatic retry on 5xx errors
- Exponential backoff: 1s, 2s, 4s
- Max 3 retries

---

## 📋 Data Type Reference

### User Object
```typescript
interface User {
  id: string                    // Unique user ID
  email: string                 // User email
  tier: "free" | "pro" | "premium" | "enterprise"
  is_suspended: boolean         // Suspension status
  created_at: ISO8601DateTime   // Account creation time
  last_login: ISO8601DateTime   // Last login (nullable)
  subscription_tier?: string    // Alternative tier field
  subscription_expires_at?: ISO8601DateTime
  total_scans?: number
  active_subscriptions?: number
  payment_method?: string
  last_payment?: ISO8601DateTime
}
```

### Activity Object
```typescript
interface Activity {
  id: string                    // Activity ID
  action: string                // Action name
  user_id: string               // Admin who performed action
  target_user_id?: string       // User affected by action
  timestamp: ISO8601DateTime    // When action occurred
  details: string               // Description
  ip_address?: string           // IP of admin
  user_agent?: string           // Browser info
}
```

### Stats Object
```typescript
interface Stats {
  total_users: number           // Total user count
  active_users: number          // Active user count
  suspended_users: number       // Suspended user count
  total_revenue: number         // Total revenue ($)
}
```

---

## 🧪 Testing with cURL

### Get Stats
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/api/admin/stats/overview
```

### Get Users
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/api/admin/users?page=1&per_page=10
```

### Get User Details
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/api/admin/users/user_123abc
```

### Update User Tier
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier":"premium"}' \
  https://api.example.com/api/admin/users/user_123abc/tier
```

### Suspend User
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Policy violation","notify_user":true}' \
  https://api.example.com/api/admin/users/user_456def/suspend
```

### Activate User
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notify_user":true}' \
  https://api.example.com/api/admin/users/user_456def/activate
```

### Get Revenue Breakdown
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/api/admin/revenue/breakdown
```

### Get Activity Log
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/api/admin/activity?limit=20&offset=0
```

---

## 📝 Implementation Checklist

For Backend Developers:

- [ ] Implement all 8 endpoints
- [ ] Add Bearer token authentication
- [ ] Return responses in exact JSON format specified
- [ ] Implement error handling with error codes
- [ ] Add rate limiting (recommended 100/min)
- [ ] Add logging/audit trail for admin actions
- [ ] Test all endpoints with valid/invalid tokens
- [ ] Test all endpoints with non-admin users
- [ ] Document any additional fields returned
- [ ] Set up monitoring for endpoint performance
- [ ] Configure CORS headers for admin domain
- [ ] Test with admin dashboard UI

For Frontend Developers:

- [ ] Verify all endpoints are reachable
- [ ] Test with valid Bearer token
- [ ] Test error scenarios (401, 403, 404, 500)
- [ ] Verify response format matches expectations
- [ ] Test loading states
- [ ] Test error states with retry
- [ ] Test on mobile devices
- [ ] Verify data displays correctly
- [ ] Test search/filter functionality
- [ ] Test modal dialogs
- [ ] Performance test with large datasets
- [ ] Accessibility test (keyboard, screen reader)

---

**Version:** 1.0
**Last Updated:** November 23, 2025
**Status:** Ready for Implementation ✅
