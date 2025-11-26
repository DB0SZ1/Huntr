/**
 * dash-fixed.js - Dashboard initialization with response parser
 * Replaces problematic sections in dash.js
 */

// ==================== ACTIVITY LOADING WITH PARSER ====================

async function loadRecentActivity() {
    console.log('📊 Loading recent activity...');
    
    const activityList = document.querySelector('.activity-list');
    if (!activityList) {
        console.warn('Activity list container not found');
        return;
    }

    try {
        const response = await API.getRecentActivity(5);
        console.log('📊 Activity API response:', response);
        
        // Use ResponseParser to safely parse array
        const activities = window.ResponseParser 
            ? window.ResponseParser.parseActivity(response)
            : (Array.isArray(response) ? response : []);
        
        console.log(`✅ Parsed ${activities.length} activities`);
        
        if (activities.length === 0) {
            activityList.innerHTML = `
                <div style="text-align: center; padding: 32px; color: rgba(255, 255, 255, 0.5);">
                    <i class="fas fa-inbox" style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;"></i>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }

        // Clear existing content
        activityList.innerHTML = '';

        // Render activities
        activities.forEach(activity => {
            const timeAgo = window.getTimeAgo 
                ? window.getTimeAgo(new Date(activity.timestamp || activity.created_at))
                : 'Recently';
            
            const icon = getActivityIcon(activity.type || activity.action);
            
            const activityHTML = `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.title || activity.message || 'Activity'}</div>
                        <div class="activity-description">${activity.description || activity.details || ''}</div>
                    </div>
                    <div class="activity-time">${timeAgo}</div>
                </div>
            `;
            
            activityList.insertAdjacentHTML('beforeend', activityHTML);
        });
        
        console.log('✅ Activity list rendered');
        
    } catch (error) {
        console.error('❌ Failed to load activity:', error);
        
        activityList.innerHTML = `
            <div style="text-align: center; padding: 32px; color: rgba(255, 255, 255, 0.5);">
                <i class="fas fa-exclamation-circle" style="font-size: 32px; margin-bottom: 12px; color: #f87171;"></i>
                <p>Failed to load activity</p>
                <button onclick="loadRecentActivity()" style="margin-top: 12px; padding: 8px 16px; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.3); color: #3b82f6; border-radius: 8px; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
    }
}

function getActivityIcon(type) {
    const iconMap = {
        'scan': 'fas fa-search',
        'opportunity': 'fas fa-plus',
        'application': 'fas fa-paper-plane',
        'applied': 'fas fa-paper-plane',
        'notification': 'fas fa-bell',
        'filter': 'fas fa-filter',
        'niche': 'fas fa-bullseye',
        'save': 'fas fa-bookmark',
        'saved': 'fas fa-bookmark'
    };
    
    return iconMap[type] || 'fas fa-circle';
}

// ==================== DASHBOARD STATS LOADING ====================

async function loadDashboardStats() {
    console.log('📊 Loading dashboard stats...');
    
    try {
        const response = await API.getDashboardStats();
        console.log('📊 Stats API response:', response);
        
        // Use ResponseParser for safe extraction
        const stats = window.ResponseParser 
            ? window.ResponseParser.parseStats(response, {
                total_opportunities: 0,
                saved_opportunities: 0,
                monthly_scans: 0,
                active_niches: 0
            })
            : response || {};
        
        console.log('✅ Parsed stats:', stats);
        
        // Update stats cards
        updateStatCard(0, stats.total_opportunities || 0, 'Found this week');
        updateStatCard(1, stats.saved_opportunities || 0, 'Saved this month');
        updateStatCard(2, stats.monthly_scans || 0, 'Made this month');
        
        // Update total scans specifically
        const totalScansValue = document.getElementById('totalScansValue');
        if (totalScansValue) {
            totalScansValue.textContent = stats.monthly_scans || 0;
        }
        
        console.log('✅ Dashboard stats updated');
        
    } catch (error) {
        console.error('❌ Failed to load dashboard stats:', error);
        // Keep default values on error
    }
}

function updateStatCard(index, value, description) {
    const statsCards = document.querySelectorAll('.stats-card');
    if (statsCards[index]) {
        const valueEl = statsCards[index].querySelector('.stats-value');
        const descEl = statsCards[index].querySelector('.stats-description');
        
        if (valueEl) valueEl.textContent = value;
        if (descEl) descEl.textContent = description;
    }
}

// ==================== CREDITS LOADING ====================

async function loadUserCredits() {
    console.log('💰 Loading user credits...');
    
    const creditsDisplay = document.getElementById('creditsValue');
    if (!creditsDisplay) return;

    try {
        const response = await API.getCredits();
        console.log('💰 Credits API response:', response);
        
        // Extract credits from various possible response formats
        let credits = 0;
        
        if (window.ResponseParser) {
            credits = window.ResponseParser.extractNumber(
                response, 
                ['balance', 'credits', 'remaining', 'available'], 
                0
            );
        } else {
            credits = response?.balance ?? response?.credits ?? 0;
        }
        
        console.log('✅ User credits:', credits);
        
        creditsDisplay.textContent = credits;
        
    } catch (error) {
        console.error('❌ Failed to load credits:', error);
        creditsDisplay.textContent = '--';
    }
}

// ==================== USER INFO LOADING ====================

async function loadUserInfo() {
    console.log('👤 Loading user info...');
    
    try {
        const user = await API.getCurrentUser();
        console.log('👤 User data:', user);
        
        // Update user display
        const userName = document.querySelector('.user-name');
        const userEmail = document.querySelector('.user-email');
        const userAvatar = document.querySelector('.user-avatar');
        
        if (userName) userName.textContent = user.name || 'User';
        if (userEmail) userEmail.textContent = user.email || '';
        
        if (userAvatar && user.picture) {
            userAvatar.style.backgroundImage = `url(${user.picture})`;
            userAvatar.style.backgroundSize = 'cover';
            userAvatar.style.backgroundPosition = 'center';
        } else if (userAvatar) {
            // Show initials
            const initials = (user.name || 'U').charAt(0).toUpperCase();
            userAvatar.textContent = initials;
            userAvatar.style.display = 'flex';
            userAvatar.style.alignItems = 'center';
            userAvatar.style.justifyContent = 'center';
            userAvatar.style.fontSize = '18px';
            userAvatar.style.fontWeight = '600';
        }
        
        // Update upgrade button
        updateUpgradeButton(user.tier);
        
        console.log('✅ User info loaded');
        
    } catch (error) {
        console.error('❌ Failed to load user info:', error);
    }
}

function updateUpgradeButton(tier) {
    const upgradeBtn = document.getElementById('upgradeBtn');
    const upgradeBtnText = document.getElementById('upgradeBtnText');
    
    if (!upgradeBtn || !upgradeBtnText) return;
    
    if (tier === 'premium') {
        upgradeBtnText.innerHTML = '<i class="fas fa-crown"></i> Premium Member';
        upgradeBtn.style.background = 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(168, 85, 247, 0.2))';
        upgradeBtn.style.border = '1px solid rgba(168, 85, 247, 0.4)';
        upgradeBtn.style.color = '#a855f7';
        upgradeBtn.style.cursor = 'default';
    } else if (tier === 'pro') {
        upgradeBtnText.innerHTML = '<i class="fas fa-crown"></i> Pro Member';
        upgradeBtn.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.2))';
        upgradeBtn.style.border = '1px solid rgba(59, 130, 246, 0.4)';
        upgradeBtn.style.color = '#3b82f6';
        upgradeBtn.onclick = () => window.openUpgradeModal?.();
    } else {
        upgradeBtnText.innerHTML = '<i class="fas fa-crown"></i> Upgrade to Pro';
        upgradeBtn.onclick = () => window.openUpgradeModal?.();
    }
}

// ==================== INITIALIZATION ====================

async function initDashboard() {
    console.log('🚀 Initializing dashboard...');
    
    try {
        // Load all data in parallel
        await Promise.all([
            loadUserInfo(),
            loadUserCredits(),
            loadDashboardStats(),
            loadRecentActivity()
        ]);
        
        console.log('✅ Dashboard initialized successfully');
        
    } catch (error) {
        console.error('❌ Dashboard initialization error:', error);
        
        if (window.showToast) {
            window.showToast('Failed to load dashboard data', 'error');
        }
    }
}

// ==================== EXPORT FUNCTIONS ====================

window.loadRecentActivity = loadRecentActivity;
window.loadDashboardStats = loadDashboardStats;
window.loadUserCredits = loadUserCredits;
window.loadUserInfo = loadUserInfo;
window.initDashboard = initDashboard;

// ==================== AUTO-INITIALIZE ====================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}

console.log('✅ Dashboard fixed script loaded');