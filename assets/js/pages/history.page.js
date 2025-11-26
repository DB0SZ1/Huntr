/**
 * history.page.js - History page rendering
 */

async function renderHistoryPage() {
    const mainContent = document.querySelector('.dashboard-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading history...</p>
        </div>
    `;
    
    try {
        const allOpportunities = await API.getOpportunities(1, 100, { viewed: true });
        
        let html = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">Your Opportunities</h2>
                <div class="breadcrumb">Home / History</div>
            </div>

            <div class="history-stats">
                <div class="glass-card stats-card">
                    <div class="stats-icon"><i class="fas fa-briefcase"></i></div>
                    <div class="stats-value">${allOpportunities.pagination?.total || 0}</div>
                    <div class="stats-label">Total Opportunities</div>
                    <div class="stats-description">Viewed</div>
                </div>
            </div>

            <div class="glass-card" style="margin-top: 32px;">
                <h3 class="card-title" style="margin-bottom: 24px;">Opportunities</h3>
                <div class="history-table">
        `;
        
        if (!allOpportunities.opportunities || allOpportunities.opportunities.length === 0) {
            html += `
                <div class="empty-state">
                    <p>No opportunities viewed yet. Start exploring opportunities to see them here.</p>
                </div>
            `;
        } else {
            allOpportunities.opportunities.forEach(opp => {
                const date = new Date(opp.created_at);
                const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                
                html += `
                    <div class="history-row" onclick="openOpportunityModal('${opp._id}')">
                        <div><strong>${opp.title || 'Opportunity'}</strong></div>
                        <div>${opp.platform || 'Platform'}</div>
                        <div>${dateStr}</div>
                        <div>${opp.match_data?.saved ? '<i class="fas fa-bookmark"></i> Saved' : 'Not saved'}</div>
                    </div>
                `;
            });
        }
        
        html += `
                </div>
            </div>
        `;
        
        mainContent.innerHTML = html;
        
    } catch (error) {
        console.error('Failed to load history:', error);
        mainContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load history</h3>
                <p>${error.message}</p>
                <button onclick="renderHistoryPage()" class="btn-primary">Retry</button>
            </div>
        `;
    }
}

window.renderHistoryPage = renderHistoryPage;
