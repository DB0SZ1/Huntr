/**
 * navigation-fix.js - Fixed Navigation and Mobile Sidebar
 * Fixes: Mobile sidebar, navigation routing, event handling
 */

(function() {
    'use strict';

    // ==================== MOBILE SIDEBAR FIX ====================
    
    function initMobileSidebar() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        console.log('🔧 Initializing mobile sidebar...', {
            menuToggle: !!menuToggle,
            sidebar: !!sidebar,
            overlay: !!overlay
        });
        
        if (!menuToggle || !sidebar || !overlay) {
            console.error('❌ Missing sidebar elements');
            return;
        }

        // Clear any existing listeners
        menuToggle.replaceWith(menuToggle.cloneNode(true));
        const newMenuToggle = document.getElementById('menuToggle');
        
        // Toggle sidebar
        newMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('📱 Menu toggle clicked');
            
            const isVisible = sidebar.classList.contains('visible');
            
            if (isVisible) {
                sidebar.classList.remove('visible');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                sidebar.classList.add('visible');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scroll
            }
            
            console.log('📱 Sidebar is now:', isVisible ? 'hidden' : 'visible');
        });
        
        // Close on overlay click
        overlay.addEventListener('click', function(e) {
            console.log('📱 Overlay clicked - closing sidebar');
            sidebar.classList.remove('visible');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Prevent clicks inside sidebar from closing it
        sidebar.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        console.log('✅ Mobile sidebar initialized');
    }

    // ==================== NAVIGATION FIX ====================
    
    function initNavigation() {
        console.log('🚀 Initializing fixed navigation...');
        
        // Get all nav items
        const navItems = document.querySelectorAll('.nav-item[data-page]');
        
        console.log(`📋 Found ${navItems.length} navigation items`);
        
        navItems.forEach(navItem => {
            const page = navItem.dataset.page;
            
            // Remove existing listeners by cloning
            const newNavItem = navItem.cloneNode(true);
            navItem.parentNode.replaceChild(newNavItem, navItem);
            
            // Add new listener
            newNavItem.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`🔗 Navigation clicked: ${page}`);
                
                // Navigate
                navigateToPage(page);
                
                // Close mobile sidebar
                closeMobileSidebar();
                
                // Update URL without hash
                if (window.history && window.history.pushState) {
                    window.history.pushState({ page }, '', window.location.pathname);
                }
            });
        });
        
        console.log('✅ Navigation initialized');
    }

    function closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && sidebar.classList.contains('visible')) {
            sidebar.classList.remove('visible');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
            console.log('📱 Mobile sidebar closed');
        }
    }

    // ==================== NAVIGATION FUNCTION ====================
    
    window.navigateToPage = function(pageName) {
        console.log(`📄 Navigating to: ${pageName}`);
        
        const mainContent = document.querySelector('.dashboard-content');
        if (!mainContent) {
            console.error('❌ Dashboard content container not found');
            return;
        }
        
        // Update active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`.nav-item[data-page="${pageName}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
        
        // Map page name to function
        const pageMap = {
            'dashboard': 'renderDashboardPage',
            'opportunities': 'renderOpportunitiesPage',
            'topgigs': 'renderTopGigsPage',
            'cv-analysis': 'renderCVAnalysisPage',
            'filters': 'renderFiltersPage',
            'niches': 'renderNichesPage',
            'history': 'renderHistoryPage',
            'settings': 'renderSettingsPage',
            'promotions': 'renderPromotionsPage',
            'complaints': 'renderComplaintsPage'
        };
        
        const functionName = pageMap[pageName];
        
        if (!functionName) {
            console.error(`❌ Unknown page: ${pageName}`);
            showToast(`Unknown page: ${pageName}`, 'error');
            return;
        }
        
        console.log(`🔍 Looking for function: ${functionName}`);
        
        if (typeof window[functionName] === 'function') {
            console.log(`✅ Executing ${functionName}`);
            
            try {
                window[functionName]();
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
            } catch (error) {
                console.error(`❌ Error rendering ${pageName}:`, error);
                showToast(`Error loading page: ${error.message}`, 'error');
                
                mainContent.innerHTML = `
                    <div class="error-state" style="text-align: center; padding: 60px 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f87171; margin-bottom: 20px;"></i>
                        <h3 style="color: white; margin-bottom: 12px;">Error Loading Page</h3>
                        <p style="color: rgba(255, 255, 255, 0.6); margin-bottom: 24px;">${error.message}</p>
                        <button onclick="navigateToPage('${pageName}')" class="btn-primary">
                            <i class="fas fa-redo"></i> Retry
                        </button>
                    </div>
                `;
            }
        } else {
            console.log(`⏳ Function ${functionName} not loaded yet, loading dynamically...`);
            
            // Show loading
            mainContent.innerHTML = `
                <div class="loading-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; gap: 20px;">
                    <div class="spinner"></div>
                    <p style="color: rgba(255, 255, 255, 0.7);">Loading ${pageName}...</p>
                </div>
            `;
            
            // Try to load the script
            const scriptMap = {
                'dashboard': 'assets/js/pages/dashboard.page.js',
                'opportunities': 'assets/js/pages/opportunities.page.js',
                'topgigs': 'assets/js/pages/topgigs.page.js',
                'cv-analysis': 'assets/js/pages/cvanalysis.page.js',
                'filters': 'assets/js/pages/filters.page.js',
                'niches': 'assets/js/pages/niches.page.js',
                'history': 'assets/js/pages/history.page.js',
                'settings': 'assets/js/pages/settings.page.js',
                'promotions': 'assets/js/pages/promotions.page.js',
                'complaints': 'assets/js/pages.js'
            };
            
            const scriptFile = scriptMap[pageName];
            
            if (!scriptFile) {
                console.error(`❌ No script file mapped for ${pageName}`);
                showToast(`Page module not found: ${pageName}`, 'error');
                return;
            }
            
            const script = document.createElement('script');
            script.src = scriptFile;
            
            script.onload = function() {
                console.log(`✅ Script loaded: ${scriptFile}`);
                
                if (typeof window[functionName] === 'function') {
                    try {
                        window[functionName]();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } catch (error) {
                        console.error(`❌ Error after loading ${scriptFile}:`, error);
                        showToast(`Error: ${error.message}`, 'error');
                    }
                } else {
                    console.error(`❌ Function ${functionName} still not available after loading`);
                    showToast(`Page module failed to initialize`, 'error');
                }
            };
            
            script.onerror = function() {
                console.error(`❌ Failed to load script: ${scriptFile}`);
                showToast(`Failed to load page module`, 'error');
                
                mainContent.innerHTML = `
                    <div class="error-state" style="text-align: center; padding: 60px 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f87171; margin-bottom: 20px;"></i>
                        <h3 style="color: white; margin-bottom: 12px;">Failed to Load Page</h3>
                        <p style="color: rgba(255, 255, 255, 0.6); margin-bottom: 24px;">Could not load the page module</p>
                        <button onclick="navigateToPage('${pageName}')" class="btn-primary">
                            <i class="fas fa-redo"></i> Retry
                        </button>
                    </div>
                `;
            };
            
            document.head.appendChild(script);
        }
    };

    // ==================== INITIALIZATION ====================
    
    function init() {
        console.log('🔧 Initializing navigation fixes...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                initMobileSidebar();
                initNavigation();
            });
        } else {
            initMobileSidebar();
            initNavigation();
        }
    }

    // Start initialization
    init();
    
    console.log('✅ Navigation fix loaded');
})();