# Admin Dashboard - Quick Reference

## 🎯 Core Endpoints (8 Total)

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| GET | `/api/admin/stats/overview` | Dashboard stats | `{total_users, active_users, suspended_users, total_revenue}` |
| GET | `/api/admin/users` | List all users | `[{id, email, tier, is_suspended, created_at}, ...]` |
| GET | `/api/admin/users/{id}` | User details | `{id, email, tier, is_suspended, created_at, ...}` |
| PUT | `/api/admin/users/{id}/tier` | Update tier | `{success: true, new_tier: "pro"}` |
| GET | `/api/admin/revenue/breakdown` | Revenue by tier | `{free: 0, pro: 5000, premium: 10000}` |
| GET | `/api/admin/activity` | Activity log | `[{action, user_id, timestamp, details}, ...]` |
| POST | `/api/admin/users/{id}/suspend` | Suspend user | `{success: true}` |
| POST | `/api/admin/users/{id}/activate` | Activate user | `{success: true}` |

---

## 📁 File Structure

```
admin/
├── index.html                 # Main UI
├── admin.js                   # Router & controller
├── pages/
│   ├── overview.js            # Overview page
│   └── users.js               # Users page
└── ADMIN_ARCHITECTURE.md      # Full docs
```

---

## 🚀 Implemented Pages

### Overview (`pages/overview.js`)
- Stat cards: Total Users, Active Users, Suspended, Revenue
- Revenue breakdown table
- Recent activity log
- **Endpoints:** `/api/admin/stats/overview`, `/api/admin/activity`, `/api/admin/revenue/breakdown`

### Users (`pages/users.js`)
- User table with search/filter
- View details modal
- Update tier functionality
- Suspend/Activate buttons
- **Endpoints:** `/api/admin/users`, `/api/admin/users/{id}`, `/api/admin/users/{id}/tier`, `/api/admin/users/{id}/suspend`, `/api/admin/users/{id}/activate`

---

## 🔗 Navigation

All pages load via `navigateToAdminPage()`:

```html
<!-- In HTML onclick handlers -->
onclick="navigateToAdminPage('overview')"
onclick="navigateToAdminPage('users')"
```

---

## 📐 Page Template

Every page follows this structure:

```javascript
async function load[PageName]Page() {
    const adminContent = document.getElementById('adminContent');
    
    // Show loading
    adminContent.innerHTML = `<div class="loading-container">...</div>`;

    try {
        // Fetch data
        const data = await API.call('GET', '/api/admin/endpoint');
        
        // Render content
        let html = `...`;
        adminContent.innerHTML = html;

    } catch (error) {
        // Show error with retry
        adminContent.innerHTML = `<div class="error-state">...</div>`;
    }
}
```

---

## 🎨 UI Components

### Stat Card
```javascript
renderStatCard(label, value, icon, color)
// Returns HTML for a stat card with icon
```

### Status Badge
```html
<span class="status-badge" style="background: rgba(...); color: ...;">
    ${status}
</span>
```

### Action Buttons
```html
<button class="btn-small btn-view">View</button>
<button class="btn-small btn-suspend">Suspend</button>
<button class="btn-small btn-activate">Activate</button>
```

---

## 🔐 Authentication

- Bearer token from `localStorage.getItem('access_token')`
- Admin check: `localStorage.getItem('is_admin') === 'true'`
- Non-admin redirect to `/dashboard.html`
- Logout clears tokens and returns to `/auth.html`

---

## 🛠️ Adding a New Page

### 1. Create Page File
```javascript
// admin/pages/newpage.js
async function loadNewPage() {
    const adminContent = document.getElementById('adminContent');
    // ... implementation
}
```

### 2. Add Route in admin.js
```javascript
case 'newpage':
    if (typeof loadNewPage === 'undefined') {
        await loadScript('pages/newpage.js');
    }
    await loadNewPage();
    break;
```

### 3. Add Navigation Link
```html
<!-- In admin/index.html sidebar -->
<a href="javascript:void(0)" onclick="navigateToAdminPage('newpage'); return false;" class="nav-item">
    <i class="fas fa-icon"></i>
    <span>New Page</span>
</a>
```

### 4. Update Page Map
```javascript
const pageMap = {
    'overview': 0,
    'users': 1,
    'newpage': 2,  // Add here
};
```

---

## 🎯 API Utility Functions

### Make API Call
```javascript
const data = await API.call('GET', '/api/endpoint');
const response = await API.call('PUT', '/api/endpoint', { key: 'value' });
```

### Error Handling
```javascript
try {
    const data = await API.call('GET', '/api/endpoint');
} catch (error) {
    console.error('Error:', error.message);
}
```

---

## 💾 Data Flow Example

### Load Users
```
1. navigateToAdminPage('users')
     ↓
2. loadAdminPage('users')
     ↓
3. loadScript('pages/users.js')
     ↓
4. loadUsersPage()
     ↓
5. API.call('GET', '/api/admin/users')
     ↓
6. Render users table
```

### Update User Tier
```
1. Click "Update Tier" button
     ↓
2. updateUserTier(userId)
     ↓
3. API.call('PUT', '/api/admin/users/{id}/tier', {tier: value})
     ↓
4. Show success/error
     ↓
5. Reload users page
```

---

## 🧪 Testing Endpoints

### Using cURL
```bash
# Get stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/api/admin/stats/overview

# Get users
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/api/admin/users

# Update tier
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier":"pro"}' \
  https://api.example.com/api/admin/users/{id}/tier
```

---

## ⚡ Performance Tips

- Scripts load only when page is accessed
- Minimal DOM manipulation
- Batch updates where possible
- Use `.catch()` for error handling

---

## 📝 Common Issues

**Issue:** Pages not loading
**Fix:** Check browser console for errors, verify API endpoints

**Issue:** User actions not working
**Fix:** Verify Bearer token is valid, check API response format

**Issue:** Modal not closing
**Fix:** Ensure modal element ID matches in HTML

**Issue:** Search not filtering
**Fix:** Verify `window.allUsers` is populated before filtering

---

## 🚀 Deployment

1. Verify all 8 endpoints are implemented on backend
2. Test each page in browser
3. Check error handling with network offline
4. Verify non-admin users are redirected
5. Test on mobile devices
6. Verify theme toggle and logout work

---

**Last Updated:** November 23, 2025
**Version:** 1.0
**Status:** Production Ready ✅
