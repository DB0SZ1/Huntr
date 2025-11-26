/**
 * Admin Dashboard JavaScript - COMPLETE
 * Real-time monitoring and admin features
 */

// Check authentication and admin privileges
if (!requireAuth()) {
    throw new Error('Not authenticated');
}

let currentAdmin = null;
let monitoringInterval = null;
let currentAdminPage = 'overview';

// Initialize Admin Dashboard
async function initAdminDashboard() {
    try {
        currentAdmin = await API.getCurrentUser();
        
        if (!currentAdmin.is_admin) {
            alert('Access denied. Admin privileges required.');
            window.location.href = '/dashboard.html';
            return;
        }
        
        // Update admin profile
        updateAdminProfile(currentAdmin);
        
        // Load overview by default
        await loadAdminOverview();
        
        // Setup event listeners
        setupAdminEventListeners();
        
    } catch (error) {
        console.error('Admin dashboard init failed:', error);
        redirectToLogin();
    }
}

function updateAdminProfile(admin) {
    const adminName = document.querySelector('.admin-name');
    const adminEmail = document.querySelector('.admin-email');
    
    if (adminName) adminName.textContent = admin.name;
    if (adminEmail) adminEmail.textContent = admin.email;
}

// Load Admin Overview
async function loadAdminOverview() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading admin statistics...</p>
        </div>
    `;
    
    try {
        const stats = await API.getAdminStats();
        
        let html = `
            <div class="page-header">
                <h2 class="page-title">Admin Overview</h2>
                <div class="breadcrumb">Admin / Overview</div>
            </div>
            
            <div class="dashboard-grid">
                <!-- Total Users -->
                <div class="glass-card stats-card">
                    <div class="stats-header">
                        <div class="stats-icon"><i class="fas fa-users"></i></div>
                        <div class="stats-trend ${stats.growth.users >= 0 ? 'up' : 'down'}">
                            <i class="fas fa-arrow-${stats.growth.users >= 0 ? 'up' : 'down'}"></i>
                            ${Math.abs(stats.growth.users)}%
                        </div>
                    </div>
                    <div class="stats-value">${stats.platform_stats.total_users}</div>
                    <div class="stats-label">Total Users</div>
                    <div class="stats-description">Last 30 days growth</div>
                </div>
                
                <!-- Monthly Revenue -->
                <div class="glass-card stats-card">
                    <div class="stats-header">
                        <div class="stats-icon"><i class="fas fa-dollar-sign"></i></div>
                        <div class="stats-trend ${stats.growth.revenue >= 0 ? 'up' : 'down'}">
                            <i class="fas fa-arrow-${stats.growth.revenue >= 0 ? 'up' : 'down'}"></i>
                            ${Math.abs(stats.growth.revenue)}%
                        </div>
                    </div>
                    <div class="stats-value">₦${(stats.platform_stats.monthly_revenue / 1000).toFixed(1)}k</div>
                    <div class="stats-label">Monthly Revenue</div>
                    <div class="stats-description">Current subscriptions</div>
                </div>
                
                <!-- Conversion Rate -->
                <div class="glass-card stats-card">
                    <div class="stats-header">
                        <div class="stats-icon"><i class="fas fa-chart-line"></i></div>
                    </div>
                    <div class="stats-value">${stats.platform_stats.conversion_rate}%</div>
                    <div class="stats-label">Conversion Rate</div>
                    <div class="stats-description">Free to paid</div>
                </div>
                
                <!-- User Breakdown Chart -->
                <div class="glass-card large-card">
                    <h3 class="card-title">User Distribution by Tier</h3>
                    <canvas id="userDistributionChart"></canvas>
                </div>
                
                <!-- Recent Activity -->
                <div class="glass-card large-card">
                    <h3 class="card-title">Recent Platform Activity</h3>
                    <div id="recentActivity" class="activity-list">
                        <div class="loading">Loading activity...</div>
                    </div>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
        
        // Render charts
        renderUserDistributionChart(stats.platform_stats.user_breakdown);
        
        // Load recent activity
        loadAdminActivity();
        
    } catch (error) {
        console.error('Failed to load admin stats:', error);
        content.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load admin statistics</h3>
                <p>${error.message}</p>
                <button onclick="loadAdminOverview()" class="btn-primary">Retry</button>
            </div>
        `;
    }
}

// Load Users Management
async function loadUsersManagement() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading users...</p>
        </div>
    `;
    
    try {
        const data = await API.listUsers(1, 50);
        
        let html = `
            <div class="page-header">
                <h2 class="page-title">User Management</h2>
                <div class="breadcrumb">Admin / Users</div>
            </div>
            
            <div class="glass-card">
                <div class="table-header">
                    <h3>All Users (${data.pagination.total})</h3>
                    <div class="table-filters">
                        <select onchange="filterUsers(this.value, 'tier')" class="filter-select">
                            <option value="">All Tiers</option>
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="premium">Premium</option>
                        </select>
                        <select onchange="filterUsers(this.value, 'status')" class="filter-select">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <input type="text" placeholder="Search users..." onkeyup="searchUsers(this.value)" class="search-input">
                    </div>
                </div>
                
                <div class="users-table">
                    <div class="table-row table-header-row">
                        <div>Name</div>
                        <div>Email</div>
                        <div>Tier</div>
                        <div>Status</div>
                        <div>Created</div>
                        <div>Actions</div>
                    </div>
        `;
        
        data.users.forEach(user => {
            const createdDate = new Date(user.created_at).toLocaleDateString();
            html += `
                <div class="table-row">
                    <div>
                        <strong>${user.name}</strong>
                        ${user.is_admin ? '<span class="badge badge-admin">Admin</span>' : ''}
                    </div>
                    <div>${user.email}</div>
                    <div><span class="badge badge-${user.tier}">${user.tier}</span></div>
                    <div><span class="badge badge-${user.is_active ? 'success' : 'danger'}">${user.is_active ? 'Active' : 'Inactive'}</span></div>
                    <div>${createdDate}</div>
                    <div class="action-buttons">
                        <button onclick="viewUserDetails('${user.id}')" class="btn-icon" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${user.is_active ? `
                            <button onclick="suspendUser('${user.id}')" class="btn-icon btn-warning" title="Suspend">
                                <i class="fas fa-pause"></i>
                            </button>
                        ` : `
                            <button onclick="activateUser('${user.id}')" class="btn-icon btn-success" title="Activate">
                                <i class="fas fa-play"></i>
                            </button>
                        `}
                        ${!user.is_admin ? `
                            <button onclick="deleteUser('${user.id}')" class="btn-icon btn-danger" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        content.innerHTML = html;
        
    } catch (error) {
        console.error('Failed to load users:', error);
        content.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load users</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Load Monitoring
async function loadMonitoring() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading monitoring data...</p>
        </div>
    `;
    
    try {
        const [health, apiMetrics, scraperStatus] = await Promise.all([
            API.getSystemHealth(),
            API.getAPIMetrics(24),
            API.getScraperStatus()
        ]);
        
        let html = `
            <div class="page-header">
                <h2 class="page-title">System Monitoring</h2>
                <div class="breadcrumb">Admin / Monitoring</div>
                <div class="auto-refresh">
                    <i class="fas fa-sync-alt spinning"></i>
                    <span>Auto-refresh every 10s</span>
                </div>
            </div>
            
            <div class="monitoring-grid">
                <!-- System Health -->
                <div class="glass-card">
                    <h3 class="card-title">System Health</h3>
                    <div class="health-metrics">
                        <div class="health-item">
                            <span>CPU Usage</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${health.system.cpu_percent}%"></div>
                            </div>
                            <strong>${health.system.cpu_percent.toFixed(1)}%</strong>
                        </div>
                        <div class="health-item">
                            <span>Memory Usage</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${health.system.memory_percent}%"></div>
                            </div>
                            <strong>${health.system.memory_percent.toFixed(1)}%</strong>
                        </div>
                        <div class="health-item">
                            <span>Disk Usage</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${health.system.disk_percent}%"></div>
                            </div>
                            <strong>${health.system.disk_percent.toFixed(1)}%</strong>
                        </div>
                    </div>
                </div>
                
                <!-- API Metrics -->
                <div class="glass-card">
                    <h3 class="card-title">API Metrics (24h)</h3>
                    <div class="metric-stats">
                        <div class="metric-item">
                            <i class="fas fa-exchange-alt"></i>
                            <div>
                                <strong>${apiMetrics.total_requests}</strong>
                                <span>Total Requests</span>
                            </div>
                        </div>
                        <div class="metric-item">
                            <i class="fas fa-exclamation-triangle"></i>
                            <div>
                                <strong>${apiMetrics.error_rate}%</strong>
                                <span>Error Rate</span>
                            </div>
                        </div>
                        <div class="metric-item">
                            <i class="fas fa-clock"></i>
                            <div>
                                <strong>${apiMetrics.avg_response_time_ms.toFixed(0)}ms</strong>
                                <span>Avg Response Time</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Scraper Status -->
                <div class="glass-card">
                    <h3 class="card-title">Scraper Performance (24h)</h3>
                    <div class="metric-stats">
                        <div class="metric-item">
                            <i class="fas fa-search"></i>
                            <div>
                                <strong>${scraperStatus.total_scans}</strong>
                                <span>Total Scans</span>
                            </div>
                        </div>
                        <div class="metric-item">
                            <i class="fas fa-check-circle"></i>
                            <div>
                                <strong>${scraperStatus.success_rate}%</strong>
                                <span>Success Rate</span>
                            </div>
                        </div>
                        <div class="metric-item">
                            <i class="fas fa-times-circle"></i>
                            <div>
                                <strong>${scraperStatus.failed_scans}</strong>
                                <span>Failed Scans</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
        
        // Start auto-refresh for monitoring page
        startMonitoringAutoRefresh();
        
    } catch (error) {
        console.error('Failed to load monitoring:', error);
        content.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load monitoring data</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// User Actions
async function viewUserDetails(userId) {
    try {
        const data = await API.getUserDetails(userId);
        // Show user details modal
        alert(`User Details:\n\nName: ${data.user.name}\nEmail: ${data.user.email}\nTier: ${data.user.tier}\nNiches: ${data.niches.length}`);
    } catch (error) {
        alert('Failed to load user details');
    }
}

async function suspendUser(userId) {
    if (!confirm('Are you sure you want to suspend this user?')) return;
    
    try {
        await API.suspendUser(userId);
        alert('User suspended successfully');
        await loadUsersManagement();
    } catch (error) {
        alert('Failed to suspend user');
    }
}

async function activateUser(userId) {
    try {
        await API.activateUser(userId);
        alert('User activated successfully');
        await loadUsersManagement();
    } catch (error) {
        alert('Failed to activate user');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to PERMANENTLY delete this user? This action cannot be undone!')) return;
    
    try {
        await API.deleteUser(userId);
        alert('User deleted successfully');
        await loadUsersManagement();
    } catch (error) {
        alert('Failed to delete user');
    }
}

// Load Admin Activity
async function loadAdminActivity() {
    try {
        const data = await API.getAdminActivity(10);
        const activityList = document.getElementById('recentActivity');
        
        if (!activityList) return;
        
        activityList.innerHTML = '';
        
        if (data.activity.length === 0) {
            activityList.innerHTML = '<div class="empty-state">No recent activity</div>';
            return;
        }
        
        data.activity.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            let icon, title, description;
            
            switch (activity.type) {
                case 'user_signup':
                    icon = 'fa-user-plus';
                    title = 'New user signup';
                    description = activity.user_email;
                    break;
                case 'subscription':
                    icon = 'fa-credit-card';
                    title = `New ${activity.tier} subscription`;
                    description = activity.status;
                    break;
                case 'admin_action':
                    icon = 'fa-shield-alt';
                    title = 'Admin action';
                    description = activity.action;
                    break;
                default:
                    icon = 'fa-info';
                    title = 'Activity';
                    description = '';
            }
            
            const timeAgo = getTimeAgo(new Date(activity.timestamp));
            
            item.innerHTML = `
                <div class="activity-icon"><i class="fas ${icon}"></i></div>
                <div class="activity-content">
                    <div class="activity-title">${title}</div>
                    <div class="activity-description">${description}</div>
                </div>
                <div class="activity-time">${timeAgo}</div>
            `;
            
            activityList.appendChild(item);
        });
        
    } catch (error) {
        console.error('Failed to load activity:', error);
    }
}

// Chart Rendering
function renderUserDistributionChart(breakdown) {
    const ctx = document.getElementById('userDistributionChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Free', 'Pro', 'Premium'],
            datasets: [{
                data: [breakdown.free, breakdown.pro, breakdown.premium],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(168, 85, 247, 0.8)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#fff' }
                }
            }
        }
    });
}

// Monitoring Auto-Refresh
function startMonitoringAutoRefresh() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
    }
    
    monitoringInterval = setInterval(async () => {
        if (currentAdminPage === 'monitoring') {
            await loadMonitoring();
        }
    }, 10000); // Every 10 seconds
}

// Event Listeners
function setupAdminEventListeners() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            const pages = ['overview', 'users', 'subscriptions', 'monitoring', 'reports'];
            currentAdminPage = pages[index];
            
            switch (currentAdminPage) {
                case 'overview':
                    loadAdminOverview();
                    break;
                case 'users':
                    loadUsersManagement();
                    break;
                case 'monitoring':
                    loadMonitoring();
                    break;
                // Add other pages as needed
            }
        });
    });
}

// Helper Functions
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
}

// Initialize on load
window.addEventListener('load', initAdminDashboard);

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
    }
});

// Export functions
window.loadAdminOverview = loadAdminOverview;
window.loadUsersManagement = loadUsersManagement;
window.loadMonitoring = loadMonitoring;
window.viewUserDetails = viewUserDetails;
window.suspendUser = suspendUser;
window.activateUser = activateUser;
window.deleteUser = deleteUser;