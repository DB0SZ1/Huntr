/**
 * Admin Promotions Management Page
 * Displays promotional codes, active trials, and promo analytics
 */

async function loadPromotionsPage() {
    const adminContent = document.getElementById('adminContent');
    
    // Show loading state
    adminContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading promotions...</p>
        </div>
    `;

    try {
        // Fetch all promotion-related data in parallel
        const [available, redeemed, activeTrials] = await Promise.all([
            API.call('GET', '/api/promo/available').catch(e => ({ error: e.message })),
            API.call('GET', '/api/promo/redeemed').catch(e => ({ error: e.message })),
            API.call('GET', '/api/promo/active-trials').catch(e => ({ error: e.message }))
        ]);

        console.log('Available promos:', available);
        console.log('Redeemed promos:', redeemed);
        console.log('Active trials:', activeTrials);

        let html = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">Promotions Management</h2>
                <p style="color: rgba(255, 255, 255, 0.6); margin-top: 8px;">Manage promotional codes and trial periods</p>
            </div>

            <!-- Promo Stats -->
            ${renderPromoStats(available, redeemed, activeTrials)}

            <!-- Available Promos -->
            ${renderAvailablePromos(available)}

            <!-- Active Trials -->
            ${renderActiveTrials(activeTrials)}

            <!-- Redeemed Promos -->
            ${renderRedeemedPromos(redeemed)}
        `;

        adminContent.innerHTML = html;

    } catch (error) {
        console.error('Failed to load promotions page:', error);
        adminContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #f87171; margin-bottom: 16px;"></i>
                <h3>Failed to Load Promotions</h3>
                <p>${error.message || 'An error occurred while loading promotions.'}</p>
                <button class="btn-primary" onclick="loadPromotionsPage()" style="margin-top: 16px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

/**
 * Render Promotion Statistics
 */
function renderPromoStats(available, redeemed, activeTrials) {
    console.log('Rendering promo stats');

    // Extract array counts
    let availableCount = 0;
    if (Array.isArray(available)) {
        availableCount = available.length;
    } else if (available?.promos && Array.isArray(available.promos)) {
        availableCount = available.promos.length;
    } else if (available?.data && Array.isArray(available.data)) {
        availableCount = available.data.length;
    }

    let redeemedCount = 0;
    if (Array.isArray(redeemed)) {
        redeemedCount = redeemed.length;
    } else if (redeemed?.promos && Array.isArray(redeemed.promos)) {
        redeemedCount = redeemed.promos.length;
    } else if (redeemed?.data && Array.isArray(redeemed.data)) {
        redeemedCount = redeemed.data.length;
    }

    let trialsCount = 0;
    if (Array.isArray(activeTrials)) {
        trialsCount = activeTrials.length;
    } else if (activeTrials?.trials && Array.isArray(activeTrials.trials)) {
        trialsCount = activeTrials.trials.length;
    } else if (activeTrials?.data && Array.isArray(activeTrials.data)) {
        trialsCount = activeTrials.data.length;
    }

    const totalPromos = availableCount + redeemedCount;
    const redemptionRate = totalPromos > 0 ? ((redeemedCount / totalPromos) * 100).toFixed(1) : 0;

    return `
        <div class="stats-grid-admin" style="margin-bottom: 32px;">
            <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
                border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 24px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <h4 style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; font-weight: 600;">
                        <i class="fas fa-tag" style="margin-right: 8px;"></i>Available Codes
                    </h4>
                    <i class="fas fa-ticket-alt" style="color: #3b82f6; font-size: 20px;"></i>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #3b82f6;">
                    ${availableCount}
                </div>
                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-top: 8px;">
                    Ready to redeem
                </div>
            </div>

            <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
                border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 24px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <h4 style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; font-weight: 600;">
                        <i class="fas fa-check-circle" style="margin-right: 8px;"></i>Redeemed
                    </h4>
                    <i class="fas fa-check" style="color: #10b981; font-size: 20px;"></i>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #10b981;">
                    ${redeemedCount}
                </div>
                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-top: 8px;">
                    Already used
                </div>
            </div>

            <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%);
                border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 24px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <h4 style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; font-weight: 600;">
                        <i class="fas fa-hourglass-start" style="margin-right: 8px;"></i>Active Trials
                    </h4>
                    <i class="fas fa-running" style="color: #a855f7; font-size: 20px;"></i>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #a855f7;">
                    ${trialsCount}
                </div>
                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-top: 8px;">
                    In progress
                </div>
            </div>

            <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
                border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 24px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <h4 style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; font-weight: 600;">
                        <i class="fas fa-chart-pie" style="margin-right: 8px;"></i>Redemption Rate
                    </h4>
                    <i class="fas fa-percent" style="color: #f59e0b; font-size: 20px;"></i>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">
                    ${redemptionRate}%
                </div>
                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-top: 8px;">
                    Of total codes
                </div>
            </div>
        </div>
    `;
}

/**
 * Render Available Promotional Codes
 */
function renderAvailablePromos(promosResponse) {
    console.log('Rendering available promos:', promosResponse);

    if (promosResponse?.error) {
        return `
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-ticket-alt" style="color: #3b82f6;"></i>
                    Available Promotional Codes
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5);">Failed to load available promos: ${promosResponse.error}</p>
            </div>
        `;
    }

    // Extract promos from response
    let promos = [];
    if (Array.isArray(promosResponse)) {
        promos = promosResponse;
    } else if (promosResponse?.promos && Array.isArray(promosResponse.promos)) {
        promos = promosResponse.promos;
    } else if (promosResponse?.data && Array.isArray(promosResponse.data)) {
        promos = promosResponse.data;
    }

    if (!Array.isArray(promos) || promos.length === 0) {
        return `
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-ticket-alt" style="color: #3b82f6;"></i>
                    Available Promotional Codes
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5);">No available promotional codes</p>
            </div>
        `;
    }

    return `
        <div class="chart-container">
            <h3 style="margin-top: 0; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-ticket-alt" style="color: #3b82f6;"></i>
                Available Promotional Codes (${promos.length})
            </h3>
            
            <div class="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Type</th>
                            <th>Discount/Value</th>
                            <th>Tier</th>
                            <th>Uses Left</th>
                            <th>Created</th>
                            <th>Expires</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${promos.map(promo => `
                            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                <td style="padding: 16px; color: white; font-weight: 600; font-family: monospace;">
                                    ${promo?.code ?? promo?.promo_code ?? 'N/A'}
                                </td>
                                <td style="padding: 16px; color: #3b82f6;">
                                    ${promo?.type ?? promo?.promo_type ?? 'Standard'}
                                </td>
                                <td style="padding: 16px; color: #10b981; font-weight: 600;">
                                    ${promo?.discount ? promo.discount + (promo.is_percentage ? '%' : '₦') : promo?.value ? '₦' + promo.value : 'N/A'}
                                </td>
                                <td style="padding: 16px; color: #a855f7; text-transform: capitalize;">
                                    ${promo?.tier ?? promo?.applicable_tier ?? 'All'}
                                </td>
                                <td style="padding: 16px; text-align: center; color: #f59e0b;">
                                    ${promo?.remaining_uses ?? promo?.uses_left ?? 'Unlimited'}
                                </td>
                                <td style="padding: 16px; color: rgba(255, 255, 255, 0.7); font-size: 12px;">
                                    ${formatDate(promo?.created_at ?? promo?.created_date ?? 'N/A')}
                                </td>
                                <td style="padding: 16px; color: rgba(255, 255, 255, 0.7); font-size: 12px;">
                                    ${promo?.expires_at ? formatDate(promo.expires_at) : promo?.expiry_date ? formatDate(promo.expiry_date) : 'Never'}
                                </td>
                                <td style="padding: 16px;">
                                    <button style="padding: 6px 12px; background: rgba(59, 130, 246, 0.2); color: #3b82f6; 
                                        border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 4px; cursor: pointer; font-size: 11px;">
                                        Details
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * Render Active Trials
 */
function renderActiveTrials(trialsResponse) {
    console.log('Rendering active trials:', trialsResponse);

    if (trialsResponse?.error) {
        return `
            <div class="chart-container" style="margin-top: 32px;">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-hourglass-start" style="color: #a855f7;"></i>
                    Active Trial Periods
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5);">Failed to load active trials: ${trialsResponse.error}</p>
            </div>
        `;
    }

    // Extract trials from response
    let trials = [];
    if (Array.isArray(trialsResponse)) {
        trials = trialsResponse;
    } else if (trialsResponse?.trials && Array.isArray(trialsResponse.trials)) {
        trials = trialsResponse.trials;
    } else if (trialsResponse?.data && Array.isArray(trialsResponse.data)) {
        trials = trialsResponse.data;
    }

    if (!Array.isArray(trials) || trials.length === 0) {
        return `
            <div class="chart-container" style="margin-top: 32px;">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-hourglass-start" style="color: #a855f7;"></i>
                    Active Trial Periods
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5);">No active trials</p>
            </div>
        `;
    }

    return `
        <div class="chart-container" style="margin-top: 32px;">
            <h3 style="margin-top: 0; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-hourglass-start" style="color: #a855f7;"></i>
                Active Trial Periods (${trials.length})
            </h3>
            
            <div class="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Email</th>
                            <th>Trial Tier</th>
                            <th>Started</th>
                            <th>Expires</th>
                            <th>Days Left</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${trials.map(trial => {
                            const expiresAt = trial?.expires_at ?? trial?.end_date ?? null;
                            const now = new Date();
                            const expiryDate = expiresAt ? new Date(expiresAt) : null;
                            const daysLeft = expiryDate ? Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)) : 0;
                            const statusColor = daysLeft > 7 ? '#10b981' : daysLeft > 0 ? '#f59e0b' : '#f87171';
                            const status = daysLeft > 0 ? 'Active' : 'Expired';

                            return `
                                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                    <td style="padding: 16px; color: white; font-family: monospace; font-size: 12px;">
                                        ${trial?.user_id ?? trial?.user ?? 'N/A'}
                                    </td>
                                    <td style="padding: 16px; color: rgba(255, 255, 255, 0.8);">
                                        ${trial?.email ?? trial?.user_email ?? 'N/A'}
                                    </td>
                                    <td style="padding: 16px; color: #3b82f6; font-weight: 600; text-transform: capitalize;">
                                        ${trial?.tier ?? trial?.trial_tier ?? trial?.plan ?? 'Standard'}
                                    </td>
                                    <td style="padding: 16px; color: rgba(255, 255, 255, 0.7); font-size: 12px;">
                                        ${formatDate(trial?.started_at ?? trial?.start_date ?? 'N/A')}
                                    </td>
                                    <td style="padding: 16px; color: rgba(255, 255, 255, 0.7); font-size: 12px;">
                                        ${formatDate(expiresAt)}
                                    </td>
                                    <td style="padding: 16px; text-align: center; color: ${statusColor}; font-weight: 600;">
                                        ${daysLeft > 0 ? daysLeft + ' days' : 'Expired'}
                                    </td>
                                    <td style="padding: 16px; text-align: center;">
                                        <span style="display: inline-block; padding: 4px 12px; background: ${statusColor}40; color: ${statusColor}; 
                                            border-radius: 20px; font-size: 11px; font-weight: 600;">
                                            ${status}
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * Render Redeemed Promotional Codes
 */
function renderRedeemedPromos(redeemedResponse) {
    console.log('Rendering redeemed promos:', redeemedResponse);

    if (redeemedResponse?.error) {
        return `
            <div class="chart-container" style="margin-top: 32px;">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-history" style="color: #10b981;"></i>
                    Redeemed Promotional Codes
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5);">Failed to load redeemed promos: ${redeemedResponse.error}</p>
            </div>
        `;
    }

    // Extract redeemed from response
    let redeemed = [];
    if (Array.isArray(redeemedResponse)) {
        redeemed = redeemedResponse;
    } else if (redeemedResponse?.promos && Array.isArray(redeemedResponse.promos)) {
        redeemed = redeemedResponse.promos;
    } else if (redeemedResponse?.data && Array.isArray(redeemedResponse.data)) {
        redeemed = redeemedResponse.data;
    }

    if (!Array.isArray(redeemed) || redeemed.length === 0) {
        return `
            <div class="chart-container" style="margin-top: 32px;">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-history" style="color: #10b981;"></i>
                    Redeemed Promotional Codes
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5);">No redeemed promotional codes</p>
            </div>
        `;
    }

    return `
        <div class="chart-container" style="margin-top: 32px;">
            <h3 style="margin-top: 0; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-history" style="color: #10b981;"></i>
                Redeemed Promotional Codes (${redeemed.length})
            </h3>
            
            <div class="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Redeemed By</th>
                            <th>Email</th>
                            <th>Redeemed Date</th>
                            <th>Discount/Value</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${redeemed.slice(0, 20).map(item => `
                            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                <td style="padding: 16px; color: white; font-weight: 600; font-family: monospace;">
                                    ${item?.code ?? item?.promo_code ?? 'N/A'}
                                </td>
                                <td style="padding: 16px; color: rgba(255, 255, 255, 0.8);">
                                    ${item?.user_id ?? item?.redeemed_by ?? 'N/A'}
                                </td>
                                <td style="padding: 16px; color: rgba(255, 255, 255, 0.8);">
                                    ${item?.email ?? item?.user_email ?? 'N/A'}
                                </td>
                                <td style="padding: 16px; color: rgba(255, 255, 255, 0.7); font-size: 12px;">
                                    ${formatDate(item?.redeemed_at ?? item?.redemption_date ?? 'N/A')}
                                </td>
                                <td style="padding: 16px; color: #10b981; font-weight: 600;">
                                    ${item?.discount ? item.discount + (item.is_percentage ? '%' : '₦') : item?.value ? '₦' + item.value : 'N/A'}
                                </td>
                                <td style="padding: 16px; text-align: center;">
                                    <span style="display: inline-block; padding: 4px 12px; background: rgba(16, 185, 129, 0.2); 
                                        color: #10b981; border-radius: 20px; font-size: 11px; font-weight: 600;">
                                        Redeemed
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            ${redeemed.length > 20 ? `
                <div style="text-align: center; padding: 16px; color: rgba(255, 255, 255, 0.6); font-size: 12px;">
                    Showing 20 of ${redeemed.length} redeemed codes
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Format date helper
 */
function formatDate(dateString) {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
}
