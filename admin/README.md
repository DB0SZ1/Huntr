# Admin Dashboard

The admin panel for Niche Finder system management.

## Features

### Overview Dashboard
- Total users count
- Active subscriptions count
- Monthly revenue
- Total niches
- Recent activity log

### Users Management
- View all users with details
- User suspension/activation
- User deletion
- Detailed user information modal

### Subscriptions Management
- Monitor all active subscriptions
- Subscription details view
- Track renewal dates
- View subscription amounts

### Analytics Dashboard
- Revenue analytics and trends
- Top niches by usage
- Platform usage statistics
- Growth metrics

### System Monitoring
- System health status
- API metrics and response times
- Scraper status
- Active sessions
- Recent errors log

### Reports & Exports
- Export users to CSV
- Export subscriptions to CSV
- Generate activity report
- Generate revenue report

## API Endpoints Used

### Admin Endpoints
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/{user_id}` - Get user details
- `DELETE /api/admin/users/{user_id}` - Delete user
- `POST /api/admin/users/{user_id}/suspend` - Suspend user
- `POST /api/admin/users/{user_id}/activate` - Activate user
- `GET /api/admin/subscriptions` - List subscriptions
- `GET /api/admin/analytics/revenue` - Revenue analytics
- `GET /api/admin/analytics/niches` - Niches analytics
- `GET /api/admin/analytics/platforms` - Platform analytics
- `GET /api/admin/activity` - Recent activity

### Monitoring Endpoints
- `GET /api/monitoring/health` - System health
- `GET /api/monitoring/api-metrics` - API metrics
- `GET /api/monitoring/scraper-status` - Scraper status
- `GET /api/monitoring/active-sessions` - Active sessions
- `GET /api/monitoring/errors` - Recent errors

### Reports Endpoints
- `GET /api/reports/users/export` - Export users
- `GET /api/reports/subscriptions/export` - Export subscriptions
- `GET /api/reports/activity` - Activity report
- `GET /api/reports/revenue` - Revenue report

## File Structure

```
admin/
├── index.html          # Main admin page template
└── admin-pages.js      # Page navigation and logic
```

## Styling

Uses `dash.css` as the base stylesheet with custom admin-specific styling for:
- Admin badges
- Status badges
- Action buttons
- Data tables
- Modals
- Export buttons

## Usage

1. Navigate to `/admin/` or `/admin/index.html`
2. Select a section from the sidebar
3. View data and perform actions
4. Export reports as needed

## Authentication

Admin panel requires authentication via the main `API.js` module. Users must be logged in with admin privileges.

## Generic API Method

The admin panel uses `API.call(method, endpoint, body)` for flexible API requests:

```javascript
// GET request
const data = await API.call('GET', '/api/admin/users');

// POST request
await API.call('POST', `/api/admin/users/${userId}/suspend`);

// DELETE request
await API.call('DELETE', `/api/admin/users/${userId}`);
```
