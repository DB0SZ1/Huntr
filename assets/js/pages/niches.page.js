/**
 * niches.page.js - Niches page rendering
 */

async function renderNichesPage() {
    const mainContent = document.querySelector('.dashboard-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading niches...</p>
        </div>
    `;
    
    try {
        // Reuse filters page rendering for niches
        await renderFiltersPage();
        
    } catch (error) {
        console.error('Failed to load niches:', error);
        mainContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load niches</h3>
                <p>${error.message}</p>
                <button onclick="renderNichesPage()" class="btn-primary">Retry</button>
            </div>
        `;
    }
}

window.renderNichesPage = renderNichesPage;
