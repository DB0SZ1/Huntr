/**
 * pages.core.js - Core navigation and utility system
 * Central hub for page management, toasts, modals, and helpers
 */

// ========================= GLOBAL STATE =========================
let currentPage = 'dashboard';
let currentOpportunityData = null;

// ========================= TOAST NOTIFICATION SYSTEM =========================
/**
 * Display a toast notification
 * @param {string} message - The toast message
 * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Auto-dismiss duration in ms (default: 4000)
 */
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const colors = {
        success: { bg: 'rgba(16, 185, 129, 0.95)', border: '#10b981' },
        error: { bg: 'rgba(248, 113, 113, 0.95)', border: '#f87171' },
        warning: { bg: 'rgba(251, 191, 36, 0.95)', border: '#fbbf24' },
        info: { bg: 'rgba(59, 130, 246, 0.95)', border: '#3b82f6' }
    };
    
    const color = colors[type] || colors.info;
    const icon = icons[type] || icons.info;
    
    toast.style.cssText = `
        background: ${color.bg};
        border-left: 4px solid ${color.border};
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 500;
        animation: slideInRight 0.3s ease-out, fadeOut 0.3s ease-out ${duration - 300}ms forwards;
        cursor: pointer;
        backdrop-filter: blur(10px);
        max-width: 100%;
        word-wrap: break-word;
    `;
    
    toast.innerHTML = `
        <i class="fas ${icon}" style="font-size: 18px; flex-shrink: 0;"></i>
        <span style="flex: 1;">${message}</span>
        <i class="fas fa-times" style="font-size: 14px; opacity: 0.7; flex-shrink: 0;"></i>
    `;
    
    toast.onclick = () => toast.remove();
    container.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, duration);
}

// Add CSS animations for toasts
if (!document.getElementById('toastAnimations')) {
    const style = document.createElement('style');
    style.id = 'toastAnimations';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
            to { opacity: 0; transform: translateX(20px); }
        }
    `;
    document.head.appendChild(style);
}

window.showToast = showToast;

// ========================= TIER MODAL SYSTEM =========================
/**
 * Show tier restriction modal for premium features
 * @param {string} featureName - Name of the locked feature
 * @param {string} requiredTier - Required tier: 'pro' or 'premium'
 */
function showTierModal(featureName, requiredTier = 'pro') {
    const tierNames = { pro: 'Pro', premium: 'Premium' };
    const tierName = tierNames[requiredTier] || 'Pro';
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'tierModal';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <button class="modal-close" onclick="document.getElementById('tierModal').remove()">
                <i class="fas fa-times"></i>
            </button>
            
            <div style="font-size: 64px; margin-bottom: 20px;">🔒</div>
            <h2 class="modal-title">${featureName} Locked</h2>
            <p class="modal-subtitle" style="margin-bottom: 32px;">
                This feature requires ${tierName} tier or higher. Upgrade now to unlock full access.
            </p>
            
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="document.getElementById('tierModal').remove()" style="
                    padding: 12px 24px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: rgba(255, 255, 255, 0.7);
                    cursor: pointer;
                    font-size: 15px;
                    font-weight: 600;
                ">
                    Maybe Later
                </button>
                <button onclick="document.getElementById('tierModal').remove(); openUpgradeModal();" style="
                    padding: 12px 32px;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.2));
                    border: 1px solid rgba(59, 130, 246, 0.4);
                    border-radius: 12px;
                    color: #3b82f6;
                    cursor: pointer;
                    font-size: 15px;
                    font-weight: 600;
                ">
                    <i class="fas fa-crown"></i> Upgrade to ${tierName}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

window.showTierModal = showTierModal;

// ========================= UTILITY FUNCTIONS =========================
/**
 * Get human-readable time difference from date
 */
function getTimeAgo(date) {
    if (!date || isNaN(date.getTime())) {
        return 'Recently';
    }
    
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' year' + (interval > 1.5 ? 's' : '') + ' ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' month' + (interval > 1.5 ? 's' : '') + ' ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' day' + (interval > 1.5 ? 's' : '') + ' ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hour' + (interval > 1.5 ? 's' : '') + ' ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minute' + (interval > 1.5 ? 's' : '') + ' ago';
    
    return Math.floor(seconds) + ' second' + (seconds > 1 ? 's' : '') + ' ago';
}

window.getTimeAgo = getTimeAgo;

// ========================= NAVIGATION SYSTEM =========================
/**
 * Navigate to a page and render its content
 * @param {string} pageName - Page to navigate to
 */
function navigateToPage(pageName) {
    console.log(`🔄 Navigating to page: ${pageName}`);
    
    const mainContent = document.querySelector('.dashboard-content');
    if (!mainContent) {
        console.error('❌ Dashboard content container not found');
        return;
    }
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Mark the correct nav item as active using data-page attribute
    const activeNavItem = document.querySelector(`.nav-item[data-page="${pageName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    currentPage = pageName;

    // Convert kebab-case to camelCase for function names
    let functionName = '';
    let scriptFile = '';
    
    switch(pageName) {
        case 'dashboard':
            functionName = 'renderDashboardPage';
            scriptFile = 'assets/js/pages/dashboard.page.js';
            break;
        case 'opportunities':
            functionName = 'renderOpportunitiesPage';
            scriptFile = 'assets/js/pages/opportunities.page.js';
            break;
        case 'topgigs':
            functionName = 'renderTopGigsPage';
            scriptFile = 'assets/js/pages/topgigs.page.js';
            break;
        case 'cv-analysis':
            functionName = 'renderCVAnalysisPage';
            scriptFile = 'assets/js/pages/cvanalysis.page.js';
            break;
        case 'filters':
            functionName = 'renderFiltersPage';
            scriptFile = 'assets/js/pages/filters.page.js';
            break;
        case 'niches':
            functionName = 'renderNichesPage';
            scriptFile = 'assets/js/pages/niches.page.js';
            break;
        case 'history':
            functionName = 'renderHistoryPage';
            scriptFile = 'assets/js/pages/history.page.js';
            break;
        case 'settings':
            functionName = 'renderSettingsPage';
            scriptFile = 'assets/js/pages/settings.page.js';
            break;
        case 'promotions':
            functionName = 'renderPromotionsPage';
            scriptFile = 'assets/js/pages/promotions.page.js';
            break;
        case 'complaints':
            functionName = 'renderComplaintsPage';
            scriptFile = 'assets/js/pages.js';
            break;
        default:
            console.error(`Unknown page: ${pageName}`);
            showToast(`Unknown page: ${pageName}`, 'error');
            return;
    }
    
    // Try to call the function if it already exists (likely already loaded)
    console.log(`📦 Looking for function: ${functionName}`);
    console.log(`✓ Function exists: ${typeof window[functionName] === 'function'}`);
    
    if (window[functionName] && typeof window[functionName] === 'function') {
        console.log(`✅ Found function ${functionName}, executing...`);
        try {
            window[functionName]();
        } catch (error) {
            console.error(`Error rendering page ${pageName}:`, error);
            showToast(`Error loading ${pageName} page: ${error.message}`, 'error');
        }
    } else {
        // Function doesn't exist yet - try loading the script dynamically
        console.log(`Loading page module: ${scriptFile}`);
        
        // Show loading state
        mainContent.innerHTML = `
            <div class="loading-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; gap: 20px;">
                <div class="spinner"></div>
                <p>Loading page...</p>
            </div>
        `;
        
        // Load the script
        const script = document.createElement('script');
        script.src = scriptFile;
        script.onload = function() {
            // After script loads, try to call the function
            if (window[functionName] && typeof window[functionName] === 'function') {
                try {
                    window[functionName]();
                } catch (error) {
                    console.error(`Error rendering page ${pageName}:`, error);
                    showToast(`Error loading ${pageName} page: ${error.message}`, 'error');
                    mainContent.innerHTML = `
                        <div class="error-state" style="text-align: center; padding: 40px;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f87171; margin-bottom: 16px;"></i>
                            <h3 style="color: white;">Error Loading Page</h3>
                            <p style="color: rgba(255, 255, 255, 0.6);">${error.message}</p>
                            <button onclick="navigateToPage('${pageName}')" class="btn-primary" style="margin-top: 16px;">
                                <i class="fas fa-redo"></i> Retry
                            </button>
                        </div>
                    `;
                }
            } else {
                console.error(`Function ${functionName} not found after loading ${scriptFile}`);
                showToast(`Page module failed to load: ${functionName}`, 'error');
                mainContent.innerHTML = `
                    <div class="error-state" style="text-align: center; padding: 40px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f87171; margin-bottom: 16px;"></i>
                        <h3 style="color: white;">Page Module Not Found</h3>
                        <p style="color: rgba(255, 255, 255, 0.6);">The page module failed to load</p>
                        <button onclick="navigateToPage('${pageName}')" class="btn-primary" style="margin-top: 16px;">
                            <i class="fas fa-redo"></i> Retry
                        </button>
                    </div>
                `;
            }
        };
        script.onerror = function() {
            console.error(`Failed to load script: ${scriptFile}`);
            showToast(`Failed to load page module: ${scriptFile}`, 'error');
            mainContent.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f87171; margin-bottom: 16px;"></i>
                    <h3 style="color: white;">Failed to Load Page</h3>
                    <p style="color: rgba(255, 255, 255, 0.6);">Could not load the required page module</p>
                    <button onclick="navigateToPage('${pageName}')" class="btn-primary" style="margin-top: 16px;">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        };
        document.head.appendChild(script);
    }

    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) {
            sidebar.classList.remove('visible');
            sidebar.classList.add('hidden');
        }
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.navigateToPage = navigateToPage;

// ========================= SIDEBAR INITIALIZATION =========================
/**
 * Initialize navigation event listeners
 */
function initializeNavigation() {
    console.log('🚀 Initializing navigation system...');
    
    // Event delegation for nav items
    document.addEventListener('click', function(e) {
        const navItem = e.target.closest('.nav-item');
        if (navItem && navItem.dataset.page) {
            console.log('📍 Nav item clicked:', navItem.dataset.page);
            e.preventDefault();
            e.stopPropagation();
            const page = navItem.dataset.page;
            navigateToPage(page);
            // Also remove href hash from URL
            window.history.pushState({ page: page }, '', window.location.pathname);
        }
    });
    
    console.log('✅ Navigation event listeners initialized');
    
    // Menu toggle handler
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('visible');
            overlay.classList.toggle('active');
        });
        
        // Close sidebar when clicking overlay
        overlay.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.remove('visible');
            overlay.classList.remove('active');
        });
        
        // Prevent sidebar from closing when clicking inside it
        sidebar.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        console.log('✅ Sidebar toggle handlers initialized');
    } else {
        console.warn('⚠️ Menu elements not found', { menuToggle, sidebar, overlay });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavigation);
} else {
    // DOM is already ready
    initializeNavigation();
}

// ========================= EXPORTS =========================
window.navigateToPage = navigateToPage;
window.showToast = showToast;
window.showTierModal = showTierModal;
window.getTimeAgo = getTimeAgo;
