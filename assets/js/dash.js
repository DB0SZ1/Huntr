/**
 * Dashboard JavaScript - FIXED
 * Added modal for "No niches" error with redirect to Niches page
 */

// Check authentication on page load
if (!requireAuth()) {
    throw new Error('Not authenticated');
}

// Global state
let currentUser = null;
let activeScanId = null;
let scanPollInterval = null;
let creditsPollInterval = null;

// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const upgradeBtn = document.getElementById('upgradeBtn');
const startScanBtn = document.getElementById('startScanBtn');
const stopScanBtn = document.getElementById('stopScanBtn');
const scannerIdle = document.getElementById('scannerIdle');
const scannerActive = document.getElementById('scannerActive');
const scanLog = document.getElementById('scanLog');

// Initialize Dashboard
async function initDashboard() {
    try {
        currentUser = await API.getCurrentUser();
        window.currentUserTier = currentUser.tier;
        
        updateUserProfile(currentUser);
        updateUpgradeButton(currentUser.tier);
        await loadCreditsDisplay();
        
        await loadDashboardStats();
        await loadRecentActivity();
        await loadTopKeywords();
        
        setupEventListeners();
        
    } catch (error) {
        console.error('Dashboard initialization failed:', error);
        handleAPIError(error, 'Failed to load dashboard');
    }
}

if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        mainContent.classList.toggle('expanded');
    });
}

// Close sidebar when clicking nav items on mobile
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    // OLD CODE DISABLED - Navigation now handled by pages.core.js via event delegation
    // The new system uses data-page attributes and event delegation
    // This old code is no longer needed
    /*
    item.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
            sidebar.classList.add('hidden');
            mainContent.classList.add('expanded');
            sidebarOverlay.classList.remove('active');
        }
    });
    */
});

// Update User Profile Display
function updateUserProfile(user) {
    const userAvatars = document.querySelectorAll('.user-avatar, .header-profile');
    userAvatars.forEach(avatar => {
        if (user.profile_picture) {
            avatar.style.backgroundImage = `url(${user.profile_picture})`;
        } else {
            const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2);
            avatar.textContent = initials;
        }
    });
    
    const userName = document.querySelector('.user-name');
    if (userName) userName.textContent = user.name;
    
    const userEmail = document.querySelector('.user-email');
    if (userEmail) userEmail.textContent = user.email;
}

// Load Dashboard Statistics
async function loadDashboardStats() {
    try {
        const stats = await API.getDashboardStats();
        
        // Map API response fields correctly
        const totalOpportunities = stats.total_opportunities || 0;
        const savedOpportunities = stats.saved_opportunities || stats.applications_sent || stats.total_opportunities || 0;
        const averageConfidence = stats.average_confidence || stats.match_rate || 0;
        const monthlyScans = stats.monthly_scans || 0;
        
        updateStatCard(0, totalOpportunities, 'Found this week');
        updateStatCard(1, savedOpportunities, 'Saved this month');
        updateStatCard(2, monthlyScans, `${monthlyScans === 1 ? 'Scan' : 'Scans'} this month`);
        
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Update Individual Stat Card
function updateStatCard(index, value, description) {
    const cards = document.querySelectorAll('.stats-card');
    if (cards[index]) {
        const valueEl = cards[index].querySelector('.stats-value');
        const descEl = cards[index].querySelector('.stats-description');
        
        if (valueEl) valueEl.textContent = value;
        if (descEl) descEl.textContent = description;
    }
}

// Load Recent Activity
async function loadRecentActivity() {
    try {
        const data = await API.getRecentActivity(5);
        const activityList = document.querySelector('.activity-list');
        
        if (!activityList) return;
        
        activityList.innerHTML = '';
        
        // Handle both array response and object with activities property
        const activities = Array.isArray(data) ? data : (data?.activities || []);
        
        if (activities.length === 0) {
            activityList.innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.5); padding: 20px;">No recent activity</p>';
            return;
        }
        
        activities.forEach(activity => {
            const item = createActivityItem(activity);
            activityList.appendChild(item);
        });
        
    } catch (error) {
        console.error('Failed to load activity:', error);
    }
}

// Create Activity Item Element
function createActivityItem(activity) {
    const div = document.createElement('div');
    div.className = 'activity-item';
    
    let icon, title, description;
    
    switch (activity.type) {
        case 'opportunity_found':
            icon = 'fa-plus';
            title = 'New opportunity found';
            description = activity.title;
            break;
        case 'application_sent':
            icon = 'fa-paper-plane';
            title = 'Application sent';
            description = activity.title;
            break;
        case 'scan_completed':
            icon = 'fa-search';
            title = 'Scan completed';
            description = `${activity.opportunities_found} opportunities`;
            break;
        default:
            icon = 'fa-info';
            title = 'Activity';
            description = '';
    }
    
    const timeAgo = getTimeAgo(new Date(activity.timestamp));
    
    div.innerHTML = `
        <div class="activity-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="activity-content">
            <div class="activity-title">${title}</div>
            <div class="activity-description">${description}</div>
        </div>
        <div class="activity-time">${timeAgo}</div>
    `;
    
    return div;
}

// Load Top Keywords
async function loadTopKeywords() {
    try {
        const data = await API.getTopKeywords();
        const keywordsContainer = document.querySelector('.full-width');
        
        if (!keywordsContainer || !data.top_keywords) return;
        
        const grid = keywordsContainer.querySelector('[style*="grid"]');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        data.top_keywords.slice(0, 5).forEach(keyword => {
            const card = document.createElement('div');
            card.style.cssText = 'padding: 20px; background: rgba(255, 255, 255, 0.04); border-radius: 12px; text-align: center;';
            card.innerHTML = `
                <div style="font-size: 32px; font-weight: 800; font-family: 'Poppins', sans-serif; margin-bottom: 8px;">
                    ${keyword.total_matches}
                </div>
                <div style="font-size: 14px; color: rgba(255, 255, 255, 0.6);">
                    ${keyword.niche_name}
                </div>
            `;
            grid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Failed to load keywords:', error);
    }
}

// Show "No Niches" Modal
function showNoNichesModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('noNichesModal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'noNichesModal';
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.style.zIndex = '11000';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <div style="font-size: 64px; margin-bottom: 24px;">🎯</div>
            <h2 class="modal-title">No Niches Configured</h2>
            <p class="modal-subtitle" style="margin-bottom: 32px;">
                You need to create at least one niche before starting a scan. 
                Niches help us find opportunities that match your interests and skills.
            </p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <button onclick="closeNoNichesModal()" class="btn-secondary">
                    Cancel
                </button>
                <button onclick="goToNichesPage()" class="btn-primary">
                    <i class="fas fa-plus"></i> Create Niche
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeNoNichesModal();
        }
    });
}

// Close No Niches Modal
function closeNoNichesModal() {
    const modal = document.getElementById('noNichesModal');
    if (modal) modal.remove();
}

// Go to Niches Page
function goToNichesPage() {
    closeNoNichesModal();
    // Use the navigateToPage function from pages.js
    if (window.navigateToPage) {
        window.navigateToPage('niches');
    } else {
        // Fallback: manually click the niches nav item
        const nichesNavItem = document.querySelectorAll('.nav-item')[3];
        if (nichesNavItem) nichesNavItem.click();
    }
}

// Show Insufficient Credits Modal
function showInsufficientCreditsModal(error) {
    console.log('🔴 showInsufficientCreditsModal called with error:', error);
    
    // Remove existing modal if any
    const existingModal = document.getElementById('insufficientCreditsModal');
    if (existingModal) existingModal.remove();
    
    // Extract error data with safe fallbacks
    const creditsNeeded = error.credits_needed || 5;
    const creditsAvailable = error.credits_available || 0;
    const creditsPerDay = error.credits_per_day || 50;
    const nextRefillHours = error.next_refill_in_hours || 0;
    
    console.log('📊 Extracted credits data:', { creditsNeeded, creditsAvailable, creditsPerDay, nextRefillHours });
    
    // Format refill time
    let refillTimeText = '';
    if (nextRefillHours > 0) {
        if (nextRefillHours >= 24) {
            const days = Math.ceil(nextRefillHours / 24);
            refillTimeText = `${days} day${days > 1 ? 's' : ''}`;
        } else {
            refillTimeText = `${Math.round(nextRefillHours)} hour${nextRefillHours > 1 ? 's' : ''}`;
        }
    }
    
    const modal = document.createElement('div');
    modal.id = 'insufficientCreditsModal';
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.style.zIndex = '11000';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <div style="font-size: 64px; margin-bottom: 24px;">💳</div>
            <h2 class="modal-title">Insufficient Credits</h2>
            <p class="modal-subtitle" style="margin-bottom: 32px;">
                You don't have enough credits to start this scan.
            </p>
            
            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: left;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div>
                        <p style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-bottom: 8px;">Credits Needed</p>
                        <p style="font-size: 20px; font-weight: bold; color: #ff6b6b;">${creditsNeeded}</p>
                    </div>
                    <div>
                        <p style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-bottom: 8px;">Credits Available</p>
                        <p style="font-size: 20px; font-weight: bold; color: rgba(255, 255, 255, 0.8);">${creditsAvailable}</p>
                    </div>
                </div>
                
                <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 16px;">
                    <p style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-bottom: 8px;">Daily Limit</p>
                    <p style="font-size: 14px; color: rgba(255, 255, 255, 0.9);">${creditsPerDay} credits/day</p>
                    ${refillTimeText ? `<p style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-top: 8px;">Next refill in <strong>${refillTimeText}</strong></p>` : ''}
                </div>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="closeInsufficientCreditsModal()" class="btn-secondary" style="flex: 1; max-width: 150px;">
                    Cancel
                </button>
                <button onclick="goToUpgradePage()" class="btn-primary" style="flex: 1; max-width: 200px;">
                    <i class="fas fa-star"></i> Upgrade Now
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    console.log('✅ Modal appended to DOM:', modal);
    console.log('🎨 Modal display style:', modal.style.display);
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeInsufficientCreditsModal();
        }
    });
}

// Close Insufficient Credits Modal
function closeInsufficientCreditsModal() {
    const modal = document.getElementById('insufficientCreditsModal');
    if (modal) modal.remove();
}

// Go to Upgrade Page
function goToUpgradePage() {
    closeInsufficientCreditsModal();
    // Navigate to settings or upgrade page
    if (window.navigateToPage) {
        window.navigateToPage('settings');
    } else {
        // Fallback: manually navigate or open settings
        const settingsNavItem = document.querySelectorAll('.nav-item')[6];
        if (settingsNavItem) settingsNavItem.click();
    }
}

// Global scan tracking
let scanStartTime = null;
let scanDurationInterval = null;

// Mock platform names for fake logs
const mockPlatforms = [
    'Twitter/X', 'LinkedIn', 'Reddit', 'Telegram', 'Discord',
    'Facebook Groups', 'Slack Communities', 'GitHub Issues',
    'Medium', 'Dev.to', 'Hashnode', 'Freelancer', 'Upwork'
];

// Scanner Functionality - FIXED
async function startScanning() {
    try {
        // Reset scan tracking
        scanStartTime = null;
        
        // Start scan
        const response = await API.startScan();
        activeScanId = response.scan_id;
        
        // Record scan start time
        scanStartTime = Date.now();
        
        // Show scanning UI
        scannerIdle.style.display = 'none';
        scannerActive.style.display = 'block';
        scanLog.innerHTML = '';
        
        // Add initial log
        addScanMessage('🚀 Scan started - initializing platforms...', 'info');
        
        // Add mock logs while waiting for first response
        let mockLogIndex = 0;
        const mockLogInterval = setInterval(() => {
            if (!activeScanId) {
                clearInterval(mockLogInterval);
                return;
            }
            
            const platform = mockPlatforms[mockLogIndex % mockPlatforms.length];
            addScanMessage(`📡 Connecting to ${platform}...`, 'scanning');
            mockLogIndex++;
            
            // Stop mock logs after 5 attempts or if we get real data
            if (mockLogIndex > 5) {
                clearInterval(mockLogInterval);
            }
        }, 1500);
        
        // Start time update display
        scanDurationInterval = setInterval(() => {
            if (scanStartTime) {
                const elapsed = Math.floor((Date.now() - scanStartTime) / 1000);
                const timeDisplay = document.getElementById('scanTimeDisplay');
                if (timeDisplay) {
                    const mins = Math.floor(elapsed / 60);
                    const secs = elapsed % 60;
                    timeDisplay.textContent = `${mins}m ${secs}s`;
                }
            }
        }, 1000);
        
        // Start polling for status
        scanPollInterval = setInterval(() => pollScanStatus(), 2000);
        
    } catch (error) {
        console.error('Failed to start scan:', error);
        console.log('Error object:', error);
        console.log('error.error:', error.error);
        console.log('error.message:', error.message);
        console.log('error.detail:', error.detail);
        
        // Check if error is about insufficient credits
        if (error.error === 'insufficient_credits' || (error.message && error.message.includes('insufficient_credits'))) {
            console.log('🔴 CAUGHT: Insufficient credits error - showing modal');
            showInsufficientCreditsModal(error);
        } 
        // Check if error is about no niches (checks message, detail, and full text)
        else if ((error.message && error.message.toLowerCase().includes('niche')) || 
                 (error.detail && error.detail.toLowerCase().includes('niche'))) {
            console.log('🔴 CAUGHT: No niches error - showing modal');
            showNoNichesModal();
        } else {
            console.log('🔴 CAUGHT: Generic error - handling');
            handleAPIError(error, 'Failed to start scan');
        }
        
        stopScanning();
    }
}

async function pollScanStatus() {
    if (!activeScanId) return;
    
    try {
        const status = await API.getScanStatus(activeScanId);
        
        const progressFill = document.getElementById('scanProgressFill');
        const progressPercent = document.getElementById('scanPercentage');
        
        // Handle undefined progress with default value
        const progress = status.progress !== undefined ? status.progress : 0;
        
        if (progressFill) progressFill.style.width = progress + '%';
        if (progressPercent) progressPercent.textContent = progress + '%';
        
        if (status.current_platform) {
            addScanMessage(`📡 Scanning ${status.current_platform}...`, 'scanning');
        }
        
        if (status.status === 'completed') {
            clearInterval(scanPollInterval);
            scanPollInterval = null;
            if (scanDurationInterval) {
                clearInterval(scanDurationInterval);
                scanDurationInterval = null;
            }
            
            // Calculate actual scan duration
            const scanDuration = scanStartTime ? Math.floor((Date.now() - scanStartTime) / 1000) : status.duration_seconds;
            
            addScanMessage(`✅ Scan completed! Found ${status.opportunities_found} opportunities`, 'success');
            
            document.getElementById('scanSummary').style.display = 'flex';
            document.getElementById('totalOpportunities').textContent = status.opportunities_found;
            document.getElementById('scanTime').textContent = scanDuration + 's';
            
            // Update real-time balance after scan completes
            await updateRealtimeBalance();
            
            await loadDashboardStats();
            await loadRecentActivity();
        } else if (status.status === 'error') {
            clearInterval(scanPollInterval);
            scanPollInterval = null;
            if (scanDurationInterval) {
                clearInterval(scanDurationInterval);
                scanDurationInterval = null;
            }
            addScanMessage('❌ Scan failed: ' + status.error, 'error');
        }
        
    } catch (error) {
        console.error('Failed to poll scan status:', error);
        stopScanning();
    }
}

function stopScanning() {
    if (scanPollInterval) {
        clearInterval(scanPollInterval);
        scanPollInterval = null;
    }
    if (scanDurationInterval) {
        clearInterval(scanDurationInterval);
        scanDurationInterval = null;
    }
    
    activeScanId = null;
    scanStartTime = null;
    scannerActive.style.display = 'none';
    scannerIdle.style.display = 'block';
}

function addScanMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `scan-message ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'scanning') icon = 'fa-spinner fa-spin';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    
    messageDiv.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    scanLog.appendChild(messageDiv);
    scanLog.scrollTop = scanLog.scrollHeight;
}

// Update Upgrade Button
function updateUpgradeButton(tier) {
    const upgradeBtnText = document.getElementById('upgradeBtnText');
    
    if (tier === 'free') {
        upgradeBtnText.textContent = 'Upgrade to Pro';
        upgradeBtn.onclick = () => {
            document.getElementById('upgradeModal').classList.add('active');
        };
    } else if (tier === 'pro') {
        upgradeBtnText.textContent = 'PRO Member';
        upgradeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        upgradeBtn.style.cursor = 'default';
        upgradeBtn.onclick = null;
    } else if (tier === 'premium') {
        upgradeBtnText.textContent = 'PREMIUM Member';
        upgradeBtn.style.background = 'rgba(255, 255, 255, 0.25)';
        upgradeBtn.style.cursor = 'default';
        upgradeBtn.onclick = null;
    }
}

// Setup Event Listeners
function setupEventListeners() {
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('visible');
            sidebar.classList.toggle('hidden');
            mainContent.classList.toggle('expanded');
        });
    }

    // Close sidebar when clicking outside
    if (sidebar && menuToggle) {
        document.addEventListener('click', (e) => {
            if (sidebar?.classList.contains('visible')) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar?.classList.remove('visible');
                    sidebar?.classList.add('hidden');
                    mainContent?.classList.add('expanded');
                }
            }
        });
    }

    startScanBtn.addEventListener('click', startScanning);
    stopScanBtn.addEventListener('click', stopScanning);

    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            document.getElementById('upgradeModal').classList.remove('active');
        });
    }

    initSidebar();
}

// Helper: Time Ago
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
}

// Initialize sidebar state
function initSidebar() {
    if (window.innerWidth <= 1024) {
        sidebar.classList.add('hidden');
        sidebar.classList.remove('visible');
    } else {
        sidebar.classList.remove('hidden');
        sidebar.classList.add('visible');
    }
}

// Responsive sidebar
window.addEventListener('resize', initSidebar);

// Load and Display Credits
async function loadCreditsDisplay() {
    try {
        const creditsResponse = await API.getCredits();
        const creditsValue = document.getElementById('creditsValue');
        if (creditsValue) {
            // Extract current_credits from API response
            // API returns: {current_credits: 50, daily_credits: 50, tier: 'pro', ...}
            const credits = creditsResponse?.current_credits || creditsResponse?.balance || creditsResponse?.credits || creditsResponse?.data?.current_credits || creditsResponse?.data?.balance || 0;
            creditsValue.textContent = credits.toString();
        }
        
        // Start real-time balance polling
        startRealtimeBalancePolling();
        
    } catch (error) {
        console.error('Failed to load credits:', error);
        const creditsValue = document.getElementById('creditsValue');
        if (creditsValue) creditsValue.textContent = 'Error';
    }
}

// Real-time Balance Update Functions
async function updateRealtimeBalance() {
    try {
        console.log('[RealTime Balance] Fetching from API endpoint');
        
        const balance = await API.getRealtimeBalance();
        
        console.log('[RealTime Balance] Response received:', {
            current_credits: balance?.current_credits,
            balance: balance?.balance,
            credits: balance?.credits,
            daily_credits_remaining: balance?.daily_credits_remaining
        });
        
        // Update UI with new balance
        const creditsValue = document.getElementById('creditsValue');
        if (creditsValue) {
            const credits = balance?.current_credits || balance?.balance || balance?.credits || 0;
            creditsValue.textContent = credits.toString();
            console.log('[RealTime Balance] UI updated with:', credits);
        }
        
        // Update any other balance displays on the page
        updateUI(balance);
        
    } catch (error) {
        console.error('[RealTime Balance] Failed to update:', error);
    }
}

// Update UI with balance information
function updateUI(balance) {
    const creditsValue = document.getElementById('creditsValue');
    if (creditsValue) {
        const credits = balance?.current_credits || balance?.balance || balance?.credits || 0;
        creditsValue.textContent = credits.toString();
    }
    
    // Update daily credits display if it exists
    const dailyCreditsElement = document.querySelector('[data-credits="daily"]');
    if (dailyCreditsElement && balance?.daily_credits_remaining) {
        dailyCreditsElement.textContent = balance.daily_credits_remaining;
    }
    
    // Update used today if it exists
    const usedTodayElement = document.querySelector('[data-credits="used-today"]');
    if (usedTodayElement && balance?.credits_used_today) {
        usedTodayElement.textContent = balance.credits_used_today;
    }
}

// Start polling for real-time balance updates every 3 minutes
function startRealtimeBalancePolling() {
    // Clear existing interval if any
    if (creditsPollInterval) {
        clearInterval(creditsPollInterval);
        console.log('[RealTime Balance] Cleared existing polling interval');
    }
    
    // Poll every 3 minutes
    console.log('[RealTime Balance] Starting polling every 3 minutes (180000ms)');
    creditsPollInterval = setInterval(async () => {
        console.log('[RealTime Balance] Polling interval triggered');
        await updateRealtimeBalance();
    }, 3 * 60 * 1000);
}

// Stop polling for real-time balance updates
function stopRealtimeBalancePolling() {
    if (creditsPollInterval) {
        clearInterval(creditsPollInterval);
        creditsPollInterval = null;
    }
}

// Show Credits Information Modal
async function showCreditsInfo() {
    try {
        const summary = await API.getCreditsSummary();
        const history = await API.getCreditsHistory(10);
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 12000;
            padding: 20px;
            box-sizing: border-box;
            backdrop-filter: blur(8px);
        `;
        
        const summaryData = summary.data || summary;
        
        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, rgba(16, 20, 36, 0.95) 0%, rgba(25, 30, 48, 0.95) 100%);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                padding: 40px;
                max-width: 600px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(20px);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                    <h2 style="color: #FFFFFF; font-size: 28px; font-weight: 800; margin: 0;">Credits Summary</h2>
                    <button onclick="this.closest('[style*=\'fixed\']').remove()" style="
                        background: none;
                        border: none;
                        color: rgba(255, 255, 255, 0.6);
                        font-size: 24px;
                        cursor: pointer;
                    "><i class="fas fa-times"></i></button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px;">
                    <div style="padding: 20px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px;">
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-bottom: 8px;">Daily Credits</div>
                        <div style="color: #3B82F6; font-size: 24px; font-weight: 800;">${summaryData.daily_credits_remaining || 0}</div>
                    </div>
                    <div style="padding: 20px; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px;">
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-bottom: 8px;">Used Today</div>
                        <div style="color: #fbbf24; font-size: 24px; font-weight: 800;">${summaryData.credits_used_today || 0}</div>
                    </div>
                </div>
                
                ${summaryData.scans_today !== undefined ? `
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 32px;">
                    <div style="text-align: center; padding: 16px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 11px; margin-bottom: 6px;">Scans</div>
                        <div style="color: #FFFFFF; font-size: 18px; font-weight: 700;">${summaryData.scans_today}/${summaryData.max_scans_today}</div>
                    </div>
                </div>
                ` : ''}
                
                <div style="margin-bottom: 24px;">
                    <h3 style="color: #FFFFFF; font-size: 16px; font-weight: 700; margin-bottom: 16px;">Recent Activity</h3>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${(history.data?.entries || history.entries || []).slice(0, 5).map(entry => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                                <div>
                                    <div style="color: #FFFFFF; font-size: 13px; font-weight: 600;">${entry.action}</div>
                                    <div style="color: rgba(255, 255, 255, 0.5); font-size: 11px;">${new Date(entry.timestamp).toLocaleString()}</div>
                                </div>
                                <div style="color: #ef4444; font-weight: 700;">-${entry.credits_deducted}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <button onclick="this.closest('[style*=\'fixed\']').remove(); openUpgradeModal();" style="
                    width: 100%;
                    padding: 14px 20px;
                    background: linear-gradient(135deg, #333333 0%, #1a1a1a 100%);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 15px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
                "><i class="fas fa-crown"></i> Upgrade for More Credits</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    } catch (error) {
        console.error('Failed to show credits info:', error);
        alert('Failed to load credits information');
    }
}

// Initialize dashboard on page load
window.addEventListener('load', initDashboard);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (scanPollInterval) {
        clearInterval(scanPollInterval);
    }
    if (creditsPollInterval) {
        clearInterval(creditsPollInterval);
    }
});

// Export functions
window.closeNoNichesModal = closeNoNichesModal;
window.showCreditsInfo = showCreditsInfo;
window.goToNichesPage = goToNichesPage;
window.updateRealtimeBalance = updateRealtimeBalance;
window.startRealtimeBalancePolling = startRealtimeBalancePolling;
window.stopRealtimeBalancePolling = stopRealtimeBalancePolling;
window.updateUI = updateUI;
window.showInsufficientCreditsModal = showInsufficientCreditsModal;
window.closeInsufficientCreditsModal = closeInsufficientCreditsModal;
window.goToUpgradePage = goToUpgradePage;