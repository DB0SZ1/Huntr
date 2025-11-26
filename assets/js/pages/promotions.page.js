/**
 * promotions.page.js - Promotions page rendering
 */

async function renderPromotionsPage() {
    const mainContent = document.querySelector('.dashboard-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="background">
            <div class="bubble bubble-1"></div>
            <div class="bubble bubble-2"></div>
        </div>
        
        <div class="promo-container">
            <div class="promo-card">
                <div class="promo-header">
                    <div class="promo-icon">🎉</div>
                    <h1 class="promo-title">Claim Your Free Trial</h1>
                    <p class="promo-subtitle">Get instant access to Pro features</p>
                </div>
                
                <div class="promo-offer">
                    <div class="promo-offer-text">2 Weeks of Pro</div>
                    <div class="promo-offer-detail">Courtesy of DB0SZ1</div>
                </div>
                
                <div id="errorMessage" class="error-message"></div>
                <div id="successMessage" class="success-message"></div>
                
                <form id="promoForm" onsubmit="redeemPromo(event)">
                    <div class="form-group">
                        <label class="form-label">Twitter Handle</label>
                        <input type="text" id="twitterHandle" class="form-input" placeholder="@username" required>
                        <small style="color: rgba(255, 255, 255, 0.5); font-size: 12px; margin-top: 4px; display: block;">The Twitter handle you signed up with</small>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Phone Number</label>
                        <input type="tel" id="phoneNumber" class="form-input" placeholder="+1-415-555-0123" required>
                        <small style="color: rgba(255, 255, 255, 0.5); font-size: 12px; margin-top: 4px; display: block;">The phone number used for registration</small>
                    </div>
                    
                    <button type="submit" id="redeemBtn" class="promo-button">
                        <span>Claim Trial</span>
                    </button>
                </form>
                
                <div style="text-align: center; margin-top: 24px;">
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                        Already have a trial? <a href="javascript:navigateToPage('dashboard')" class="promo-link">Back to Dashboard</a>
                    </p>
                </div>
            </div>
        </div>
    `;

    // Success Modal HTML
    const successModalHTML = `
        <div id="successModal" style="
            position: fixed;
            top: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            display: none;
            align-items: center;
            gap: 12px;
            z-index: 1000;
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
            animation: slideDown 0.3s ease-out, slideOutUp 0.3s ease-out 4.7s;
            font-size: 16px;
            font-weight: 500;
        ">
            <i class="fas fa-check-circle" style="font-size: 20px;"></i>
            <span>Successfully activated PRO tier for 14 days</span>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', successModalHTML);
    
    // Add CSS animations
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        
        @keyframes slideOutUp {
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
        }
    `;
    document.head.appendChild(styleElement);
}

async function redeemPromo(event) {
    event.preventDefault();
    
    const twitterHandle = document.getElementById('twitterHandle')?.value.trim() || '';
    const phoneNumber = document.getElementById('phoneNumber')?.value.trim() || '';
    const redeemBtn = document.getElementById('redeemBtn');
    const errorMsg = document.getElementById('errorMessage');
    
    if (!redeemBtn || !errorMsg) return;
    
    // Clear messages
    errorMsg.style.display = 'none';
    
    // Validate inputs
    if (!twitterHandle || !phoneNumber) {
        errorMsg.textContent = 'Please fill in all fields';
        errorMsg.style.display = 'block';
        return;
    }
    
    if (!twitterHandle.startsWith('@')) {
        errorMsg.textContent = 'Twitter handle must start with @';
        errorMsg.style.display = 'block';
        return;
    }
    
    // Disable button and show loading
    redeemBtn.disabled = true;
    redeemBtn.innerHTML = '<div class="loading-spinner"></div><span>Processing...</span>';
    
    try {
        const result = await API.call('POST', '/api/promo/redeem', {
            twitter_handle: twitterHandle,
            phone_number: phoneNumber
        });
        
        if (result && result.status === 'success') {
            const successModal = document.getElementById('successModal');
            if (successModal) {
                successModal.style.display = 'flex';
                setTimeout(() => {
                    successModal.style.display = 'none';
                    navigateToPage('dashboard');
                }, 5000);
            }
        } else {
            errorMsg.textContent = result?.message || 'Failed to redeem trial. Please check your details and try again.';
            errorMsg.style.display = 'block';
        }
    } catch (error) {
        errorMsg.textContent = error.message || 'An error occurred. Please try again.';
        errorMsg.style.display = 'block';
    } finally {
        redeemBtn.disabled = false;
        redeemBtn.innerHTML = '<span>Claim Trial</span>';
    }
}

window.renderPromotionsPage = renderPromotionsPage;
window.redeemPromo = redeemPromo;
