// Quick Diagnostic: Run this in browser console to test navigation

// 1. Check if pages.core.js loaded
console.log('✓ pages.core.js loaded:', typeof navigateToPage === 'function');

// 2. Check if pages.modals.js loaded  
console.log('✓ pages.modals.js loaded:', typeof openOpportunityModal === 'function');

// 3. Check if page modules are loaded
console.log('✓ Dashboard page loaded:', typeof renderDashboardPage === 'function');
console.log('✓ Opportunities page loaded:', typeof renderOpportunitiesPage === 'function');
console.log('✓ Top Gigs page loaded:', typeof renderTopGigsPage === 'function');
console.log('✓ CV Analysis page loaded:', typeof renderCVAnalysisPage === 'function');
console.log('✓ Filters page loaded:', typeof renderFiltersPage === 'function');
console.log('✓ History page loaded:', typeof renderHistoryPage === 'function');
console.log('✓ Settings page loaded:', typeof renderSettingsPage === 'function');
console.log('✓ Niches page loaded:', typeof renderNichesPage === 'function');
console.log('✓ Promotions page loaded:', typeof renderPromotionsPage === 'function');

// 4. Test navigation
console.log('\n📍 Testing navigation to opportunities:');
navigateToPage('opportunities');

// If nothing happens, check:
// 1. Is there a .dashboard-content element?
console.log('✓ Dashboard content element exists:', document.querySelector('.dashboard-content') !== null);

// 2. Check nav items
console.log('✓ Nav items with data-page:', document.querySelectorAll('.nav-item[data-page]').length);

// 3. Check event listeners
console.log('✓ Event listeners should be attached to document');
