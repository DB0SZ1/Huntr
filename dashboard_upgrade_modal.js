/**
 * Upgrade Modal - Fixed pricing and no-niches handling
 */

async function loadUpgradeModal() {
    try {
        const plans = await API.getSubscriptionPlans();
        const user = await API.getCurrentUser();
        const tierLimits = await API.getCreditsTierLimits().catch(() => ({}));
        const modalContent = document.querySelector('.pricing-modal-grid');
        
        if (!modalContent) {
            console.error('Pricing modal grid not found');
            return;
        }
        
        modalContent.innerHTML = '';
        
        plans.forEach(plan => {
            const isCurrentPlan = plan.tier === user.tier;
            
            const card = document.createElement('div');
            card.className = 'pricing-modal-card' + (plan.tier === 'pro' ? ' featured' : '');
            
            // Handle both 'price' and 'price_ngn' from backend
            const price = plan.price ?? plan.price_ngn ?? 0;
            const priceDisplay = price === 0 ? 'Free' : `₦${price.toLocaleString()}`;
            const badge = isCurrentPlan ? 'Current Plan' : (plan.tier === 'pro' ? 'Most Popular' : '');
            
            // Defensive property access
            const maxNiches = plan.max_niches ?? 1;
            const maxKeywords = plan.max_keywords_per_niche ?? 10;
            const platforms = Array.isArray(plan.platforms) ? plan.platforms : [];
            const oppLimit = plan.monthly_opportunities_limit ?? 100;
            const features = Array.isArray(plan.features) ? plan.features : [];
            
            const oppText = oppLimit === -1 ? 'Unlimited' : oppLimit;
            
            // Get credit limits for this tier (fallback if API call failed)
            const tierData = tierLimits.data?.find(t => t.tier === plan.tier) || {
                daily_credits: plan.tier === 'free' ? 10 : plan.tier === 'pro' ? 100 : 500,
                max_scans: plan.tier === 'free' ? 2 : plan.tier === 'pro' ? 10 : 50
            };
            
            card.innerHTML = `
                ${badge ? `<span class="pricing-modal-badge">${badge}</span>` : ''}
                <h3 class="pricing-modal-name">${plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)}</h3>
                <div class="pricing-modal-price">${priceDisplay}${price > 0 ? '/mo' : ''}</div>
                
                <div style="margin: 20px 0; padding: 16px; background: rgba(255, 255, 255, 0.08); border-radius: 10px; border-left: 3px solid rgba(251, 191, 36, 0.5);">
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 11px; margin-bottom: 8px; text-transform: uppercase; font-weight: 600;">Daily Credits</div>
                    <div style="color: #fbbf24; font-size: 18px; font-weight: 800;">${tierData.daily_credits || '10'} credits/day</div>
                    <div style="color: rgba(255, 255, 255, 0.4); font-size: 12px; margin-top: 4px;">Max ${tierData.max_scans || '2'} scans/day</div>
                </div>
                
                <ul class="pricing-modal-features">
                    <li><i class="fas fa-check"></i> ${maxNiches} niches</li>
                    <li><i class="fas fa-check"></i> ${maxKeywords} keywords/niche</li>
                    <li><i class="fas fa-check"></i> ${platforms.length} platforms</li>
                    <li><i class="fas fa-check"></i> ${oppText} opps/month</li>
                    ${features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
                </ul>
                <button class="pricing-modal-btn" 
                        ${isCurrentPlan ? 'disabled' : ''}
                        onclick="upgradeToPlan('${plan.tier}', '${plan.id || plan._id}')">
                    ${isCurrentPlan ? 'Current Plan' : `Upgrade to ${plan.tier.toUpperCase()}`}
                </button>
            `;
            
            modalContent.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to load pricing:', error);
        document.querySelector('.pricing-modal-grid').innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p>Failed to load pricing plans. Please try again.</p>
            </div>
        `;
    }
}

async function upgradeToPlan(tier, planId) {
    try {
        const button = event.target;
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Processing...';
        
        const payment = await API.initializePayment(planId);
        
        sessionStorage.setItem('paymentReference', payment.reference);
        sessionStorage.setItem('upgradeTier', tier);
        
        if (payment.authorization_url) {
            window.location.href = payment.authorization_url;
        } else if (payment.payment_url) {
            window.location.href = payment.payment_url;
        } else {
            throw new Error('No payment URL provided');
        }
    } catch (error) {
        console.error('Failed to initialize payment:', error);
        alert('Failed to initialize payment: ' + error.message);
        event.target.disabled = false;
        event.target.textContent = originalText || 'Upgrade';
    }
}

// Modal for no niches
function showNoNichesModal() {
    const modal = document.createElement('div');
    modal.id = 'noNichesModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 40px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        ">
            <div style="font-size: 48px; margin-bottom: 20px;">📭</div>
            <h2 style="color: white; margin-bottom: 12px; font-size: 24px;">No Niches Configured</h2>
            <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 32px; line-height: 1.6;">
                You need to create at least one niche before you can start scanning for opportunities.
            </p>
            <div style="display: flex; gap: 12px;">
                <button onclick="closeNoNichesModal()" style="
                    flex: 1;
                    padding: 12px 24px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">Cancel</button>
                <button onclick="navigateToNiches(); closeNoNichesModal();" style="
                    flex: 1;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #333333 0%, #1a1a1a 100%);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                ">Create Niche</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeNoNichesModal() {
    const modal = document.getElementById('noNichesModal');
    if (modal) modal.remove();
}

// Export globally
window.loadUpgradeModal = loadUpgradeModal;
window.upgradeToPlan = upgradeToPlan;
window.showNoNichesModal = showNoNichesModal;
window.closeNoNichesModal = closeNoNichesModal;
