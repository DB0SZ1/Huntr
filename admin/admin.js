/**
 * Admin Dashboard Main Controller
 * Handles navigation and page loading
 */

// Store current page for reference
let currentAdminPage = 'overview';

/**
 * Initialize admin panel on page load
 */
async function initAdminPanel() {
    try {
        // Check if user is admin
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/auth.html';
            return;
        }

        // Verify admin access (basic check - backend should verify)
        const isAdmin = localStorage.getItem('is_admin') === 'true';
        if (!isAdmin) {
            console.warn('Non-admin user detected, redirecting to dashboard');
            window.location.href = '/dashboard.html';
            return;
        }

        // Setup event listeners
        setupEventListeners();

        // Load initial page
        await loadAdminPage('overview');

    } catch (error) {
        console.error('Failed to initialize admin panel:', error);
        document.getElementById('adminContent').innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #f87171; margin-bottom: 16px;"></i>
                <h3>Failed to Initialize Admin Panel</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

/**
 * Setup event listeners for the admin panel
 */
function setupEventListeners() {
    // Menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar?.classList.toggle('active');
            sidebarOverlay?.classList.toggle('active');
        });
    }

    // Sidebar overlay click
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar?.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    // Close modals when clicking overlay
    const adminModalOverlay = document.getElementById('adminModalOverlay');
    if (adminModalOverlay) {
        adminModalOverlay.addEventListener('click', closeAllModals);
    }

    // Cursor glow effect
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        });
    }

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

/**
 * Load admin page dynamically
 */
async function loadAdminPage(pageName) {
    try {
        currentAdminPage = pageName;

        // Update sidebar active state
        updateSidebarActive(pageName);

        // Update page title and breadcrumb
        updatePageHeader(pageName);

        // Load the appropriate page
        switch (pageName) {
            case 'overview':
                // Include the overview.js file if not already loaded
                if (typeof loadOverviewPage === 'undefined') {
                    await loadScript('pages/overview.js');
                }
                await loadOverviewPage();
                break;

            case 'users':
                // Include the users.js file if not already loaded
                if (typeof loadUsersPage === 'undefined') {
                    await loadScript('pages/users.js');
                }
                await loadUsersPage();
                break;

            case 'activities':
                // Include the activities.js file if not already loaded
                if (typeof loadActivitiesPage === 'undefined') {
                    await loadScript('pages/activities.js');
                }
                await loadActivitiesPage();
                break;

            case 'health':
                // Include the health.js file if not already loaded
                if (typeof loadHealthPage === 'undefined') {
                    await loadScript('pages/health.js');
                }
                await loadHealthPage();
                break;

            case 'reports':
                // Include the reports.js file if not already loaded
                if (typeof loadReportsPage === 'undefined') {
                    await loadScript('pages/reports.js');
                }
                await loadReportsPage();
                break;

            case 'payments':
                // Include the payments.js file if not already loaded
                if (typeof loadPaymentsPage === 'undefined') {
                    await loadScript('pages/payments.js');
                }
                await loadPaymentsPage();
                break;

            case 'promotions':
                // Include the promotions.js file if not already loaded
                if (typeof loadPromotionsPage === 'undefined') {
                    await loadScript('pages/promotions.js');
                }
                await loadPromotionsPage();
                break;

            default:
                document.getElementById('adminContent').innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #f87171; margin-bottom: 16px;"></i>
                        <h3>Page Not Found</h3>
                        <p>The requested admin page does not exist.</p>
                        <button class="btn-primary" onclick="loadAdminPage('overview')" style="margin-top: 16px;">
                            <i class="fas fa-home"></i> Go to Overview
                        </button>
                    </div>
                `;
        }

        // Close sidebar on mobile after navigation
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (window.innerWidth < 768) {
            sidebar?.classList.remove('active');
            sidebarOverlay?.classList.remove('active');
        }

    } catch (error) {
        console.error('Failed to load admin page:', error);
        document.getElementById('adminContent').innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #f87171; margin-bottom: 16px;"></i>
                <h3>Failed to Load Page</h3>
                <p>${error.message}</p>
                <button class="btn-primary" onclick="loadAdminPage('overview')" style="margin-top: 16px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

/**
 * Load external script dynamically
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Update sidebar active state
 */
function updateSidebarActive(pageName) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });

    // Find and activate the current page nav item
    const pageMap = {
        'overview': 0,
        'users': 1,
        'subscriptions': 2,
        'analytics': 3,
        'monitoring': 4,
        'reports': 5,
        'promotions': 6
    };

    if (pageMap[pageName] !== undefined) {
        navItems[pageMap[pageName]]?.classList.add('active');
    }
}

/**
 * Update page header and breadcrumb
 */
function updatePageHeader(pageName) {
    const pageTitle = document.getElementById('pageTitle');
    const breadcrumbPage = document.getElementById('breadcrumbPage');

    const titles = {
        'overview': 'Admin Overview',
        'users': 'User Management',
        'activities': 'System Activities',
        'health': 'System Health',
        'reports': 'Reports & Analytics',
        'subscriptions': 'Subscription Management',
        'analytics': 'Analytics',
        'monitoring': 'System Monitoring',
        'promotions': 'Promotions'
    };

    if (pageTitle) {
        pageTitle.textContent = titles[pageName] || 'Admin Dashboard';
    }

    if (breadcrumbPage) {
        breadcrumbPage.textContent = titles[pageName] || 'Dashboard';
    }
}

/**
 * Close all modals
 */
function closeAllModals() {
    document.getElementById('userDetailsModal')?.classList.remove('active');
    document.getElementById('subscriptionDetailsModal')?.classList.remove('active');
}

/**
 * Toggle theme between light and dark
 */
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }
}

/**
 * Logout user
 */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        logoutUser();
    }
}

/**
 * Perform actual logout with API call
 */
async function logoutUser() {
    try {
        // Call logout endpoint
        await API.call('POST', '/api/auth/logout');
    } catch (error) {
        console.warn('Logout API call failed:', error);
        // Continue with client-side logout even if API fails
    } finally {
        // Clear local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('is_admin');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_email');
        
        // Redirect to auth page
        window.location.href = '/auth.html';
    }
}

/**
 * Navigate to admin page (used in HTML onclick handlers)
 */
async function navigateToAdminPage(pageName) {
    await loadAdminPage(pageName);
}

/**
 * Initialize on document ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminPanel);
} else {
    initAdminPanel();
}
