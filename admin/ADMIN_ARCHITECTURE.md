# Admin Dashboard Architecture - New Structure

**Last Updated:** November 23, 2025
**Status:** Production Ready

---

## 📋 Overview

The admin dashboard has been refactored to use **only the 8 core endpoints** with a **modular architecture** where each page is a separate, standalone JavaScript file.

### Core Endpoints

1. **GET** `/api/admin/stats/overview` - Admin overview statistics
2. **GET** `/api/admin/users` - List all users
3. **GET** `/api/admin/users/{user_id}` - Get user details
4. **PUT** `/api/admin/users/{user_id}/tier` - Update user tier
5. **GET** `/api/admin/revenue/breakdown` - Revenue breakdown by tier/category
6. **GET** `/api/admin/activity` - Admin activity log
7. **POST** `/api/admin/users/{user_id}/suspend` - Suspend a user
8. **POST** `/api/admin/users/{user_id}/activate` - Activate a user

---

## 🏗️ Directory Structure

```
admin/
├── index.html                 # Main admin panel UI
├── admin.js                   # Main controller & router
├── admin-pages.js             # [DEPRECATED] - old monolithic file
├── pages/
│   ├── overview.js            # Overview page
│   └── users.js               # Users management page
└── README.md                  # Documentation

assets/
├── js/
│   └── api.js                 # API client (reused)
└── css/
    └── dash.css               # Styling (reused)
```

---

## 🚀 File Breakdown

### **admin.js** - Main Controller
- **Purpose:** Entry point, routing, and page loading
- **Functions:**
  - `initAdminPanel()` - Initialize on page load
  - `loadAdminPage(pageName)` - Route to requested page
  - `setupEventListeners()` - Setup UI interactions
  - `navigateToAdminPage(pageName)` - Navigate from HTML onclick
  - `updatePageHeader(pageName)` - Update title/breadcrumb
  - `toggleTheme()` - Dark/light mode toggle
  - `logout()` - User logout
  - `closeAllModals()` - Close all modal dialogs

**Key Features:**
- Dynamic script loading via `loadScript()`
- Non-admin redirect to dashboard
- Mobile responsive sidebar toggle
- Theme persistence

---

### **pages/overview.js** - Admin Overview
- **Purpose:** Dashboard overview with key statistics
- **API Calls:**
  - `GET /api/admin/stats/overview` - Statistics
  - `GET /api/admin/activity` - Activity log
  - `GET /api/admin/revenue/breakdown` - Revenue data

**Exported Functions:**
- `loadOverviewPage()` - Main page loader
- `loadRevenueBreakdown()` - Load revenue stats
- `renderStatCard()` - UI helper
- `renderActivityTable()` - UI helper

**Display Elements:**
- Stat cards: Total Users, Active Users, Suspended Users, Total Revenue
- Revenue breakdown by tier/category
- Recent activity log with timestamps

---

### **pages/users.js** - User Management
- **Purpose:** Manage users with suspend/activate/tier update
- **API Calls:**
  - `GET /api/admin/users` - List all users
  - `GET /api/admin/users/{userId}` - Get user details
  - `PUT /api/admin/users/{userId}/tier` - Update tier
  - `POST /api/admin/users/{userId}/suspend` - Suspend user
  - `POST /api/admin/users/{userId}/activate` - Activate user

**Exported Functions:**
- `loadUsersPage()` - Main page loader
- `viewUserDetails(userId)` - Open details modal
- `updateUserTier(userId)` - Update user tier
- `suspendUser(userId)` / `suspendUserConfirm(userId)` - Suspend user
- `activateUser(userId)` - Activate user
- `filterUsers()` - Search/filter users
- `renderUserRow(user)` - UI helper
- `closeUserDetailsModal()` - Close modal

**Display Elements:**
- User table with search/filter
- Action buttons: View, Suspend/Activate
- User details modal with tier selector
- Status badges (Active/Suspended)

---

## 📊 API Response Expectations

### `/api/admin/stats/overview`
```json
{
  "total_users": 1250,
  "active_users": 980,
  "suspended_users": 50,
  "total_revenue": 15234.50
}
```

### `/api/admin/users`
```json
[
  {
    "id": "user_123",
    "email": "user@example.com",
    "tier": "pro",
    "is_suspended": false,
    "created_at": "2025-01-15T10:30:00Z"
  },
  ...
]
```

### `/api/admin/users/{user_id}`
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "tier": "pro",
  "is_suspended": false,
  "created_at": "2025-01-15T10:30:00Z"
}
```

### `/api/admin/revenue/breakdown`
```json
{
  "free": 0,
  "pro": 5234.50,
  "premium": 10000.00
}
```

### `/api/admin/activity`
```json
[
  {
    "action": "User Suspended",
    "user_id": "admin_user",
    "timestamp": "2025-11-23T15:30:00Z",
    "details": "Suspended user_456 for policy violation"
  },
  ...
]
```

---

## 🛠️ How to Add New Pages

### Step 1: Create New Page File
Create `admin/pages/[pagename].js`:

```javascript
/**
 * Admin [Page Name] Page
 * Description of what this page does
 */

async function load[PageName]Page() {
    const adminContent = document.getElementById('adminContent');
    
    try {
        // 1. Show loading state
        adminContent.innerHTML = '<div class="loading-container">...</div>';

        // 2. Fetch data from API
        const data = await API.call('GET', '/api/admin/endpoint');

        // 3. Render HTML
        let html = `...`;
        adminContent.innerHTML = html;

    } catch (error) {
        // 4. Show error state
        adminContent.innerHTML = `<div class="error-state">...</div>`;
    }
}

// Additional helper functions
function helperFunction() { ... }
```

### Step 2: Add Route in admin.js
In the `switch` statement of `loadAdminPage()`:

```javascript
case 'pagename':
    if (typeof load[PageName]Page === 'undefined') {
        await loadScript('pages/[pagename].js');
    }
    await load[PageName]Page();
    break;
```

### Step 3: Add Navigation Item
In `admin/index.html` sidebar:

```html
<a href="javascript:void(0)" onclick="navigateToAdminPage('pagename'); return false;" class="nav-item">
    <i class="fas fa-icon"></i>
    <span>Page Name</span>
</a>
```

### Step 4: Update Page Map
In `updateSidebarActive()` function in `admin.js`:

```javascript
const pageMap = {
    'overview': 0,
    'users': 1,
    'pagename': 2,  // Add new entry
    ...
};
```

---

## 🔒 Security Features

- **Bearer Token Authentication:** All API calls include authorization
- **Non-Admin Redirect:** Checks `is_admin` flag and redirects to dashboard
- **Error Handling:** No sensitive data exposed in error messages
- **Input Validation:** Forms validated before submission
- **CSRF Ready:** Architecture supports token-based protection

---

## 📱 Responsive Design

- **Desktop:** Full sidebar + main content
- **Tablet:** Collapsible sidebar with toggle
- **Mobile:** Overlay sidebar with backdrop
- **Breakpoint:** 768px (handled by existing CSS)

---

## 🎨 Styling & Theming

**Color Scheme:**
- Primary Blue: `#3b82f6`
- Success Green: `#4ade80`
- Warning Orange: `#f97316`
- Danger Red: `#f87171`
- Purple: `#a855f7`

**Components:**
- Glass-morphism cards with backdrop blur
- Status badges with color coding
- Modal dialogs for detailed views
- Action buttons with hover states
- Search/filter inputs with styling

---

## 🔄 Data Flow

### Page Load Sequence
1. User navigates to `/admin/index.html`
2. `admin.js` initializes via `DOMContentLoaded`
3. `initAdminPanel()` checks authentication
4. `loadAdminPage('overview')` loads by default
5. Dynamic script loading occurs if needed
6. Page renders with API data

### User Interaction Flow
1. User clicks sidebar navigation link
2. `navigateToAdminPage(pageName)` is called
3. `loadAdminPage(pageName)` routes to correct page
4. Page script executes (e.g., `loadUsersPage()`)
5. API call fetches data
6. HTML renders with data
7. User interactions trigger new API calls

---

## 🧪 Testing

### Test Checklist
- [ ] All API endpoints respond correctly
- [ ] Error states display with retry buttons
- [ ] Search/filter functionality works
- [ ] Modal dialogs open/close properly
- [ ] User suspension/activation works
- [ ] Tier updates persist
- [ ] Non-admin users redirect to dashboard
- [ ] Mobile responsive layout functions
- [ ] Dark/light theme toggle works
- [ ] Logout clears tokens and redirects

---

## 📝 Development Notes

### Adding Dynamic Content
All dynamic content uses `getElementById()` and `.innerHTML`. Ensure IDs match:
- `#adminContent` - Main content area
- `#usersTableBody` - Users table body
- `#revenueBreakdownContent` - Revenue section
- `#recentActivityContent` - Activity section

### Error Handling Pattern
```javascript
try {
    // API call
    const data = await API.call(...);
    // Render success
} catch (error) {
    // Render error state with retry
    adminContent.innerHTML = `<div class="error-state">...</div>`;
}
```

### Loading State Pattern
```javascript
adminContent.innerHTML = `
    <div class="loading-container">
        <div class="spinner"></div>
        <p>Loading...</p>
    </div>
`;
```

---

## 🚀 Performance

- **Lazy Loading:** Scripts loaded on demand
- **Caching:** API client handles token refresh
- **Minimal Repaints:** DOM updates batched
- **No External Dependencies:** Uses vanilla JS + Font Awesome

---

## 🔄 Migration from Old System

**Old System:** Single `admin-pages.js` with all pages
**New System:** Modular pages in `pages/` directory

**Breaking Changes:**
- Functions renamed to `load[PageName]Page()`
- Navigation functions updated
- New file structure

**Backward Compatibility:**
- `admin-pages.js` still exists but unused
- Can be deleted after transition

---

## 📞 Support

For issues or questions:
1. Check API responses match expected format
2. Verify Bearer token is included in headers
3. Check browser console for errors
4. Ensure endpoints are implemented on backend

---

**Status:** ✅ Production Ready
All pages are implemented with robust error handling and responsive design.
