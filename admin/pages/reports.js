/**
 * Admin Reports Page
 * Displays signups, revenue, engagement, and platform statistics
 */

async function loadReportsPage() {
    const adminContent = document.getElementById('adminContent');
    
    // Show loading state
    adminContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading reports...</p>
        </div>
    `;

    try {
        // Fetch all report data in parallel
        const [signups, revenue, engagement, platformStats] = await Promise.all([
            API.call('GET', '/api/reports/signups').catch(e => ({ error: e.message })),
            API.call('GET', '/api/reports/revenue').catch(e => ({ error: e.message })),
            API.call('GET', '/api/reports/engagement').catch(e => ({ error: e.message })),
            API.call('GET', '/api/reports/platform-stats').catch(e => ({ error: e.message }))
        ]);

        let html = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">System Reports</h2>
                <p style="color: rgba(255, 255, 255, 0.6); margin-top: 8px;">Analytics and performance reports</p>
            </div>

            <!-- Signups Report -->
            ${renderSignupsReport(signups)}

            <!-- Revenue Report -->
            ${renderRevenueReport(revenue)}

            <!-- Engagement Report -->
            ${renderEngagementReport(engagement)}

            <!-- Platform Stats Report -->
            ${renderPlatformStats(platformStats)}
        `;

        adminContent.innerHTML = html;

    } catch (error) {
        console.error('Failed to load reports page:', error);
        adminContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #f87171; margin-bottom: 16px;"></i>
                <h3>Failed to Load Reports</h3>
                <p>${error.message || 'An error occurred while loading reports.'}</p>
                <button class="btn-primary" onclick="loadReportsPage()" style="margin-top: 16px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

/**
 * Render Signups Report
 */
function renderSignupsReport(signups) {
    console.log('Signups data:', signups);
    
    if (signups?.error) {
        return `
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-user-plus" style="color: #3b82f6;"></i>
                    Signups Report
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5);">Failed to load data: ${signups.error}</p>
            </div>
        `;
    }

    // Extract total_signups from response - try multiple paths
    let totalSignups = Number(signups?.total_signups ?? signups?.total ?? signups?.count ?? 0);
    const signupsByDay = Array.isArray(signups?.signups_by_day) ? signups.signups_by_day : [];
    
    // Calculate growth rate
    const growthRate = Number(signups?.growth_rate ?? 0);
    
    // Calculate peak day
    const peakDay = signupsByDay.length > 0 ? Math.max(...signupsByDay.map(d => Number(d.count ?? d.value ?? 0))) : 0;

    return `
        <div class="chart-container">
            <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-user-plus" style="color: #3b82f6;"></i>
                Signups Report (Last 30 Days)
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(59, 130, 246, 0.8); font-size: 12px; font-weight: 500;">Total Signups</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #3b82f6;">${totalSignups.toLocaleString()}</p>
                </div>
                <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(168, 85, 247, 0.8); font-size: 12px; font-weight: 500;">Avg Per Day</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #a855f7;">${(totalSignups / 30).toFixed(1)}</p>
                </div>
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(16, 185, 129, 0.8); font-size: 12px; font-weight: 500;">Peak Day</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #10b981;">${peakDay}</p>
                </div>
                <div style="background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(249, 115, 22, 0.8); font-size: 12px; font-weight: 500;">Active Days</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #f97316;">${signupsByDay.length}</p>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render Revenue Report
 */
function renderRevenueReport(revenue) {
    console.log('Revenue data:', revenue);
    
    if (revenue?.error) {
        return `
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-dollar-sign" style="color: #10b981;"></i>
                    Revenue Report
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5);">Failed to load data: ${revenue.error}</p>
            </div>
        `;
    }

    // Extract revenue values - try multiple paths
    const proRevenue = Number(revenue?.pro_revenue ?? revenue?.pro ?? revenue?.data?.pro ?? 0);
    const premiumRevenue = Number(revenue?.premium_revenue ?? revenue?.premium ?? revenue?.data?.premium ?? 0);
    const totalRevenue = Number(revenue?.total_revenue ?? revenue?.total ?? (proRevenue + premiumRevenue) ?? 0);
    const avgRevenue = totalRevenue / 30;

    return `
        <div class="chart-container">
            <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-dollar-sign" style="color: #10b981;"></i>
                Revenue Report (Last 30 Days)
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(16, 185, 129, 0.8); font-size: 12px; font-weight: 500;">Pro Revenue</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #10b981;">₦${proRevenue.toLocaleString('en-US')}</p>
                </div>
                <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(168, 85, 247, 0.8); font-size: 12px; font-weight: 500;">Premium Revenue</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #a855f7;">₦${premiumRevenue.toLocaleString('en-US')}</p>
                </div>
                <div style="background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(249, 115, 22, 0.8); font-size: 12px; font-weight: 500;">Total Revenue</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #f97316;">₦${totalRevenue.toLocaleString('en-US')}</p>
                </div>
                <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(59, 130, 246, 0.8); font-size: 12px; font-weight: 500;">Daily Avg</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #3b82f6;">₦${avgRevenue.toLocaleString('en-US')}</p>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render Engagement Report
 */
function renderEngagementReport(engagement) {
    console.log('Engagement data:', engagement);
    
    if (engagement?.error) {
        return `
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-activity" style="color: #a855f7;"></i>
                    Engagement Report
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5);">Failed to load data: ${engagement.error}</p>
            </div>
        `;
    }

    // Extract engagement metrics - try multiple paths
    const active7d = Number(engagement?.active_7d ?? engagement?.users?.active_7d ?? engagement?.seven_day_active ?? 0);
    const active30d = Number(engagement?.active_30d ?? engagement?.users?.active_30d ?? engagement?.thirty_day_active ?? 0);
    const totalScans = Number(engagement?.total_scans ?? engagement?.users?.total_scans ?? engagement?.scans ?? 0);
    const avgEngagement = totalScans > 0 ? (totalScans / Math.max(active30d, 1)).toFixed(1) : 0;

    return `
        <div class="chart-container">
            <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-activity" style="color: #a855f7;"></i>
                Engagement Report (Last 30 Days)
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(168, 85, 247, 0.8); font-size: 12px; font-weight: 500;">Active (7 Days)</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #a855f7;">${active7d.toLocaleString()}</p>
                </div>
                <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(59, 130, 246, 0.8); font-size: 12px; font-weight: 500;">Active (30 Days)</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #3b82f6;">${active30d.toLocaleString()}</p>
                </div>
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(16, 185, 129, 0.8); font-size: 12px; font-weight: 500;">Total Scans</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #10b981;">${totalScans.toLocaleString()}</p>
                </div>
                <div style="background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 12px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: rgba(249, 115, 22, 0.8); font-size: 12px; font-weight: 500;">Avg Per User</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #f97316;">${avgEngagement}</p>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render Platform Stats
 */
function renderPlatformStats(platformStats) {
    console.log('Platform stats data:', platformStats);
    
    if (platformStats?.error) {
        return `
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-network-wired" style="color: #f97316;"></i>
                    Platform Stats
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5);">Failed to load data: ${platformStats.error}</p>
            </div>
        `;
    }

    // Try different paths to get stats
    let stats = [];
    
    if (Array.isArray(platformStats)) {
        stats = platformStats;
    } else if (platformStats?.platforms && Array.isArray(platformStats.platforms)) {
        stats = platformStats.platforms;
    } else if (platformStats?.data && Array.isArray(platformStats.data)) {
        stats = platformStats.data;
    } else if (platformStats?.items && Array.isArray(platformStats.items)) {
        stats = platformStats.items;
    } else if (typeof platformStats === 'object' && !platformStats.error) {
        // If it's an object with stat objects inside, extract them
        stats = Object.values(platformStats).filter(item => typeof item === 'object' && !Array.isArray(item));
    }

    return `
        <div class="chart-container">
            <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-network-wired" style="color: #f97316;"></i>
                Platform Stats
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">
                ${stats.length > 0 ? stats.map((stat, i) => {
                    const colors = ['#3b82f6', '#10b981', '#f97316', '#a855f7', '#f87171', '#fbbf24'];
                    const color = colors[i % colors.length];
                    const platformName = stat.name || stat.platform || stat.title || `Platform ${i + 1}`;
                    const opportunities = Number(stat.opportunities ?? stat.count ?? stat.value ?? 0);
                    
                    return `
                        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-align: center;">
                            <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 12px;">${platformName}</p>
                            <p style="margin: 0 0 4px 0; font-size: 20px; font-weight: 700; color: ${color};">${opportunities.toLocaleString()}</p>
                            <p style="margin: 0; font-size: 11px; color: rgba(255, 255, 255, 0.5);">opportunities</p>
                        </div>
                    `;
                }).join('') : `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px; color: rgba(255, 255, 255, 0.5);">
                        <p>No platform data available</p>
                    </div>
                `}
            </div>
        </div>
    `;
}
