/**
 * Admin Activities Page
 * Displays recent admin actions, user activities, and system events
 */

async function loadActivitiesPage() {
    const adminContent = document.getElementById('adminContent');
    
    // Show loading state
    adminContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading activities...</p>
        </div>
    `;

    try {
        // Fetch activity data
        const response = await API.call('GET', '/api/admin/activity').catch(e => ({ error: e.message }));
        
        console.log('Activity response:', response);
        
        // Handle nested response - extract actual data from wrapper
        let activity = response;
        if (response?.activities) {
            activity = response.activities;
        } else if (response?.data) {
            activity = response.data;
        } else if (Array.isArray(response)) {
            activity = response;
        }

        // Ensure we have an object to work with
        if (!activity || typeof activity !== 'object') {
            activity = {};
        }

        let html = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">System Activities</h2>
                <p style="color: rgba(255, 255, 255, 0.6); margin-top: 8px;">Recent admin actions and user activities</p>
            </div>

            <!-- Admin Actions -->
            ${renderAdminActions(activity?.admin_actions || activity?.actions || activity)}

            <!-- Recent Signups -->
            ${renderRecentSignups(activity?.recent_signups || activity?.signups || activity?.new_users || [])}

            <!-- System Alerts -->
            ${renderSystemAlerts(activity?.system_alerts || activity?.alerts || [])}
        `;

        adminContent.innerHTML = html;

    } catch (error) {
        console.error('Failed to load activities page:', error);
        adminContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #f87171; margin-bottom: 16px;"></i>
                <h3>Failed to Load Activities</h3>
                <p>${error.message || 'An error occurred while loading activities.'}</p>
                <button class="btn-primary" onclick="loadActivitiesPage()" style="margin-top: 16px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

/**
 * Render Admin Actions
 */
function renderAdminActions(actions) {
    // Handle different response formats
    if (!actions) {
        actions = [];
    }
    
    // If it's not an array, try to extract an array from it
    if (!Array.isArray(actions)) {
        if (actions.data && Array.isArray(actions.data)) {
            actions = actions.data;
        } else if (actions.items && Array.isArray(actions.items)) {
            actions = actions.items;
        } else if (typeof actions === 'object') {
            actions = Object.values(actions).filter(item => typeof item === 'object');
        } else {
            actions = [];
        }
    }
    
    if (actions.length === 0) {
        return `
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-lock" style="color: #f97316;"></i>
                    Admin Actions
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5); text-align: center; padding: 20px;">No admin actions recorded</p>
            </div>
        `;
    }

    let html = `
        <div class="chart-container">
            <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-lock" style="color: #f97316;"></i>
                Admin Actions (${actions.length})
            </h3>
            <div class="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Admin</th>
                            <th>Target User</th>
                            <th>Details</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    actions.slice(0, 20).forEach(action => {
        const actionType = action.action || 'Unknown';
        const admin = action.admin_email || action.admin_id || 'System';
        const target = action.target_user_email || action.target_user || '-';
        const details = action.details || action.description || '-';
        const timestamp = formatDate(action.timestamp || action.created_at);

        const actionColors = {
            'suspend': '#f87171',
            'activate': '#10b981',
            'tier_update': '#3b82f6',
            'delete': '#f97316',
            'promote': '#a855f7'
        };
        const actionColor = actionColors[actionType.toLowerCase()] || '#fbbf24';

        html += `
            <tr>
                <td><span style="background: ${actionColor}20; color: ${actionColor}; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: capitalize;">${actionType}</span></td>
                <td><strong>${admin}</strong></td>
                <td>${target}</td>
                <td style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">${details.substring(0, 30)}</td>
                <td style="font-size: 11px; color: rgba(255, 255, 255, 0.5);">${timestamp}</td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    return html;
}

/**
 * Render Recent Signups
 */
function renderRecentSignups(signups) {
    // Handle different response formats
    if (!signups) {
        signups = [];
    }
    
    // If it's not an array, try to extract an array from it
    if (!Array.isArray(signups)) {
        if (signups.data && Array.isArray(signups.data)) {
            signups = signups.data;
        } else if (signups.items && Array.isArray(signups.items)) {
            signups = signups.items;
        } else if (typeof signups === 'object') {
            signups = Object.values(signups).filter(item => typeof item === 'object');
        } else {
            signups = [];
        }
    }
    
    if (signups.length === 0) {
        return `
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-user-plus" style="color: #10b981;"></i>
                    Recent Signups
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5); text-align: center; padding: 20px;">No recent signups</p>
            </div>
        `;
    }

    let html = `
        <div class="chart-container">
            <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-user-plus" style="color: #10b981;"></i>
                Recent Signups (${signups.length})
            </h3>
            <div class="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Tier</th>
                            <th>API Calls</th>
                            <th>Signup Date</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    signups.slice(0, 15).forEach(user => {
        const name = user.name || 'Unknown';
        const email = user.email || '-';
        const tier = user.tier || 'free';
        const apiCalls = user.total_api_calls || 0;
        const signupDate = formatDate(user.created_at);

        const tierColors = {
            'free': '#fbbf24',
            'pro': '#3b82f6',
            'premium': '#a855f7'
        };
        const tierColor = tierColors[tier] || '#fbbf24';

        html += `
            <tr>
                <td><strong>${name}</strong></td>
                <td style="font-size: 12px; color: rgba(255, 255, 255, 0.7);">${email}</td>
                <td><span style="background: ${tierColor}20; color: ${tierColor}; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: capitalize;">${tier}</span></td>
                <td style="text-align: center; font-weight: 600;">${apiCalls.toLocaleString()}</td>
                <td style="font-size: 11px; color: rgba(255, 255, 255, 0.5);">${signupDate}</td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    return html;
}

/**
 * Render System Alerts
 */
function renderSystemAlerts(alerts) {
    // Handle different response formats
    if (!alerts) {
        alerts = [];
    }
    
    // If it's not an array, try to extract an array from it
    if (!Array.isArray(alerts)) {
        if (alerts.data && Array.isArray(alerts.data)) {
            alerts = alerts.data;
        } else if (alerts.items && Array.isArray(alerts.items)) {
            alerts = alerts.items;
        } else if (typeof alerts === 'object') {
            alerts = Object.values(alerts).filter(item => typeof item === 'object');
        } else {
            alerts = [];
        }
    }
    
    if (alerts.length === 0) {
        return `
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-bell" style="color: #f87171;"></i>
                    System Alerts
                </h3>
                <p style="color: rgba(16, 185, 129, 0.8); text-align: center; padding: 20px; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
                    <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
                    No active alerts - System is healthy
                </p>
            </div>
        `;
    }

    let html = `
        <div class="chart-container">
            <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-bell" style="color: #f87171;"></i>
                System Alerts (${alerts.length})
            </h3>
            <div style="display: flex; flex-direction: column; gap: 12px; max-height: 500px; overflow-y: auto;">
    `;

    alerts.slice(0, 20).forEach(alert => {
        const level = alert.level || 'error';
        const levelColors = {
            'error': { bg: '#f87171', text: '#fca5a5' },
            'warning': { bg: '#f59e0b', text: '#fcd34d' },
            'info': { bg: '#3b82f6', text: '#93c5fd' }
        };
        const levelColor = levelColors[level] || levelColors.error;
        const message = alert.message || alert.description || 'Unknown alert';
        const source = alert.source || alert.endpoint || '-';
        const timestamp = formatDate(alert.timestamp || alert.created_at);

        html += `
            <div style="background: ${levelColor.bg}15; border-left: 3px solid ${levelColor.bg}; border-radius: 8px; padding: 12px; border: 1px solid ${levelColor.bg}30;">
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 12px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <span style="background: ${levelColor.bg}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 700; text-transform: uppercase;">${level}</span>
                            <span style="color: ${levelColor.text}; font-size: 10px;">${source}</span>
                        </div>
                        <p style="margin: 0; font-size: 13px; color: rgba(255, 255, 255, 0.8); line-height: 1.4;">${message}</p>
                    </div>
                    <span style="color: rgba(255, 255, 255, 0.4); font-size: 10px; white-space: nowrap;">${timestamp}</span>
                </div>
            </div>
        `;
    });
}

/**
 * Format date to readable format
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
