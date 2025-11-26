/**
 * admin-pages.js - Admin Panel Navigation and Pages
 * Handles all admin operations including user management, subscriptions, analytics, and monitoring
 */

// Check authentication and admin status
if (!requireAuth()) {
    window.location.href = '/auth.html';
}

// Current page state
let currentAdminPage = 'overview';
let adminData = {};

// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const adminContent = document.getElementById('adminContent');
const pageTitle = document.getElementById('pageTitle');
const breadcrumbPage = document.getElementById('breadcrumbPage');

// Initialize Admin Panel
async function initAdminPanel() {
    try {
        const user = await API.getCurrentUser();
        
        // Check if user is admin (you might need to add this to your API)
        // if (user.role !== 'admin') {
        //     window.location.href = '/dashboard.html';
        // }
        
        updateAdminUserProfile(user);
        setupAdminEventListeners();
        await navigateToAdminPage('overview');
        
    } catch (error) {
        console.error('Admin panel initialization failed:', error);
        adminContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #f87171; margin-bottom: 16px;"></i>
                <h3>Failed to Load Admin Panel</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Update Admin User Profile
function updateAdminUserProfile(user) {
    const userAvatars = document.querySelectorAll('.user-avatar');
    userAvatars.forEach(avatar => {
        if (user.profile_picture) {
            avatar.style.backgroundImage = `url(${user.profile_picture})`;
        } else {
            const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2);
            avatar.textContent = initials;
        }
    });
    
    const userName = document.querySelector('.user-name');
    if (userName) userName.textContent = user.name;
    
    const userEmail = document.querySelector('.user-email');
    if (userEmail) userEmail.textContent = user.email;
}

// Setup Event Listeners
function setupAdminEventListeners() {
    // Menu toggle: open/close sidebar
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('visible');
            sidebar.classList.toggle('hidden');
            sidebarOverlay.classList.toggle('active');
        });
    }
    
    // Close sidebar when clicking outside (on the overlay/background)
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('visible');
            sidebar.classList.add('hidden');
            sidebarOverlay.classList.remove('active');
        });
    }
    
    // Also close sidebar when clicking nav items
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.addEventListener('click', () => {
            sidebar.classList.add('hidden');
            sidebar.classList.remove('visible');
            sidebarOverlay.classList.remove('active');
        });
    });
}

// Navigate to Admin Page
async function navigateToAdminPage(page) {
    currentAdminPage = page;
    pageTitle.textContent = capitalizeFirst(page) + ' Dashboard';
    breadcrumbPage.textContent = capitalizeFirst(page);
    
    // Update nav items
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNav = document.querySelector(`.sidebar-nav [onclick*="navigateToAdminPage('${page}')"]`);
    if (activeNav) activeNav.classList.add('active');
    
    // Close sidebar on mobile (use same classes as main dashboard)
    sidebar.classList.add('hidden');
    sidebar.classList.remove('visible');
    sidebarOverlay.classList.remove('active');
    
    // Render page
    switch (page) {
        case 'overview':
            await renderAdminOverview();
            break;
        case 'users':
            await renderUsersPage();
            break;
        case 'subscriptions':
            await renderSubscriptionsPage();
            break;
        case 'analytics':
            await renderAnalyticsPage();
            break;
        case 'monitoring':
            await renderMonitoringPage();
            break;
        case 'reports':
            await renderReportsPage();
            break;
        case 'promotions':
            await renderPromotionsPage();
            break;
        default:
            await renderAdminOverview();
    }
}

// ===================== OVERVIEW PAGE =====================
async function renderAdminOverview() {
    adminContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading admin overview...</p>
        </div>
    `;
    
    try {
        // Fetch stats and activity with proper error handling
        const [stats, activityResponse] = await Promise.all([
            API.call('GET', '/api/admin/stats').catch(err => {
                console.error('Stats error:', err);
                return { total_users: 0, active_subscriptions: 0, monthly_revenue: 0, total_niches: 0 };
            }),
            API.call('GET', '/api/admin/activity?limit=10').catch(err => {
                console.error('Activity error:', err);
                return [];
            })
        ]);
        
        // Handle different response formats
        const activity = Array.isArray(activityResponse) ? activityResponse : 
                        (activityResponse?.activities || activityResponse?.data || []);
        
        let html = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">Admin Overview</h2>
                <p style="color: rgba(255, 255, 255, 0.6); margin-top: 8px;">System-wide analytics and management</p>
            </div>

            <div class="stats-grid-admin">
                <div class="stats-card">
                    <div class="stats-icon" style="background: rgba(59, 130, 246, 0.2); color: #3b82f6;">
                        <i class="fas fa-users"></i>
                    </div>
                    <div>
                        <div class="stats-value">${stats.total_users || 0}</div>
                        <div class="stats-description">Total Users</div>
                    </div>
                </div>

                <div class="stats-card">
                    <div class="stats-icon" style="background: rgba(16, 185, 129, 0.2); color: #10b981;">
                        <i class="fas fa-credit-card"></i>
                    </div>
                    <div>
                        <div class="stats-value">${stats.active_subscriptions || 0}</div>
                        <div class="stats-description">Active Subscriptions</div>
                    </div>
                </div>

                <div class="stats-card">
                    <div class="stats-icon" style="background: rgba(249, 115, 22, 0.2); color: #f97316;">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div>
                        <div class="stats-value">₦${(stats.monthly_revenue || 0).toLocaleString()}</div>
                        <div class="stats-description">Monthly Revenue</div>
                    </div>
                </div>

                <div class="stats-card">
                    <div class="stats-icon" style="background: rgba(168, 85, 247, 0.2); color: #a855f7;">
                        <i class="fas fa-bullseye"></i>
                    </div>
                    <div>
                        <div class="stats-value">${stats.total_niches || 0}</div>
                        <div class="stats-description">Total Niches</div>
                    </div>
                </div>
            </div>

            <div class="chart-container">
                <h3 style="margin-top: 0;">Recent Activity</h3>
                <div style="margin-top: 20px;">
                    ${activity && activity.length > 0 ? `
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            ${activity.slice(0, 10).map(item => `
                                <li style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); display: flex; justify-content: space-between;">
                                    <span>${item.action || item.activity || item.message || 'Activity'} - ${item.user || item.user_name || 'System'}</span>
                                    <span style="color: rgba(255, 255, 255, 0.5); font-size: 12px;">${formatDate(item.created_at || item.timestamp)}</span>
                                </li>
                            `).join('')}
                        </ul>
                    ` : `<p style="color: rgba(255, 255, 255, 0.5); text-align: center;">No recent activity</p>`}
                </div>
            </div>
        `;
        
        adminContent.innerHTML = html;
    } catch (error) {
        console.error('Failed to load admin overview:', error);
        adminContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #f87171; margin-bottom: 16px;"></i>
                <h3>Failed to Load Overview</h3>
                <p>${error.message}</p>
                <button class="btn-primary" onclick="renderAdminOverview()" style="margin-top: 16px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// ===================== USERS PAGE =====================
async function renderUsersPage() {
    adminContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading users...</p>
        </div>
    `;
    
    try {
        const response = await API.call('GET', '/api/admin/users?page=1&per_page=50');
        const users = response.users || response.data || (Array.isArray(response) ? response : []);
        
        let html = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">Users Management</h2>
                <p style="color: rgba(255, 255, 255, 0.6); margin-top: 8px;">Manage all system users</p>
            </div>

            <div class="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Subscription</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.length > 0 ? users.map(user => `
                            <tr>
                                <td>${user.name || 'N/A'}</td>
                                <td>${user.email || 'N/A'}</td>
                                <td>${user.tier || user.subscription_tier || 'free'}</td>
                                <td>
                                    <span class="status-badge ${user.is_suspended ? 'status-suspended' : 'status-active'}">
                                        ${user.is_suspended ? 'Suspended' : 'Active'}
                                    </span>
                                </td>
                                <td>${formatDate(user.created_at)}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn-small btn-view" onclick="viewUserDetails('${user._id || user.id}')">
                                            <i class="fas fa-eye"></i> View
                                        </button>
                                        ${user.is_suspended ? `
                                            <button class="btn-small btn-activate" onclick="activateUser('${user._id || user.id}')">
                                                <i class="fas fa-check"></i> Activate
                                            </button>
                                        ` : `
                                            <button class="btn-small btn-suspend" onclick="suspendUser('${user._id || user.id}')">
                                                <i class="fas fa-pause"></i> Suspend
                                            </button>
                                        `}
                                        <button class="btn-small btn-delete" onclick="deleteUser('${user._id || user.id}')">
                                            <i class="fas fa-trash"></i> Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="6" style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.5);">
                                    No users found
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        `;
        
        adminContent.innerHTML = html;
    } catch (error) {
        console.error('Failed to load users:', error);
        adminContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #f87171; margin-bottom: 16px;"></i>
                <h3>Failed to Load Users</h3>
                <p>${error.message}</p>
                <button class="btn-primary" onclick="renderUsersPage()" style="margin-top: 16px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// View User Details
async function viewUserDetails(userId) {
    try {
        const user = await API.call('GET', `/api/admin/users/${userId}`);
        
        const modal = document.getElementById('userDetailsModal');
        const content = document.getElementById('userDetailsContent');
        
        content.innerHTML = `
            <div class="form-group-admin">
                <label>User ID</label>
                <input type="text" value="${user._id || user.id}" readonly>
            </div>
            <div class="form-group-admin">
                <label>Name</label>
                <input type="text" value="${user.name || ''}" readonly>
            </div>
            <div class="form-group-admin">
                <label>Email</label>
                <input type="text" value="${user.email || ''}" readonly>
            </div>
            <div class="form-group-admin">
                <label>Subscription Tier</label>
                <input type="text" value="${user.tier || user.subscription_tier || 'free'}" readonly>
            </div>
            <div class="form-group-admin">
                <label>Status</label>
                <input type="text" value="${user.is_suspended ? 'Suspended' : 'Active'}" readonly>
            </div>
            <div class="form-group-admin">
                <label>Created At</label>
                <input type="text" value="${formatDate(user.created_at)}" readonly>
            </div>
            <div class="form-group-admin">
                <label>Total Niches</label>
                <input type="text" value="${user.total_niches || user.niche_count || 0}" readonly>
            </div>
            <div class="form-group-admin">
                <label>Total Opportunities</label>
                <input type="text" value="${user.total_opportunities || user.opportunity_count || 0}" readonly>
            </div>
        `;
        
        modal.classList.add('active');
    } catch (error) {
        alert('Failed to load user details: ' + error.message);
    }
}

// Close User Details Modal
function closeUserDetailsModal() {
    document.getElementById('userDetailsModal').classList.remove('active');
}

// Suspend User
async function suspendUser(userId) {
    if (!confirm('Are you sure you want to suspend this user?')) return;
    
    try {
        await API.call('POST', `/api/admin/users/${userId}/suspend`);
        alert('User suspended successfully');
        await renderUsersPage();
    } catch (error) {
        alert('Failed to suspend user: ' + error.message);
    }
}

// Activate User
async function activateUser(userId) {
    if (!confirm('Are you sure you want to activate this user?')) return;
    
    try {
        await API.call('POST', `/api/admin/users/${userId}/activate`);
        alert('User activated successfully');
        await renderUsersPage();
    } catch (error) {
        alert('Failed to activate user: ' + error.message);
    }
}

// Delete User
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
        await API.call('DELETE', `/api/admin/users/${userId}`);
        alert('User deleted successfully');
        await renderUsersPage();
    } catch (error) {
        alert('Failed to delete user: ' + error.message);
    }
}

// ===================== SUBSCRIPTIONS PAGE =====================
async function renderSubscriptionsPage() {
    adminContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading subscriptions...</p>
        </div>
    `;
    
    try {
        const response = await API.call('GET', '/api/admin/subscriptions?page=1&per_page=50');
        const subscriptions = response.subscriptions || response.data || (Array.isArray(response) ? response : []);
        
        let html = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">Subscriptions Management</h2>
                <p style="color: rgba(255, 255, 255, 0.6); margin-top: 8px;">Monitor and manage user subscriptions</p>
            </div>

            <div class="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Plan</th>
                            <th>Status</th>
                            <th>Start Date</th>
                            <th>Renewal Date</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subscriptions.length > 0 ? subscriptions.map(sub => `
                            <tr>
                                <td>${sub.user_name || sub.user?.name || 'N/A'}</td>
                                <td>${sub.plan_name || sub.tier || sub.plan || 'N/A'}</td>
                                <td>
                                    <span class="status-badge ${sub.is_active || sub.status === 'active' ? 'status-active' : 'status-suspended'}">
                                        ${sub.is_active || sub.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>${formatDate(sub.start_date || sub.created_at)}</td>
                                <td>${formatDate(sub.renewal_date || sub.next_billing_date)}</td>
                                <td>₦${(sub.amount || sub.price || 0).toLocaleString()}</td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="6" style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.5);">
                                    No subscriptions found
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        `;
        
        adminContent.innerHTML = html;
    } catch (error) {
        console.error('Failed to load subscriptions:', error);
        adminContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #f87171; margin-bottom: 16px;"></i>
                <h3>Failed to Load Subscriptions</h3>
                <p>${error.message}</p>
                <button class="btn-primary" onclick="renderSubscriptionsPage()" style="margin-top: 16px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Close Subscription Details Modal
function closeSubscriptionDetailsModal() {
    document.getElementById('subscriptionDetailsModal').classList.remove('active');
}

// ===================== ANALYTICS PAGE =====================
async function renderAnalyticsPage() {
    adminContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading analytics...</p>
        </div>
    `;
    
    try {
        const [signups, scans, engagement] = await Promise.all([
            API.call('GET', '/api/admin/analytics/signups').catch(err => ({ total: 0, this_month: 0, this_week: 0, trend: 0 })),
            API.call('GET', '/api/admin/analytics/scans').catch(err => ({ total: 0, this_month: 0, average_per_user: 0 })),
            API.call('GET', '/api/admin/analytics/engagement').catch(err => ({ active_users: 0, retention_rate: 0, avg_session_time: 0 }))
        ]);
        
        let html = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">Analytics Dashboard</h2>
                <p style="color: rgba(255, 255, 255, 0.6); margin-top: 8px;">System-wide analytics and insights</p>
            </div>

            <div class="stats-grid-admin">
                <div class="stats-card">
                    <div class="stats-icon" style="background: rgba(59, 130, 246, 0.2); color: #3b82f6;">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <div>
                        <div class="stats-value">${signups.this_month || 0}</div>
                        <div class="stats-description">Signups This Month</div>
                        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.5); margin-top: 4px;">Total: ${signups.total || 0}</div>
                    </div>
                </div>

                <div class="stats-card">
                    <div class="stats-icon" style="background: rgba(16, 185, 129, 0.2); color: #10b981;">
                        <i class="fas fa-scanner"></i>
                    </div>
                    <div>
                        <div class="stats-value">${scans.this_month || 0}</div>
                        <div class="stats-description">Scans This Month</div>
                        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.5); margin-top: 4px;">Total: ${scans.total || 0}</div>
                    </div>
                </div>

                <div class="stats-card">
                    <div class="stats-icon" style="background: rgba(249, 115, 22, 0.2); color: #f97316;">
                        <i class="fas fa-users-slash"></i>
                    </div>
                    <div>
                        <div class="stats-value">${engagement.active_users || 0}</div>
                        <div class="stats-description">Active Users</div>
                        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.5); margin-top: 4px;">Retention: ${(engagement.retention_rate || 0).toFixed(1)}%</div>
                    </div>
                </div>

                <div class="stats-card">
                    <div class="stats-icon" style="background: rgba(168, 85, 247, 0.2); color: #a855f7;">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div>
                        <div class="stats-value">${(engagement.avg_session_time || 0).toFixed(1)}m</div>
                        <div class="stats-description">Avg Session Time</div>
                        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.5); margin-top: 4px;">Per User</div>
                    </div>
                </div>
            </div>

            <div class="chart-container">
                <h3>Signups Analytics</h3>
                <table style="width: 100%; margin-top: 20px;">
                    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                        <td style="padding: 12px; color: rgba(255, 255, 255, 0.7);">This Week</td>
                        <td style="padding: 12px; text-align: right; font-weight: 600;">${signups.this_week || 0}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                        <td style="padding: 12px; color: rgba(255, 255, 255, 0.7);">This Month</td>
                        <td style="padding: 12px; text-align: right; font-weight: 600;">${signups.this_month || 0}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; color: rgba(255, 255, 255, 0.7);">Trend</td>
                        <td style="padding: 12px; text-align: right; font-weight: 600; color: ${signups.trend >= 0 ? '#10b981' : '#ef4444'};">
                            ${signups.trend >= 0 ? '+' : ''}${(signups.trend || 0).toFixed(1)}%
                        </td>
                    </tr>
                </table>
            </div>

            <div class="chart-container">
                <h3>Scans Analytics</h3>
                <table style="width: 100%; margin-top: 20px;">
                    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                        <td style="padding: 12px; color: rgba(255, 255, 255, 0.7);">Total Scans</td>
                        <td style="padding: 12px; text-align: right; font-weight: 600;">${scans.total || 0}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                        <td style="padding: 12px; color: rgba(255, 255, 255, 0.7);">This Month</td>
                        <td style="padding: 12px; text-align: right; font-weight: 600;">${scans.this_month || 0}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; color: rgba(255, 255, 255, 0.7);">Average Per User</td>
                        <td style="padding: 12px; text-align: right; font-weight: 600;">${(scans.average_per_user || 0).toFixed(2)}</td>
                    </tr>
                </table>
            </div>
        `;
        
        adminContent.innerHTML = html;
    } catch (error) {
        console.error('Failed to load analytics:', error);
        adminContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #f87171; margin-bottom: 16px;"></i>
                <h3>Failed to Load Analytics</h3>
                <p>${error.message}</p>
                <button class="btn-primary" onclick="renderAnalyticsPage()" style="margin-top: 16px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// ===================== MONITORING PAGE =====================
async function renderMonitoringPage() {
    adminContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading monitoring data...</p>
        </div>
    `;
    
    try {
        const [health, metrics, scraper, sessions, errors] = await Promise.all([
            API.call('GET', '/api/monitoring/health').catch(err => ({ status: 'unknown', uptime_hours: 0, cpu_usage: 0, memory_usage: 0 })),
            API.call('GET', '/api/monitoring/api-metrics?hours=24').catch(err => ({ total_requests: 0, avg_response_time: 0, error_rate: 0 })),
            API.call('GET', '/api/monitoring/scraper-status').catch(err => ({ is_active: false, last_scan: null, scanned_today: 0 })),
            API.call('GET', '/api/monitoring/active-sessions').catch(err => ({ total: 0, peak_today: 0 })),
            API.call('GET', '/api/monitoring/errors?hours=24&limit=10').catch(err => [])
        ]);
        
        const errorsList = Array.isArray(errors) ? errors : (errors?.data || errors?.errors || []);
        
        let html = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">System Monitoring</h2>
                <p style="color: rgba(255, 255, 255, 0.6); margin-top: 8px;">Monitor system health and performance</p>
            </div>

            <div class="chart-container">
                <h3>System Health</h3>
                <div style="margin-top: 20px;">
                    <p>Status: <strong style="color: ${health.status === 'healthy' ? '#4ade80' : '#f87171'}">${health.status}</strong></p>
                    <p>Uptime: <strong>${(health.uptime_hours || 0).toFixed(1)} hours</strong></p>
                    <p>CPU Usage: <strong>${(health.cpu_usage || 0).toFixed(2)}%</strong></p>
                    <p>Memory Usage: <strong>${(health.memory_usage || 0).toFixed(2)}%</strong></p>
                </div>
            </div>

            <div class="chart-container">
                <h3>API Metrics</h3>
                <div style="margin-top: 20px;">
                    <p>Total Requests: <strong>${metrics.total_requests || 0}</strong></p>
                    <p>Avg Response Time: <strong>${(metrics.avg_response_time || 0).toFixed(0)}ms</strong></p>
                    <p>Error Rate: <strong>${(metrics.error_rate || 0).toFixed(2)}%</strong></p>
                </div>
            </div>

            <div class="chart-container">
                <h3>Scraper Status</h3>
                <div style="margin-top: 20px;">
                    <p>Status: <strong style="color: ${scraper.is_active ? '#4ade80' : '#f87171'}">${scraper.is_active ? 'Active' : 'Inactive'}</strong></p>
                    <p>Last Scan: <strong>${formatDate(scraper.last_scan)}</strong></p>
                    <p>Scanned Today: <strong>${scraper.scanned_today || 0}</strong></p>
                </div>
            </div>

            <div class="chart-container">
                <h3>Active Sessions</h3>
                <div style="margin-top: 20px;">
                    <p>Total Sessions: <strong>${sessions.total || sessions.active_sessions || 0}</strong></p>
                    <p>Peak Today: <strong>${sessions.peak_today || sessions.peak || 0}</strong></p>
                </div>
            </div>

            <div class="chart-container">
                <h3>Recent Errors</h3>
                <div style="margin-top: 20px;">
                    ${errorsList && errorsList.length > 0 ? `
                        <table style="width: 100%;">
                            <thead>
                                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                    <th style="text-align: left; padding: 12px; color: rgba(255, 255, 255, 0.9);">Error</th>
                                    <th style="text-align: right; padding: 12px; color: rgba(255, 255, 255, 0.9);">Count</th>
                                    <th style="text-align: right; padding: 12px; color: rgba(255, 255, 255, 0.9);">Last Occurrence</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${errorsList.slice(0, 10).map(error => `
                                    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                                        <td style="padding: 12px; max-width: 300px; word-break: break-word;">${error.message || error.error || 'Unknown error'}</td>
                                        <td style="padding: 12px; text-align: right;">${error.count || 1}</td>
                                        <td style="padding: 12px; text-align: right;">${formatDate(error.last_occurrence || error.timestamp)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : `<p style="color: rgba(255, 255, 255, 0.5);">No recent errors</p>`}
                </div>
            </div>
        `;
        
        adminContent.innerHTML = html;
    } catch (error) {
        console.error('Failed to load monitoring data:', error);
        adminContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #f87171; margin-bottom: 16px;"></i>
                <h3>Failed to Load Monitoring Data</h3>
                <p>${error.message}</p>
                <button class="btn-primary" onclick="renderMonitoringPage()" style="margin-top: 16px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// ===================== REPORTS PAGE =====================
async function renderReportsPage() {
    let html = `
        <div class="page-header" style="margin-bottom: 32px;">
            <h2 class="page-title">Reports & Exports</h2>
            <p style="color: rgba(255, 255, 255, 0.6); margin-top: 8px;">Generate and export reports</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
            <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px;">
                <h3 style="margin-top: 0; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-users" style="color: #3b82f6;"></i> Users Report
                </h3>
                <p style="color: rgba(255, 255, 255, 0.6); margin-bottom: 20px;">Export all users data to CSV format</p>
                <button class="export-button" onclick="exportUsersReport()">
                    <i class="fas fa-download"></i> Export Users
                </button>
            </div>

            <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px;">
                <h3 style="margin-top: 0; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-credit-card" style="color: #10b981;"></i> Subscriptions Report
                </h3>
                <p style="color: rgba(255, 255, 255, 0.6); margin-bottom: 20px;">Export all subscriptions data to CSV format</p>
                <button class="export-button" onclick="exportSubscriptionsReport()">
                    <i class="fas fa-download"></i> Export Subscriptions
                </button>
            </div>

            <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px;">
                <h3 style="margin-top: 0; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-chart-bar" style="color: #f97316;"></i> Activity Report
                </h3>
                <p style="color: rgba(255, 255, 255, 0.6); margin-bottom: 20px;">Generate activity report for selected period</p>
                <button class="export-button" onclick="exportActivityReport()">
                    <i class="fas fa-download"></i> Generate Report
                </button>
            </div>

            <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px;">
                <h3 style="margin-top: 0; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-dollar-sign" style="color: #a855f7;"></i> Revenue Report
                </h3>
                <p style="color: rgba(255, 255, 255, 0.6); margin-bottom: 20px;">Generate revenue report with analytics</p>
                <button class="export-button" onclick="exportRevenueReport()">
                    <i class="fas fa-download"></i> Generate Report
                </button>
            </div>
        </div>
    `;
    
    adminContent.innerHTML = html;
}

// Export Functions
async function exportUsersReport() {
    try {
        const btn = event.target.closest('button');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
        btn.disabled = true;
        
        const response = await API.call('GET', '/api/reports/users/export');
        
        // The response should be CSV data
        if (typeof response === 'string') {
            downloadCSV(response, 'users-export.csv');
        } else {
            // If it's JSON, convert to CSV
            const csv = jsonToCSV(response);
            downloadCSV(csv, 'users-export.csv');
        }
        
        btn.innerHTML = '<i class="fas fa-check"></i> Exported!';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }, 2000);
    } catch (error) {
        alert('Failed to export users: ' + error.message);
        event.target.closest('button').disabled = false;
    }
}

async function exportSubscriptionsReport() {
    try {
        const btn = event.target.closest('button');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
        btn.disabled = true;
        
        const response = await API.call('GET', '/api/reports/subscriptions/export');
        
        if (typeof response === 'string') {
            downloadCSV(response, 'subscriptions-export.csv');
        } else {
            const csv = jsonToCSV(response);
            downloadCSV(csv, 'subscriptions-export.csv');
        }
        
        btn.innerHTML = '<i class="fas fa-check"></i> Exported!';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }, 2000);
    } catch (error) {
        alert('Failed to export subscriptions: ' + error.message);
        event.target.closest('button').disabled = false;
    }
}

async function exportActivityReport() {
    try {
        const btn = event.target.closest('button');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        btn.disabled = true;
        
        const response = await API.call('GET', '/api/reports/activity?days=30');
        
        if (typeof response === 'string') {
            downloadFile(response, 'activity-report.json', 'application/json');
        } else {
            downloadFile(JSON.stringify(response, null, 2), 'activity-report.json', 'application/json');
        }
        
        btn.innerHTML = '<i class="fas fa-check"></i> Generated!';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }, 2000);
    } catch (error) {
        alert('Failed to generate activity report: ' + error.message);
        event.target.closest('button').disabled = false;
    }
}

async function exportRevenueReport() {
    try {
        const btn = event.target.closest('button');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        btn.disabled = true;
        
        const response = await API.call('GET', '/api/reports/revenue?months=6');
        
        if (typeof response === 'string') {
            downloadFile(response, 'revenue-report.json', 'application/json');
        } else {
            downloadFile(JSON.stringify(response, null, 2), 'revenue-report.json', 'application/json');
        }
        
        btn.innerHTML = '<i class="fas fa-check"></i> Generated!';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }, 2000);
    } catch (error) {
        alert('Failed to generate revenue report: ' + error.message);
        event.target.closest('button').disabled = false;
    }
}

// Helper function to convert JSON to CSV
function jsonToCSV(data) {
    if (!data || !data.length) return '';
    
    const array = Array.isArray(data) ? data : [data];
    const keys = Object.keys(array[0]);
    
    const header = keys.join(',');
    const rows = array.map(obj => 
        keys.map(key => {
            const value = obj[key];
            if (value === null || value === undefined) return '';
            if (typeof value === 'string' && value.includes(',')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',')
    );
    
    return [header, ...rows].join('\n');
}

// Helper function to download CSV
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Helper function to download files
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===================== PROMOTIONS PAGE =====================
async function renderPromotionsPage() {
    adminContent.innerHTML = '<div class="loading-container"><div class="spinner"></div><p>Loading promotions...</p></div>';
    
    try {
        const activeTrials = await API.getActiveTrials('all');
        const trials = activeTrials.trials || [];
        
        let html = `
            <div class="admin-page-header" style="margin-bottom: 32px;">
                <div>
                    <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Promotions & Trial Management</h2>
                    <p style="color: rgba(255, 255, 255, 0.6);">Manage promotional codes and trial distributions</p>
                </div>
            </div>
            
            <!-- CSV Import Section -->
            <div class="glass-card" style="margin-bottom: 24px; padding: 24px;">
                <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">Import Trial Users</h3>
                <p style="color: rgba(255, 255, 255, 0.6); font-size: 13px; margin-bottom: 16px;">
                    Upload a CSV file with twitter_handle and phone_number columns. Each user will receive 14 days of Pro access.
                </p>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <input type="file" id="csvFile" accept=".csv" style="
                        padding: 10px;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        border-radius: 8px;
                        color: rgba(255, 255, 255, 0.8);
                        cursor: pointer;
                    ">
                    <button onclick="importPromoCSV()" class="btn-primary" style="
                        padding: 10px 20px;
                        background: rgba(59, 130, 246, 0.2);
                        color: #3b82f6;
                        border: 1px solid rgba(59, 130, 246, 0.3);
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">
                        <i class="fas fa-upload"></i> Import CSV
                    </button>
                </div>
            </div>
            
            <!-- Active Trials Section -->
            <div class="glass-card">
                <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">Active & Expired Trials (${trials.length})</h3>
                ${trials.length === 0 ? '<p style="color: rgba(255, 255, 255, 0.6); text-align: center; padding: 20px;">No promotional trials yet</p>' : ''}
        `;
        
        if (trials.length > 0) {
            html += '<div class="admin-table"><table><thead><tr>';
            html += '<th>User ID</th><th>Twitter Handle</th><th>Phone</th><th>Trial Tier</th>';
            html += '<th>Started</th><th>Expires</th><th>Status</th><th>Actions</th>';
            html += '</tr></thead><tbody>';
            
            trials.forEach(trial => {
                const startDate = new Date(trial.created_at).toLocaleDateString();
                const expiryDate = new Date(trial.expiry_date).toLocaleDateString();
                const isExpired = new Date(trial.expiry_date) < new Date();
                const status = isExpired ? 'Expired' : 'Active';
                const statusColor = isExpired ? '#f87171' : '#10b981';
                
                html += '<tr>';
                html += '<td>' + trial.user_id.substring(0, 8) + '...</td>';
                html += '<td>' + (trial.twitter_handle || '-') + '</td>';
                html += '<td>' + (trial.phone_number || '-') + '</td>';
                html += '<td>' + trial.trial_tier + '</td>';
                html += '<td>' + startDate + '</td>';
                html += '<td>' + expiryDate + '</td>';
                html += '<td><span style="color: ' + statusColor + '; font-weight: 600;">' + status + '</span></td>';
                html += '<td><div class="action-buttons">';
                html += '<button class="btn-view" onclick="extendTrialModal(\'' + trial.user_id + '\')">Extend</button>';
                html += '<button class="btn-suspend" onclick="cancelUserTrial(\'' + trial.user_id + '\')">Cancel</button>';
                html += '</div></td>';
                html += '</tr>';
            });
            
            html += '</tbody></table></div>';
        }
        
        html += '</div>';
        adminContent.innerHTML = html;
        
    } catch (error) {
        console.error('Failed to load promotions:', error);
        adminContent.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-circle" style="font-size: 48px; color: #f87171; margin-bottom: 16px;"></i><h3>Failed to Load Promotions</h3><p>' + error.message + '</p></div>';
    }
}

// Import CSV file
async function importPromoCSV() {
    const fileInput = document.getElementById('csvFile');
    if (!fileInput.files.length) {
        alert('Please select a CSV file');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    
    try {
        const result = await API.importPromoUsers(formData);
        const msg = typeof result === 'string' ? result : JSON.stringify(result);
        alert('Successfully imported trials!' + '\n\nResult: ' + msg);
        fileInput.value = '';
        await navigateToAdminPage('promotions');
    } catch (error) {
        alert('Import failed: ' + error.message);
    }
}

// Extend trial modal
function extendTrialModal(userId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'extendTrialModal';
    modal.style.zIndex = '11000';
    
    let html = '<div class="modal-content" style="max-width: 500px;">';
    html += '<button class="modal-close" onclick="closeExtendTrialModal()"><i class="fas fa-times"></i></button>';
    html += '<h2 class="modal-title">Extend Trial</h2>';
    html += '<div style="margin-top: 20px;">';
    html += '<label style="display: block; margin-bottom: 8px; color: rgba(255, 255, 255, 0.7); font-size: 14px;">Additional Days</label>';
    html += '<input type="number" id="additionalDays" min="1" max="90" value="7" style="width: 100%; padding: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; color: rgba(255, 255, 255, 0.8); margin-bottom: 16px;">';
    html += '<label style="display: block; margin-bottom: 8px; color: rgba(255, 255, 255, 0.7); font-size: 14px;">Reason (Optional)</label>';
    html += '<input type="text" id="extensionReason" placeholder="e.g., Customer retention, special offer" style="width: 100%; padding: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; color: rgba(255, 255, 255, 0.8); margin-bottom: 20px;">';
    html += '</div>';
    html += '<div style="display: flex; gap: 12px; justify-content: flex-end;">';
    html += '<button onclick="closeExtendTrialModal()" class="btn-secondary" style="padding: 10px 20px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: rgba(255, 255, 255, 0.8); cursor: pointer; font-weight: 600;">Cancel</button>';
    html += '<button onclick="submitExtendTrial(' + JSON.stringify(userId) + ')" class="btn-primary" style="padding: 10px 20px; background: rgba(59, 130, 246, 0.2); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; cursor: pointer; font-weight: 600;">Extend</button>';
    html += '</div></div>';
    
    modal.innerHTML = html;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeExtendTrialModal();
        }
    });
}

function closeExtendTrialModal() {
    const modal = document.getElementById('extendTrialModal');
    if (modal) modal.remove();
}

async function submitExtendTrial(userId) {
    const days = parseInt(document.getElementById('additionalDays').value) || 7;
    const reason = document.getElementById('extensionReason').value;
    
    try {
        await API.extendTrial(userId, days, reason);
        alert('Trial extended by ' + days + ' days');
        closeExtendTrialModal();
        await navigateToAdminPage('promotions');
    } catch (error) {
        alert('Extension failed: ' + error.message);
    }
}

async function cancelUserTrial(userId) {
    if (!confirm('Are you sure you want to cancel this trial? The user will be downgraded immediately.')) {
        return;
    }
    
    try {
        await API.cancelTrial(userId);
        alert('Trial cancelled successfully');
        await navigateToAdminPage('promotions');
    } catch (error) {
        alert('Cancellation failed: ' + error.message);
    }
}

// Close All Modals
function closeAllModals() {
    document.getElementById('userDetailsModal')?.classList.remove('active');
    document.getElementById('subscriptionDetailsModal')?.classList.remove('active');
}

// Utility Functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(date) {
    if (!date) return 'N/A';
    try {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'Invalid Date';
    }
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/auth.html';
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminPanel);
} else {
    initAdminPanel();
}