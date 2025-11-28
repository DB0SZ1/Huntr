/**
 * complaints.page.js - Complaints & Support page
 */

function renderComplaintsPage() {
    const mainContent = document.querySelector('.dashboard-content');
    mainContent.innerHTML = `
        <div class="page-header" style="margin-bottom: 32px;">
            <h2 class="page-title">Complaints & Support</h2>
            <p style="color: rgba(255, 255, 255, 0.6);">Join our community WhatsApp group for direct support</p>
        </div>

        <div class="glass-card" style="max-width: 600px; margin: 0 auto; text-align: center; padding: 48px 32px;">
            <div style="font-size: 80px; margin-bottom: 24px; animation: bounce 2s infinite;">
                <i class="fab fa-whatsapp"></i>
            </div>
            
            <h3 style="font-size: 28px; font-weight: 800; color: white; margin: 0 0 12px 0;">
                Join Our WhatsApp Community
            </h3>
            
            <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                Have a complaint or need immediate support? Join our active WhatsApp community group where you can:
            </p>
            
            <ul style="list-style: none; padding: 0; margin: 0 0 32px 0; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto;">
                <li style="padding: 12px 0; color: rgba(255, 255, 255, 0.8); display: flex; align-items: center;">
                    <i class="fas fa-check-circle" style="color: #10b981; margin-right: 12px; font-size: 18px;"></i>
                    Report issues directly
                </li>
                <li style="padding: 12px 0; color: rgba(255, 255, 255, 0.8); display: flex; align-items: center;">
                    <i class="fas fa-check-circle" style="color: #10b981; margin-right: 12px; font-size: 18px;"></i>
                    Get instant responses
                </li>
                <li style="padding: 12px 0; color: rgba(255, 255, 255, 0.8); display: flex; align-items: center;">
                    <i class="fas fa-check-circle" style="color: #10b981; margin-right: 12px; font-size: 18px;"></i>
                    Connect with other users
                </li>
                <li style="padding: 12px 0; color: rgba(255, 255, 255, 0.8); display: flex; align-items: center;">
                    <i class="fas fa-check-circle" style="color: #10b981; margin-right: 12px; font-size: 18px;"></i>
                    Share feedback & suggestions
                </li>
            </ul>
            
            <a href="https://chat.whatsapp.com/JKMq6e8oMAuJ9CZzpTqlSo?mode=hqrt1" target="_blank" rel="noopener noreferrer" 
                style="display: inline-flex; align-items: center; gap: 12px; padding: 16px 32px; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); 
                color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; 
                transition: all 0.3s ease; box-shadow: 0 8px 24px rgba(37, 211, 102, 0.3);"
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 32px rgba(37, 211, 102, 0.4)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 24px rgba(37, 211, 102, 0.3)';">
                <i class="fab fa-whatsapp" style="font-size: 24px;"></i>
                <span>Join WhatsApp Group</span>
            </a>
            
            <p style="color: rgba(255, 255, 255, 0.5); font-size: 13px; margin-top: 24px; margin-bottom: 0;">
                Click the button above to join our WhatsApp community group
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
