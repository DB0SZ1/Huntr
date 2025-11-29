/**
 * Helper to extract nested response data
 */
function extractData(response, path) {
    if (!response) return null;
    
    // If response is already the data we need (not wrapped)
    if (response[path.split('.')[0]] !== undefined && !path.includes('.')) {
        return response[path];
    }
    
    // Handle nested paths like "users.total_users"
    const paths = path.split('.');
    let current = response;
    for (const p of paths) {
        if (current && typeof current === 'object') {
            current = current[p];
        } else {
            return null;
        }
    }
    return current;
}

/**
 * Admin Overview Page
 * Displays admin dashboard overview with key statistics
 */

async function loadOverviewPage() {
    const adminContent = document.getElementById('adminContent');
    
    // Show loading state
    adminContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading overview...</p>
        </div>
    `;

    try {
        // Fetch admin overview stats (REQUIRED)
        const response = await API.call('GET', '/api/admin/stats/overview');
        
        console.log('Overview stats response:', response);
        
        // Extract overview data - handle both direct and nested responses
        const overview = response?.stats || response?.overview || response || {};
        
        console.log('Extracted overview:', overview);
        
        // Fetch activity (OPTIONAL - graceful fallback)
        let activity = null;
        try {
            const activityResponse = await API.call('GET', '/api/admin/activity');
            activity = activityResponse?.activities || activityResponse?.data || activityResponse || [];
        } catch (activityError) {
            console.warn('Failed to load activity data (non-critical):', activityError);
            // Continue without activity data
        }

        // Extract stats with fallback to direct values
        const totalUsers = overview?.total_users ?? overview?.users?.total ?? 0;
        const activeUsers = overview?.active_users ?? overview?.users?.active ?? 0;
        const suspendedUsers = overview?.suspended_users ?? overview?.users?.suspended ?? 0;
        const totalRevenue = overview?.total_revenue ?? overview?.revenue?.total ?? 0;
        
        console.log('Extracted stats:', { totalUsers, activeUsers, suspendedUsers, totalRevenue });

        let html = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">Admin Overview</h2>
                <p style="color: rgba(255, 255, 255, 0.6); margin-top: 8px;">System statistics and key metrics</p>
            </div>

            <!-- Server Status Control -->
            <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <i class="fas fa-server" style="font-size: 24px; color: #f97316;"></i>
                    <div>
                        <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">Server Status</h3>
                        <p style="margin: 0; color: rgba(255, 255, 255, 0.6); font-size: 13px;">Toggle server maintenance mode</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span id="serverStatusText" style="color: #10b981; font-weight: 600; font-size: 14px;">Online</span>
                    <button id="serverStatusToggle" class="status-toggle-btn" onclick="toggleServerStatus()">
                        <span class="toggle-switch"></span>
                    </button>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="stats-grid-admin">
                ${renderStatCard(
                    'Total Users',
                    totalUsers,
                    'fas fa-users',
                    '#3b82f6'
                )}
                ${renderStatCard(
                    'Active Users',
                    activeUsers,
                    'fas fa-user-check',
                    '#10b981'
                )}
                ${renderStatCard(
                    'Suspended Users',
                    suspendedUsers,
                    'fas fa-user-slash',
                    '#f97316'
                )}
                ${renderStatCard(
                    'Total Revenue',
                    '₦' + Number(totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'fas fa-dollar-sign',
                    '#a855f7'
                )}
            </div>

            <!-- Revenue Breakdown -->
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-chart-pie" style="color: #f97316;"></i>
                    Revenue Breakdown
                </h3>
                <div id="revenueBreakdownContent">
                    <p style="color: rgba(255, 255, 255, 0.5);">Loading revenue data...</p>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-history" style="color: #3b82f6;"></i>
                    Recent Activity
                </h3>
                <div id="recentActivityContent">
                    ${renderActivityTable(activity)}
                </div>
            </div>
        `;

        adminContent.innerHTML = html;

        // Initialize server status toggle
        initServerStatus();

        // Load revenue breakdown
        loadRevenueBreakdown();

    } catch (error) {
        console.error('Failed to load overview:', error);
        adminContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #f87171; margin-bottom: 16px;"></i>
                <h3>Failed to Load Overview</h3>
                <p>${error.message || 'An error occurred while loading the admin overview.'}</p>
                <button class="btn-primary" onclick="loadOverviewPage()" style="margin-top: 16px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

/**
 * Load revenue breakdown data
 */
async function loadRevenueBreakdown() {
    const container = document.getElementById('revenueBreakdownContent');
    
    try {
        const response = await API.call('GET', '/api/admin/revenue/breakdown');
        
        console.log('Revenue breakdown response:', response);
        
        // Handle nested response structure
        let breakdown = response;
        if (response?.breakdown) {
            breakdown = response.breakdown;
        } else if (response?.data) {
            breakdown = response.data;
        }

        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">';

        if (breakdown) {
            // Try to extract from different possible structures
            let current = breakdown.current || breakdown;
            
            // If current is still the whole response, try to find revenue fields directly
            if (current.pro_revenue === undefined && current.premium_revenue === undefined) {
                // Check if data is wrapped further
                if (breakdown.data) {
                    current = breakdown.data;
                }
            }
            
            // Ensure we have numbers
            const proRevenue = Number(current?.pro_revenue ?? current?.revenue?.pro ?? 0);
            const premiumRevenue = Number(current?.premium_revenue ?? current?.revenue?.premium ?? 0);
            
            // Pro Revenue - always show
            html += `
                <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0; color: rgba(59, 130, 246, 0.8); font-size: 13px; font-weight: 500;">Pro Revenue</p>
                    <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 700; color: #3b82f6;">₦${proRevenue.toLocaleString('en-US')}</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: rgba(59, 130, 246, 0.6);">${Number(current?.pro_subscriptions ?? current?.subscriptions?.pro ?? 0)} subscriptions</p>
                </div>
            `;
            
            // Premium Revenue - always show
            html += `
                <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0; color: rgba(168, 85, 247, 0.8); font-size: 13px; font-weight: 500;">Premium Revenue</p>
                    <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 700; color: #a855f7;">₦${premiumRevenue.toLocaleString('en-US')}</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: rgba(168, 85, 247, 0.6);">${Number(current?.premium_subscriptions ?? current?.subscriptions?.premium ?? 0)} subscriptions</p>
                </div>
            `;
            
            // Total Revenue - always show
            const totalRevenue = Number(current?.total_revenue ?? proRevenue + premiumRevenue);
            html += `
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0; color: rgba(16, 185, 129, 0.8); font-size: 13px; font-weight: 500;">Total Revenue</p>
                    <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 700; color: #10b981;">₦${totalRevenue.toLocaleString('en-US')}</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: rgba(16, 185, 129, 0.6);">Current month</p>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Failed to load revenue breakdown:', error);
        container.innerHTML = '<p style="color: rgba(255, 255, 255, 0.5);">Unable to load revenue data</p>';
    }
}

/**
 * Render a stat card
 */
function renderStatCard(label, value, icon, color) {
    return `
        <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <p style="margin: 0 0 12px 0; color: rgba(255, 255, 255, 0.6); font-size: 14px; font-weight: 500;">${label}</p>
                    <p style="margin: 0; font-size: 32px; font-weight: 700; color: white;">${value}</p>
                </div>
                <i class="${icon}" style="font-size: 24px; color: ${color}; opacity: 0.8;"></i>
            </div>
        </div>
    `;
}

/**
 * Render activity table
 */
function renderActivityTable(activity) {
    if (!activity || activity.length === 0) {
        return '<p style="color: rgba(255, 255, 255, 0.5); text-align: center; padding: 20px;">No recent activity</p>';
    }

    const activities = Array.isArray(activity) ? activity : activity?.activities || [];

    let html = `
        <div class="admin-table">
            <table>
                <thead>
                    <tr>
                        <th>Action</th>
                        <th>User</th>
                        <th>Timestamp</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
    `;

    activities.slice(0, 10).forEach(item => {
        const timestamp = new Date(item.timestamp || item.created_at).toLocaleString();
        const action = item.action || 'Unknown';
        const user = item.user_id || item.user || 'System';
        const details = item.details || item.description || '-';

        html += `
            <tr>
                <td><strong>${action}</strong></td>
                <td>${user.substring ? user.substring(0, 12) : user}${(user.substring?.length || 0) > 12 ? '...' : ''}</td>
                <td style="font-size: 12px; color: rgba(255, 255, 255, 0.5);">${timestamp}</td>
                <td style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">${details}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    return html;
}

/**
 * Toggle server maintenance status
 * When enabled, shows a modal on user pages
 */
function toggleServerStatus() {
    const toggleBtn = document.getElementById('serverStatusToggle');
    const statusText = document.getElementById('serverStatusText');
    
    // Get current state
    let isServerDown = localStorage.getItem('serverDownStatus') === 'true';
    
    // Toggle the state
    isServerDown = !isServerDown;
    
    // Save to localStorage
    localStorage.setItem('serverDownStatus', isServerDown);
    
    // Update UI
    toggleBtn.classList.toggle('active', isServerDown);
    statusText.textContent = isServerDown ? 'Maintenance' : 'Online';
    statusText.style.color = isServerDown ? '#ef4444' : '#10b981';
    
    // Show confirmation
    showToast(
        isServerDown ? 'Server maintenance mode enabled' : 'Server maintenance mode disabled',
        isServerDown ? 'warning' : 'success'
    );
    
    console.log('Server status toggled:', isServerDown ? 'DOWN' : 'UP');
}

/**
 * Initialize server status on page load
 */
function initServerStatus() {
    const toggleBtn = document.getElementById('serverStatusToggle');
    const statusText = document.getElementById('serverStatusText');
    
    if (!toggleBtn || !statusText) return;
    
    // Check current state from localStorage
    const isServerDown = localStorage.getItem('serverDownStatus') === 'true';
    
    // Update UI to reflect current state
    toggleBtn.classList.toggle('active', isServerDown);
    statusText.textContent = isServerDown ? 'Maintenance' : 'Online';
    statusText.style.color = isServerDown ? '#ef4444' : '#10b981';
}
