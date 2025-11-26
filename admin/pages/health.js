/**
 * Admin Health Monitoring Page
 * Displays system health, API metrics, scraper status, active sessions, and recent errors
 */

async function loadHealthPage() {
    const adminContent = document.getElementById('adminContent');
    
    // Show loading state
    adminContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading system health...</p>
        </div>
    `;

    try {
        // Fetch all health-related data in parallel
        const [health, metrics, scraperStatus, sessions, errors] = await Promise.all([
            API.call('GET', '/api/monitoring/health').catch(e => ({ error: e.message })),
            API.call('GET', '/api/monitoring/api-metrics').catch(e => ({ error: e.message })),
            API.call('GET', '/api/monitoring/scraper-status').catch(e => ({ error: e.message })),
            API.call('GET', '/api/monitoring/active-sessions').catch(e => ({ error: e.message })),
            API.call('GET', '/api/monitoring/errors').catch(e => ({ error: e.message }))
        ]);

        let html = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">System Health & Monitoring</h2>
                <p style="color: rgba(255, 255, 255, 0.6); margin-top: 8px;">Real-time system status and metrics</p>
            </div>

            <!-- System Health Status -->
            ${renderHealthStatus(health)}

            <!-- API Metrics -->
            ${renderAPIMetrics(metrics)}

            <!-- Scraper Status -->
            ${renderScraperStatus(scraperStatus)}

            <!-- Active Sessions -->
            ${renderActiveSessions(sessions)}

            <!-- Recent Errors -->
            ${renderRecentErrors(errors)}
        `;

        adminContent.innerHTML = html;

    } catch (error) {
        console.error('Failed to load health page:', error);
        adminContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #f87171; margin-bottom: 16px;"></i>
                <h3>Failed to Load Health Information</h3>
                <p>${error.message || 'An error occurred while loading system health data.'}</p>
                <button class="btn-primary" onclick="loadHealthPage()" style="margin-top: 16px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

/**
 * Render System Health Status
 */
function renderHealthStatus(health) {
    if (health?.error) {
        return `
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-heartbeat" style="color: #f87171;"></i>
                    System Health
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5);">Failed to load health data: ${health.error}</p>
            </div>
        `;
    }

    const status = health?.status || 'unknown';
    const statusColor = status === 'healthy' ? '#10b981' : status === 'degraded' ? '#f59e0b' : '#f87171';
    const statusIcon = status === 'healthy' ? 'fa-check-circle' : status === 'degraded' ? 'fa-exclamation-circle' : 'fa-times-circle';
    
    // Extract nested data correctly
    const dbStatus = health?.database?.status || 'unknown';
    const dbConnected = dbStatus === 'connected';
    const cpuPercent = health?.system?.cpu_percent || 0;
    const memoryPercent = health?.system?.memory_percent || 0;
    const diskPercent = health?.system?.disk_percent || 0;

    return `
        <div class="chart-container">
            <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-heartbeat" style="color: ${statusColor};"></i>
                System Health
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; text-align: center;">
                    <i class="fas ${statusIcon}" style="font-size: 32px; color: ${statusColor}; margin-bottom: 12px;"></i>
                    <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 12px;">Status</p>
                    <p style="margin: 0; font-size: 18px; font-weight: 700; color: ${statusColor}; text-transform: uppercase;">${status}</p>
                </div>
                <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; text-align: center;">
                    <i class="fas fa-database" style="font-size: 32px; color: ${dbConnected ? '#3b82f6' : '#f87171'}; margin-bottom: 12px;"></i>
                    <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 12px;">Database</p>
                    <p style="margin: 0; font-size: 18px; font-weight: 700; color: ${dbConnected ? '#3b82f6' : '#f87171'};">${dbConnected ? 'Connected' : 'Disconnected'}</p>
                </div>
                <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; text-align: center;">
                    <i class="fas fa-microchip" style="font-size: 32px; color: #f97316; margin-bottom: 12px;"></i>
                    <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 12px;">CPU Usage</p>
                    <p style="margin: 0; font-size: 18px; font-weight: 700; color: #f97316;">${cpuPercent.toFixed(1)}%</p>
                </div>
                <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; text-align: center;">
                    <i class="fas fa-memory" style="font-size: 32px; color: #a855f7; margin-bottom: 12px;"></i>
                    <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 12px;">Memory</p>
                    <p style="margin: 0; font-size: 18px; font-weight: 700; color: #a855f7;">${memoryPercent.toFixed(1)}%</p>
                </div>
                <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; text-align: center;">
                    <i class="fas fa-hdd" style="font-size: 32px; color: #10b981; margin-bottom: 12px;"></i>
                    <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 12px;">Disk</p>
                    <p style="margin: 0; font-size: 18px; font-weight: 700; color: #10b981;">${diskPercent.toFixed(1)}%</p>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render API Metrics
 */
function renderAPIMetrics(metrics) {
    if (metrics?.error) {
        return `
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-chart-line" style="color: #3b82f6;"></i>
                    API Metrics
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5);">Failed to load metrics: ${metrics.error}</p>
            </div>
        `;
    }

    return `
        <div class="chart-container">
            <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-chart-line" style="color: #3b82f6;"></i>
                API Metrics
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">
                <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(59, 130, 246, 0.8); font-size: 12px; font-weight: 500;">Total Requests</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #3b82f6;">${(metrics?.total_requests || 0).toLocaleString()}</p>
                </div>
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(16, 185, 129, 0.8); font-size: 12px; font-weight: 500;">Success Rate</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #10b981;">${(metrics?.success_rate || 0).toFixed(1)}%</p>
                </div>
                <div style="background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(249, 115, 22, 0.8); font-size: 12px; font-weight: 500;">Avg Response Time</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #f97316;">${(metrics?.avg_response_time_ms || 0).toFixed(0)}ms</p>
                </div>
                <div style="background: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(248, 113, 113, 0.8); font-size: 12px; font-weight: 500;">Error Rate</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #f87171;">${(metrics?.error_rate || 0).toFixed(1)}%</p>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render Scraper Status
 */
function renderScraperStatus(scraperStatus) {
    if (scraperStatus?.error) {
        return `
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-spider" style="color: #a855f7;"></i>
                    Scraper Status
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5);">Failed to load scraper status: ${scraperStatus.error}</p>
            </div>
        `;
    }

    const isRunning = scraperStatus?.is_running;
    const statusColor = isRunning ? '#10b981' : '#f87171';

    return `
        <div class="chart-container">
            <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-spider" style="color: #a855f7;"></i>
                Scraper Status
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 12px;">Status</p>
                    <p style="margin: 0; font-size: 20px; font-weight: 700; color: ${statusColor};">${isRunning ? '🟢 Running' : '🔴 Stopped'}</p>
                </div>
                <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 12px;">Active Jobs</p>
                    <p style="margin: 0; font-size: 20px; font-weight: 700; color: #3b82f6;">${scraperStatus?.active_jobs || 0}</p>
                </div>
                <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 12px;">Last Run</p>
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: rgba(255, 255, 255, 0.8);">${formatDate(scraperStatus?.last_run) || 'Never'}</p>
                </div>
                <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 12px;">Items Scraped</p>
                    <p style="margin: 0; font-size: 20px; font-weight: 700; color: #10b981;">${(scraperStatus?.items_scraped || 0).toLocaleString()}</p>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render Active Sessions
 */
function renderActiveSessions(sessions) {
    if (sessions?.error) {
        return `
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-users" style="color: #3b82f6;"></i>
                    Active Sessions
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5);">Failed to load sessions: ${sessions.error}</p>
            </div>
        `;
    }

    const sessionCount = Array.isArray(sessions) ? sessions.length : sessions?.count || 0;

    return `
        <div class="chart-container">
            <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-users" style="color: #3b82f6;"></i>
                Active Sessions (${sessionCount})
            </h3>
            ${renderSessionsTable(sessions)}
        </div>
    `;
}

/**
 * Render Sessions Table
 */
function renderSessionsTable(sessions) {
    const data = Array.isArray(sessions) ? sessions : sessions?.sessions || [];
    
    if (data.length === 0) {
        return '<p style="color: rgba(255, 255, 255, 0.5); text-align: center; padding: 20px;">No active sessions</p>';
    }

    let html = `
        <div class="admin-table">
            <table>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>IP Address</th>
                        <th>Last Activity</th>
                        <th>Duration</th>
                    </tr>
                </thead>
                <tbody>
    `;

    data.slice(0, 10).forEach(session => {
        const user = session.user_email || session.user_id || 'Unknown';
        const ip = session.ip_address || '-';
        const lastActivity = formatDate(session.last_activity_at || session.last_activity);
        const duration = session.duration || '-';

        html += `
            <tr>
                <td><strong>${user}</strong></td>
                <td>${ip}</td>
                <td style="font-size: 12px; color: rgba(255, 255, 255, 0.5);">${lastActivity}</td>
                <td style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">${duration}</td>
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
 * Render Recent Errors
 */
function renderRecentErrors(errors) {
    if (errors?.error) {
        return `
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-exclamation-triangle" style="color: #f87171;"></i>
                    Recent Errors
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5);">Failed to load errors: ${errors.error}</p>
            </div>
        `;
    }

    const errorList = Array.isArray(errors) ? errors : errors?.errors || [];

    return `
        <div class="chart-container">
            <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-exclamation-triangle" style="color: #f87171;"></i>
                Recent Errors (${errorList.length})
            </h3>
            ${renderErrorsTable(errorList)}
        </div>
    `;
}

/**
 * Render Errors Table
 */
function renderErrorsTable(errors) {
    if (errors.length === 0) {
        return '<p style="color: rgba(255, 255, 255, 0.5); text-align: center; padding: 20px;">No recent errors</p>';
    }

    let html = `
        <div class="admin-table">
            <table>
                <thead>
                    <tr>
                        <th>Level</th>
                        <th>Message</th>
                        <th>Source</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
    `;

    errors.slice(0, 15).forEach(error => {
        const level = error.level || 'error';
        const levelColor = level === 'error' ? '#f87171' : level === 'warning' ? '#f59e0b' : '#3b82f6';
        const message = (error.message || error.description || 'Unknown error').substring(0, 50);
        const source = error.source || error.endpoint || '-';
        const timestamp = formatDate(error.timestamp || error.created_at);

        html += `
            <tr style="border-left: 3px solid ${levelColor};">
                <td><span style="background: ${levelColor}20; color: ${levelColor}; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase;">${level}</span></td>
                <td style="font-size: 12px; color: rgba(255, 255, 255, 0.7);">${message}</td>
                <td style="font-size: 11px; color: rgba(255, 255, 255, 0.5);">${source}</td>
                <td style="font-size: 11px; color: rgba(255, 255, 255, 0.5);">${timestamp}</td>
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
 * Helper Functions
 */
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
