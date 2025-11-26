/**
 * Admin Payments Management Page
 * Displays payment plans, subscription information, and payment analytics
 */

async function loadPaymentsPage() {
    const adminContent = document.getElementById('adminContent');
    
    // Show loading state
    adminContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading payment information...</p>
        </div>
    `;

    try {
        // Fetch all payment-related data in parallel
        const [plans, subscriptionData, metrics] = await Promise.all([
            API.call('GET', '/api/payments/plans').catch(e => ({ error: e.message })),
            API.call('GET', '/api/payments/subscription/current').catch(e => ({ error: e.message })),
            API.call('GET', '/api/admin/stats/overview').catch(e => ({ error: e.message }))
        ]);

        console.log('Plans data:', plans);
        console.log('Subscription data:', subscriptionData);
        console.log('Metrics data:', metrics);

        let html = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">Payment Management</h2>
                <p style="color: rgba(255, 255, 255, 0.6); margin-top: 8px;">Manage subscription plans and payment processing</p>
            </div>

            <!-- Subscription Plans -->
            ${renderSubscriptionPlans(plans)}

            <!-- Current Subscription Stats -->
            ${renderSubscriptionStats(subscriptionData, metrics)}

            <!-- Payment Metrics -->
            ${renderPaymentMetrics(metrics)}
        `;

        adminContent.innerHTML = html;

    } catch (error) {
        console.error('Failed to load payments page:', error);
        adminContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #f87171; margin-bottom: 16px;"></i>
                <h3>Failed to Load Payment Information</h3>
                <p>${error.message || 'An error occurred while loading payment data.'}</p>
                <button class="btn-primary" onclick="loadPaymentsPage()" style="margin-top: 16px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

/**
 * Render Subscription Plans
 */
function renderSubscriptionPlans(plansResponse) {
    console.log('Rendering subscription plans:', plansResponse);
    
    if (plansResponse?.error) {
        return `
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-credit-card" style="color: #3b82f6;"></i>
                    Subscription Plans
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5);">Failed to load plans: ${plansResponse.error}</p>
            </div>
        `;
    }

    // Extract plans from response - try multiple paths
    let plans = [];
    if (Array.isArray(plansResponse)) {
        plans = plansResponse;
    } else if (plansResponse?.plans) {
        plans = plansResponse.plans;
    } else if (plansResponse?.data) {
        plans = plansResponse.data;
    } else if (typeof plansResponse === 'object') {
        // Convert object to array if needed
        plans = Object.values(plansResponse).filter(p => typeof p === 'object' && p !== null);
    }

    if (!Array.isArray(plans) || plans.length === 0) {
        return `
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-credit-card" style="color: #3b82f6;"></i>
                    Subscription Plans
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5);">No subscription plans available</p>
            </div>
        `;
    }

    return `
        <div class="chart-container">
            <h3 style="margin-top: 0; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-credit-card" style="color: #3b82f6;"></i>
                Subscription Plans
            </h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 32px;">
                ${plans.map(plan => `
                    <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%); 
                        border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 24px;">
                        <div style="font-size: 24px; font-weight: bold; color: #3b82f6; margin-bottom: 8px;">
                            ${plan?.name || plan?.tier || 'Plan'}
                        </div>
                        <div style="font-size: 14px; color: rgba(255, 255, 255, 0.6); margin-bottom: 16px;">
                            ${plan?.description || 'Subscription plan'}
                        </div>
                        
                        <div style="background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                            <div style="font-size: 28px; font-weight: bold; color: #10b981; margin-bottom: 4px;">
                                ₦${formatNumber(Number(plan?.price ?? plan?.amount ?? plan?.monthly_price ?? 0))}
                            </div>
                            <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">
                                ${plan?.billing_cycle || plan?.period || 'Monthly'}
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px; text-align: center;">
                                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">Scans/Month</div>
                                <div style="font-size: 18px; font-weight: bold; color: #a855f7; margin-top: 4px;">
                                    ${plan?.scans_per_month ?? plan?.scans ?? 'Unlimited'}
                                </div>
                            </div>
                            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px; text-align: center;">
                                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">Users</div>
                                <div style="font-size: 18px; font-weight: bold; color: #f59e0b; margin-top: 4px;">
                                    ${plan?.max_users ?? plan?.users ?? '1'}
                                </div>
                            </div>
                        </div>
                        
                        <button class="btn-primary" style="width: 100%; padding: 10px; background: rgba(59, 130, 246, 0.2); 
                            color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 6px; cursor: pointer; font-size: 12px;">
                            View Details
                        </button>
                    </div>
                `).join('')}
            </div>

            <!-- Plans Table -->
            <div class="admin-table" style="margin-top: 32px;">
                <table>
                    <thead>
                        <tr>
                            <th>Plan Name</th>
                            <th>Price</th>
                            <th>Period</th>
                            <th>Scans/Month</th>
                            <th>Max Users</th>
                            <th>Features</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${plans.map(plan => `
                            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                <td style="padding: 16px; color: white; font-weight: 500;">${plan?.name || plan?.tier || 'Plan'}</td>
                                <td style="padding: 16px; color: #10b981;">₦${formatNumber(Number(plan?.price ?? plan?.amount ?? 0))}</td>
                                <td style="padding: 16px; color: rgba(255, 255, 255, 0.7);">${plan?.billing_cycle || plan?.period || 'Monthly'}</td>
                                <td style="padding: 16px; text-align: center; color: #a855f7; font-weight: 600;">
                                    ${plan?.scans_per_month ?? plan?.scans ?? 'Unlimited'}
                                </td>
                                <td style="padding: 16px; text-align: center; color: #f59e0b; font-weight: 600;">
                                    ${plan?.max_users ?? plan?.users ?? '1'}
                                </td>
                                <td style="padding: 16px; color: rgba(255, 255, 255, 0.6); font-size: 12px;">
                                    ${plan?.features ? (Array.isArray(plan.features) ? plan.features.join(', ') : plan.features) : 'Standard'}
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
 * Render Subscription Statistics
 */
function renderSubscriptionStats(subscriptionResponse, metricsResponse) {
    console.log('Rendering subscription stats');
    
    // Extract subscription data
    let currentSub = {};
    if (subscriptionResponse?.error) {
        currentSub = {};
    } else if (subscriptionResponse?.subscription) {
        currentSub = subscriptionResponse.subscription;
    } else if (subscriptionResponse?.data) {
        currentSub = subscriptionResponse.data;
    } else if (typeof subscriptionResponse === 'object') {
        currentSub = subscriptionResponse;
    }

    // Extract metrics data
    let metrics = {};
    if (metricsResponse?.error) {
        metrics = {};
    } else if (metricsResponse?.stats) {
        metrics = metricsResponse.stats;
    } else if (metricsResponse?.data) {
        metrics = metricsResponse.data;
    } else if (typeof metricsResponse === 'object') {
        metrics = metricsResponse;
    }

    // Extract subscription values with fallbacks
    const tier = currentSub?.tier ?? currentSub?.plan ?? currentSub?.subscription_tier ?? 'free';
    const status = currentSub?.status ?? currentSub?.subscription_status ?? 'active';
    const renewalDate = currentSub?.renewal_date ?? currentSub?.next_billing_date ?? 'N/A';
    const cancelledAt = currentSub?.cancelled_at ?? null;

    // Extract metrics
    const totalRevenue = metrics?.total_revenue ?? 0;
    const totalSubscriptions = metrics?.total_subscriptions ?? 0;
    const activeSubscriptions = metrics?.active_subscriptions ?? 0;

    return `
        <div class="stats-grid-admin" style="margin-bottom: 32px; margin-top: 32px;">
            <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
                border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 24px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <h4 style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; font-weight: 600;">
                        <i class="fas fa-credit-card" style="margin-right: 8px;"></i>Total Revenue
                    </h4>
                    <i class="fas fa-chart-line" style="color: #3b82f6; font-size: 20px;"></i>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #3b82f6;">
                    ₦${formatNumber(totalRevenue)}
                </div>
                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-top: 8px;">
                    All-time revenue
                </div>
            </div>

            <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
                border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 24px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <h4 style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; font-weight: 600;">
                        <i class="fas fa-users" style="margin-right: 8px;"></i>Active Subscriptions
                    </h4>
                    <i class="fas fa-check-circle" style="color: #10b981; font-size: 20px;"></i>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #10b981;">
                    ${formatNumber(activeSubscriptions)}
                </div>
                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-top: 8px;">
                    Currently active
                </div>
            </div>

            <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%);
                border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 24px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <h4 style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; font-weight: 600;">
                        <i class="fas fa-list" style="margin-right: 8px;"></i>Total Subscriptions
                    </h4>
                    <i class="fas fa-chart-bar" style="color: #a855f7; font-size: 20px;"></i>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #a855f7;">
                    ${formatNumber(totalSubscriptions)}
                </div>
                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-top: 8px;">
                    All subscriptions
                </div>
            </div>

            <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
                border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 24px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <h4 style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; font-weight: 600;">
                        <i class="fas fa-crown" style="margin-right: 8px;"></i>Current Plan
                    </h4>
                    <i class="fas fa-info-circle" style="color: #f59e0b; font-size: 20px;"></i>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #f59e0b; text-transform: capitalize;">
                    ${tier}
                </div>
                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-top: 8px;">
                    Status: <span style="color: ${status === 'active' ? '#10b981' : '#f87171'}; font-weight: 600;">${status}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render Payment Metrics / Recent Transactions
 */
function renderPaymentMetrics(metricsResponse) {
    console.log('Rendering payment metrics');

    if (metricsResponse?.error) {
        return `
            <div class="chart-container">
                <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-history" style="color: #f59e0b;"></i>
                    Payment Metrics
                </h3>
                <p style="color: rgba(255, 255, 255, 0.5);">Failed to load metrics: ${metricsResponse.error}</p>
            </div>
        `;
    }

    return `
        <div class="chart-container">
            <h3 style="margin-top: 0; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-history" style="color: #f59e0b;"></i>
                Payment Metrics
            </h3>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                <div style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.1);">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-bottom: 8px;">
                                Pro Subscriptions
                            </div>
                            <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">
                                ${formatNumber(metricsResponse?.pro_subscriptions ?? metricsResponse?.pro_count ?? 0)}
                            </div>
                        </div>
                        <i class="fas fa-crown" style="font-size: 32px; color: rgba(59, 130, 246, 0.3);"></i>
                    </div>
                </div>

                <div style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.1);">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-bottom: 8px;">
                                Premium Subscriptions
                            </div>
                            <div style="font-size: 28px; font-weight: bold; color: #a855f7;">
                                ${formatNumber(metricsResponse?.premium_subscriptions ?? metricsResponse?.premium_count ?? 0)}
                            </div>
                        </div>
                        <i class="fas fa-gem" style="font-size: 32px; color: rgba(168, 85, 247, 0.3);"></i>
                    </div>
                </div>

                <div style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.1);">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-bottom: 8px;">
                                Free Users
                            </div>
                            <div style="font-size: 28px; font-weight: bold; color: #10b981;">
                                ${formatNumber(metricsResponse?.free_users ?? metricsResponse?.free_count ?? 0)}
                            </div>
                        </div>
                        <i class="fas fa-layer-group" style="font-size: 32px; color: rgba(16, 185, 129, 0.3);"></i>
                    </div>
                </div>
            </div>

            <div style="background: rgba(255, 255, 255, 0.03); border-radius: 10px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.1); margin-top: 20px;">
                <div style="font-size: 14px; font-weight: 600; color: rgba(255, 255, 255, 0.8); margin-bottom: 12px;">
                    💡 Quick Info
                </div>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    <li style="margin-bottom: 10px; color: rgba(255, 255, 255, 0.6); font-size: 13px;">
                        ✓ Use the Payments Dashboard to monitor subscriptions
                    </li>
                    <li style="margin-bottom: 10px; color: rgba(255, 255, 255, 0.6); font-size: 13px;">
                        ✓ View detailed payment history and invoices
                    </li>
                    <li style="margin-bottom: 10px; color: rgba(255, 255, 255, 0.6); font-size: 13px;">
                        ✓ Manage failed payments and retries
                    </li>
                    <li style="color: rgba(255, 255, 255, 0.6); font-size: 13px;">
                        ✓ Configure plan pricing and features
                    </li>
                </ul>
            </div>
        </div>
    `;
}

/**
 * Helper function to format numbers
 */
function formatNumber(num) {
    return Number(num || 0).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}
