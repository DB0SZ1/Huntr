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
        
        <div class="promo-container" style="max-width: min(100%, 500px); margin: 0 auto; padding: clamp(24px, 8vw, 48px) clamp(16px, 4vw, 32px);">
            <div class="promo-card glass-card" style="padding: clamp(32px, 8vw, 48px);">
                <div class="promo-header" style="text-align: center; margin-bottom: clamp(24px, 6vw, 32px);">
                    <div class="promo-icon" style="font-size: clamp(48px, 10vw, 64px); margin-bottom: clamp(12px, 3vw, 16px);">🎉</div>
                    <h1 class="promo-title" style="font-size: clamp(22px, 5vw, 32px); font-weight: 700; color: white; margin: 0 0 clamp(8px, 2vw, 12px) 0;">Claim Your Trial</h1>
                    <p class="promo-subtitle" style="font-size: clamp(13px, 3.5vw, 16px); color: rgba(255, 255, 255, 0.6); margin: 0;">2 weeks of Pro features</p>
                </div>
                
                <div class="promo-offer" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1)); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: clamp(16px, 4vw, 24px); text-align: center; margin-bottom: clamp(24px, 6vw, 32px);">
                    <div class="promo-offer-text" style="font-size: clamp(18px, 4vw, 24px); font-weight: 700; color: #60a5fa; margin-bottom: 4px;">2 Weeks of Pro</div>
                    <div class="promo-offer-detail" style="font-size: clamp(12px, 3vw, 14px); color: rgba(255, 255, 255, 0.6);">Courtesy of DB0SZ1</div>
                </div>
                
                <div id="errorMessage" class="error-message" style="display: none; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: clamp(12px, 3vw, 16px); border-radius: 8px; font-size: clamp(12px, 3vw, 14px); margin-bottom: clamp(16px, 4vw, 24px); text-align: center;"></div>
                <div id="successMessage" class="success-message" style="display: none; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; padding: clamp(12px, 3vw, 16px); border-radius: 8px; font-size: clamp(12px, 3vw, 14px); margin-bottom: clamp(16px, 4vw, 24px); text-align: center;"></div>
                
                <form id="promoForm" onsubmit="redeemPromo(event)" style="display: flex; flex-direction: column; gap: clamp(16px, 4vw, 24px);">
                    <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
                        <label class="form-label" style="font-size: clamp(13px, 3vw, 14px); font-weight: 600; color: rgba(255, 255, 255, 0.8);">Twitter Handle</label>
                        <input type="text" id="twitterHandle" class="form-input" placeholder="@username" required style="
                            padding: clamp(10px, 2.5vw, 14px) clamp(12px, 3vw, 16px);
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            border-radius: 8px;
                            color: white;
                            font-size: clamp(13px, 3vw, 15px);
                            transition: all 0.3s;
                        " onfocus="this.style.background='rgba(255, 255, 255, 0.08)'; this.style.borderColor='rgba(59, 130, 246, 0.3)';" onblur="this.style.background='rgba(255, 255, 255, 0.05)'; this.style.borderColor='rgba(255, 255, 255, 0.1)';">
                        <small style="color: rgba(255, 255, 255, 0.5); font-size: clamp(11px, 2.5vw, 12px);">The Twitter handle you signed up with</small>
                    </div>
                    
                    <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
                        <label class="form-label" style="font-size: clamp(13px, 3vw, 14px); font-weight: 600; color: rgba(255, 255, 255, 0.8);">Phone Number</label>
                        <input type="tel" id="phoneNumber" class="form-input" placeholder="+1-415-555-0123" required style="
                            padding: clamp(10px, 2.5vw, 14px) clamp(12px, 3vw, 16px);
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            border-radius: 8px;
                            color: white;
                            font-size: clamp(13px, 3vw, 15px);
                            transition: all 0.3s;
                        " onfocus="this.style.background='rgba(255, 255, 255, 0.08)'; this.style.borderColor='rgba(59, 130, 246, 0.3)';" onblur="this.style.background='rgba(255, 255, 255, 0.05)'; this.style.borderColor='rgba(255, 255, 255, 0.1)';">
                        <small style="color: rgba(255, 255, 255, 0.5); font-size: clamp(11px, 2.5vw, 12px);">The phone number used for registration</small>
                    </div>
                    
                    <button type="submit" id="redeemBtn" style="
                        padding: clamp(12px, 3vw, 16px) clamp(24px, 5vw, 32px);
                        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                        border: 1px solid rgba(59, 130, 246, 0.5);
                        border-radius: 8px;
                        color: white;
                        font-size: clamp(14px, 3.5vw, 16px);
                        font-weight: 700;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        margin-top: clamp(8px, 2vw, 12px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        min-height: 48px;
                        will-change: transform;
                    " 
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 32px rgba(59, 130, 246, 0.3)';" 
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 24px rgba(59, 130, 246, 0.2)';">
                        <span>Claim Trial</span>
                    </button>
                </form>
                
                <div style="text-align: center; margin-top: clamp(20px, 5vw, 32px); padding-top: clamp(16px, 4vw, 24px); border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: clamp(12px, 3vw, 14px); margin: 0;">
                        Already have a trial? <a href="javascript:navigateToPage('dashboard')" style="color: #60a5fa; text-decoration: none; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.opacity='0.8';" onmouseout="this.style.opacity='1';">Back to Dashboard</a>
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

        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
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
    redeemBtn.innerHTML = '<i class="fas fa-spinner" style="animation: spin 1s linear infinite;"></i><span>Processing...</span>';
    
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
