/**
 * complaints.page.js - Complaints & Support page
 */

function renderComplaintsPage() {
    const mainContent = document.querySelector('.dashboard-content');
    mainContent.innerHTML = `
        <div class="page-header" style="margin-bottom: clamp(24px, 5vw, 40px);">
            <h2 class="page-title" style="font-size: clamp(22px, 5vw, 32px);">Complaints & Support</h2>
            <p style="color: rgba(255, 255, 255, 0.6); font-size: clamp(12px, 3vw, 15px);">Join our community for direct support</p>
        </div>

        <div class="glass-card" style="max-width: min(100%, 550px); margin: 0 auto; text-align: center; padding: clamp(32px, 8vw, 48px);">
            <div style="font-size: clamp(60px, 12vw, 80px); margin-bottom: clamp(16px, 4vw, 24px); animation: bounce 2s infinite; will-change: transform;">
                <i class="fab fa-whatsapp"></i>
            </div>
            
            <h3 style="font-size: clamp(20px, 5vw, 28px); font-weight: 700; color: white; margin: 0 0 clamp(8px, 2vw, 12px) 0;">
                Join Our WhatsApp Community
            </h3>
            
            <p style="color: rgba(255, 255, 255, 0.7); font-size: clamp(13px, 3.5vw, 16px); line-height: 1.6; margin: 0 0 clamp(20px, 5vw, 32px) 0;">
                Have a complaint or need immediate support? Join our active community.
            </p>
            
            <ul style="list-style: none; padding: 0; margin: 0 0 clamp(24px, 6vw, 32px) 0; text-align: left; max-width: 100%;">
                <li style="padding: clamp(8px, 2vw, 12px) 0; color: rgba(255, 255, 255, 0.8); font-size: clamp(12px, 3vw, 14px); display: flex; align-items: center;">
                    <i class="fas fa-check-circle" style="color: #10b981; margin-right: clamp(8px, 2vw, 12px); font-size: clamp(14px, 3vw, 18px); flex-shrink: 0;"></i>
                    <span>Report issues directly</span>
                </li>
                <li style="padding: clamp(8px, 2vw, 12px) 0; color: rgba(255, 255, 255, 0.8); font-size: clamp(12px, 3vw, 14px); display: flex; align-items: center;">
                    <i class="fas fa-check-circle" style="color: #10b981; margin-right: clamp(8px, 2vw, 12px); font-size: clamp(14px, 3vw, 18px); flex-shrink: 0;"></i>
                    <span>Get instant responses</span>
                </li>
                <li style="padding: clamp(8px, 2vw, 12px) 0; color: rgba(255, 255, 255, 0.8); font-size: clamp(12px, 3vw, 14px); display: flex; align-items: center;">
                    <i class="fas fa-check-circle" style="color: #10b981; margin-right: clamp(8px, 2vw, 12px); font-size: clamp(14px, 3vw, 18px); flex-shrink: 0;"></i>
                    <span>Connect with community</span>
                </li>
            </ul>
            
            <a href="https://chat.whatsapp.com/JKMq6e8oMAuJ9CZzpTqlSo?mode=hqrt1" target="_blank" rel="noopener noreferrer" 
                style="display: inline-flex; align-items: center; gap: clamp(8px, 2vw, 12px); padding: clamp(12px, 3vw, 16px) clamp(24px, 5vw, 32px); background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); 
                color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: clamp(13px, 3vw, 16px); 
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 8px 24px rgba(37, 211, 102, 0.3); will-change: transform;"
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 32px rgba(37, 211, 102, 0.4)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 24px rgba(37, 211, 102, 0.3)';">
                <i class="fab fa-whatsapp" style="font-size: clamp(16px, 4vw, 24px);"></i>
                <span>Join Group</span>
            </a>
            
            <p style="color: rgba(255, 255, 255, 0.5); font-size: clamp(11px, 2.5vw, 13px); margin-top: clamp(16px, 4vw, 24px); margin-bottom: 0;">
                Click to join our WhatsApp community
            </p>
        </div>

        <style>
            @keyframes bounce {
                0%, 100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-10px);
                }
            }
        </style>
    `;
}

window.renderComplaintsPage = renderComplaintsPage;
