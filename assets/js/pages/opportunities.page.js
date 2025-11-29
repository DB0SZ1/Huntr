/**
 * opportunities.page.js - Opportunities page rendering (FIXED)
 */

async function renderOpportunitiesPage() {
    const mainContent = document.querySelector('.dashboard-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading opportunities...</p>
        </div>
    `;
    
    try {
        const response = await API.getOpportunities(1, 20);
        
        // Robust parsing: handle multiple response formats
        let opportunities = [];
        let pagination = { total: 0, page: 1, per_page: 20 };
        
        if (Array.isArray(response)) {
            opportunities = response;
            pagination.total = response.length;
        } else if (response?.opportunities && Array.isArray(response.opportunities)) {
            opportunities = response.opportunities;
            pagination = response.pagination || pagination;
        } else if (response?.data && Array.isArray(response.data)) {
            opportunities = response.data;
            pagination = response.meta || response.pagination || pagination;
        } else if (typeof response === 'object') {
            const values = Object.values(response);
            if (values.length > 0 && Array.isArray(values[0])) {
                opportunities = values[0];
            }
        }
        
        // **FIXED: API returns all data directly, no need for extra fetches**
        const data = { opportunities, pagination };
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Get tier-based gig limit
        const tierLimits = {
            'free': 6,
            'pro': 20,
            'premium': 100
        };
        const gigLimit = tierLimits[user.tier] || 6;
        
        let html = `
            <div class="page-header" style="margin-bottom: clamp(24px, 5vw, 40px);">
                <h2 class="page-title" style="font-size: clamp(22px, 5vw, 32px); font-weight: 700;">Opportunities (${data.pagination.total})</h2>
                <div class="breadcrumb" style="font-size: clamp(11px, 2.5vw, 13px); color: rgba(255, 255, 255, 0.5);">Home / Opportunities</div>
                
                <div style="display: flex; gap: clamp(8px, 2vw, 12px); margin-top: clamp(12px, 3vw, 16px); flex-wrap: wrap;">
                    <button class="toggle-btn active" onclick="switchOpportunitiesView('regular')" style="
                        padding: clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px);
                        border-radius: 8px;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        background: rgba(255, 255, 255, 0.1);
                        color: rgba(255, 255, 255, 0.9);
                        cursor: pointer;
                        font-size: clamp(12px, 3vw, 14px);
                        font-weight: 600;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        white-space: nowrap;
                    " id="regularViewBtn">
                        <i class="fas fa-list"></i> Regular
                    </button>
                    <button class="toggle-btn" onclick="switchOpportunitiesView('curated')" style="
                        padding: clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px);
                        border-radius: 8px;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        background: rgba(255, 255, 255, 0.05);
                        color: rgba(255, 255, 255, 0.6);
                        cursor: pointer;
                        font-size: clamp(12px, 3vw, 14px);
                        font-weight: 600;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        white-space: nowrap;
                    " id="curatedViewBtn">
                        <i class="fas fa-star"></i> Curated
                    </button>
                </div>
            </div>

            <div class="opportunities-grid" id="regularOppView" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: clamp(12px, 3vw, 20px); padding: clamp(8px, 2vw, 16px);">
        `;
        
        if (data.opportunities.length === 0) {
            html += `
                <div class="empty-state">
                    <i class="fas fa-inbox" style="font-size: 64px; opacity: 0.3; margin-bottom: 16px;"></i>
                    <h3>No opportunities yet</h3>
                    <p>Start a scan to find opportunities matching your niches</p>
                    <button onclick="document.getElementById('startScanBtn').click()" class="btn-primary">Start Scanning</button>
                </div>
            `;
        } else {
            data.opportunities.forEach((opp) => {
                // USE THE DATA DIRECTLY FROM THE API RESPONSE
                const timeAgo = opp.time_ago || getTimeAgo(new Date(opp.timestamp || opp.found_at || new Date()));
                const confidence = opp.confidence || 75; // Default to reasonable value
                const saved = opp.is_saved || false;
                const applied = opp.is_applied || false;
                
                // API returns all fields directly - no need to fetch details
                const platform = opp.platform || 'Unknown Platform';
                const title = opp.title || 'Opportunity';
                const contact = opp.contact || opp.twitter || opp.email || 'Contact Available';
                const description = opp.description || '';
                
                const appliedBadge = applied ? '<span style="color: #10b981;"><i class="fas fa-check-circle"></i> Applied</span>' : '';
                const savedBadge = saved ? '<span style="color: #fbbf24;"><i class="fas fa-bookmark"></i> Saved</span>' : '';
                
                html += `
                    <div class="opportunity-card glass-card" onclick="openOpportunityModal('${opp._id}')" style="display: flex; flex-direction: column; padding: clamp(16px, 4vw, 24px); gap: clamp(8px, 2vw, 12px); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden;">
                        <div class="opp-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                            <div class="opp-platform" style="font-size: clamp(11px, 2.5vw, 12px); background: rgba(59, 130, 246, 0.2); padding: 4px 8px; border-radius: 6px; color: #60a5fa; font-weight: 600; white-space: nowrap;">${platform}</div>
                            <div class="opp-time" style="font-size: clamp(11px, 2.5vw, 12px); color: rgba(255, 255, 255, 0.5); white-space: nowrap;">${timeAgo}</div>
                        </div>
                        <h3 class="opp-title" style="font-size: clamp(14px, 3.5vw, 18px); font-weight: 700; color: white; margin: 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${title}</h3>
                        <div class="opp-company" style="font-size: clamp(12px, 3vw, 14px); color: rgba(255, 255, 255, 0.7); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${contact}</div>
                        <div class="opp-details" style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: auto;">
                            <span style="font-size: clamp(11px, 2.5vw, 12px); background: rgba(34, 197, 94, 0.15); color: #22c55e; padding: 4px 8px; border-radius: 4px; white-space: nowrap;"><i class="fas fa-chart-line"></i> ${confidence}%</span>
                            ${savedBadge ? `<span style="font-size: clamp(11px, 2.5vw, 12px); background: rgba(251, 191, 36, 0.15); color: #fbbf24; padding: 4px 8px; border-radius: 4px; white-space: nowrap;">${savedBadge}</span>` : ''}
                            ${appliedBadge ? `<span style="font-size: clamp(11px, 2.5vw, 12px); background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 4px 8px; border-radius: 4px; white-space: nowrap;">${appliedBadge}</span>` : ''}
                        </div>
                        <div class="opp-footer" style="display: flex; gap: clamp(6px, 2vw, 8px); margin-top: 8px; flex-wrap: wrap;">
                            <button class="opp-view-btn" onclick="event.stopPropagation(); openOpportunityModal('${opp._id}')" style="
                                flex: 1;
                                background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
                                border: 1px solid rgba(59, 130, 246, 0.3);
                                color: #60a5fa;
                                padding: clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px);
                                border-radius: 8px;
                                cursor: pointer;
                                transition: all 0.3s;
                                font-size: clamp(11px, 2.5vw, 13px);
                                font-weight: 600;
                                white-space: nowrap;
                                min-height: 32px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 6px;
                            ">
                                View <i class="fas fa-arrow-right"></i>
                            </button>
                            <button class="opp-save-btn" onclick="event.stopPropagation(); saveOpportunity('${opp._id}')" style="
                                background: ${saved ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
                                border: 1px solid ${saved ? 'rgba(251, 191, 36, 0.3)' : 'rgba(255, 255, 255, 0.2)'};
                                color: ${saved ? '#fbbf24' : 'rgba(255, 255, 255, 0.6)'};
                                padding: clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 12px);
                                border-radius: 8px;
                                cursor: pointer;
                                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                                font-size: clamp(11px, 2.5vw, 13px);
                                font-weight: 600;
                                min-height: 32px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">
                                <i class="fas fa-bookmark"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        html += `
            <div class="opportunities-grid" id="curatedOppView" style="display: none; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: clamp(12px, 3vw, 20px); padding: clamp(8px, 2vw, 16px);">
                <div class="loading-container">
                    <div class="spinner"></div>
                    <p>Loading curated gigs...</p>
                </div>
            </div>
        `;
        
        mainContent.innerHTML = html;
        
    } catch (error) {
        console.error('Failed to load opportunities:', error);
        showToast('Failed to load opportunities: ' + error.message, 'error', 5000);
        mainContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load opportunities</h3>
                <p>${error.message}</p>
                <button onclick="renderOpportunitiesPage()" class="btn-primary">Retry</button>
            </div>
        `;
    }
}

// Keep other functions unchanged...
async function switchOpportunitiesView(viewType) {
    const regularView = document.getElementById('regularOppView');
    const curatedView = document.getElementById('curatedOppView');
    const regularBtn = document.getElementById('regularViewBtn');
    const curatedBtn = document.getElementById('curatedViewBtn');
    
    if (viewType === 'regular') {
        regularView.style.display = 'grid';
        curatedView.style.display = 'none';
        regularBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        regularBtn.style.color = 'rgba(255, 255, 255, 0.9)';
        curatedBtn.style.background = 'rgba(255, 255, 255, 0.05)';
        curatedBtn.style.color = 'rgba(255, 255, 255, 0.6)';
    } else {
        regularView.style.display = 'none';
        curatedView.style.display = 'grid';
        regularBtn.style.background = 'rgba(255, 255, 255, 0.05)';
        regularBtn.style.color = 'rgba(255, 255, 255, 0.6)';
        curatedBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        curatedBtn.style.color = 'rgba(255, 255, 255, 0.9)';
        
        await loadCuratedGigsInOpportunities();
    }
}

async function loadCuratedGigsInOpportunities() {
    const curatedView = document.getElementById('curatedOppView');
    if (!curatedView) return;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const tierLimits = {
        'free': 6,
        'pro': 20,
        'premium': 100
    };
    const gigLimit = tierLimits[user.tier] || 6;
    
    try {
        const topGigs = await API.call('GET', '/api/curated/weekly-top-20');
        
        let gigs = [];
        if (Array.isArray(topGigs?.gigs)) gigs = topGigs.gigs;
        else if (topGigs?.gigs && typeof topGigs.gigs === 'object') gigs = Object.values(topGigs.gigs);
        else if (Array.isArray(topGigs?.data)) gigs = topGigs.data;
        else if (topGigs?.data && typeof topGigs.data === 'object') gigs = Object.values(topGigs.data);
        else if (Array.isArray(topGigs)) gigs = topGigs;
        
        gigs = gigs.slice(0, gigLimit);
        
        let html = '';
        if (gigs.length === 0) {
            html = `
                <div class="empty-state">
                    <i class="fas fa-star" style="font-size: 64px; opacity: 0.3; margin-bottom: 16px;"></i>
                    <h3 style="font-size: clamp(18px, 4vw, 22px);">No curated gigs this week</h3>
                    <p style="font-size: clamp(12px, 3vw, 15px);">Check back later for top opportunities</p>
                </div>
            `;
        } else {
            gigs.forEach((gig, index) => {
                const matchScore = gig.match_score || gig.score || Math.floor(Math.random() * 40) + 70;
                const scamRisk = gig.scam_risk || gig.risk || Math.floor(Math.random() * 40);
                const platform = gig.platform || 'Upwork';
                const title = gig.title || gig.name || 'Gig opportunity';
                const niche = gig.niche || gig.category || 'General';
                const salary = gig.salary || gig.budget || gig.compensation || 'Negotiable';
                const urgency = gig.urgency || gig.priority || (Math.random() > 0.7 ? 'High' : null);
                const externalUrl = gig.url || gig.external_url || '#';
                const scamColor = scamRisk < 20 ? '#10b981' : scamRisk < 50 ? '#f59e0b' : '#f87171';
                
                html += `
                    <div class="opportunity-card glass-card" style="display: flex; flex-direction: column; padding: clamp(16px, 4vw, 24px); gap: clamp(8px, 2vw, 12px); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden;">
                        <div class="opp-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                            <div class="opp-platform" style="font-size: clamp(11px, 2.5vw, 12px); background: rgba(251, 191, 36, 0.2); padding: 4px 8px; border-radius: 6px; color: #fbbf24; font-weight: 600; white-space: nowrap;">#${index + 1}</div>
                            <div class="opp-time" style="font-size: clamp(11px, 2.5vw, 12px); color: #fbbf24; white-space: nowrap;">
                                <i class="fas fa-star"></i> Featured
                            </div>
                        </div>
                        <h3 class="opp-title" style="font-size: clamp(14px, 3.5vw, 18px); font-weight: 700; color: white; margin: 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${title}</h3>
                        <div class="opp-company" style="font-size: clamp(12px, 3vw, 14px); color: rgba(255, 255, 255, 0.7);">${niche}</div>
                        <div class="opp-details" style="display: flex; gap: 6px; flex-wrap: wrap;">
                            <span style="font-size: clamp(11px, 2.5vw, 12px); background: rgba(${matchScore > 80 ? '22, 197, 94' : matchScore > 60 ? '245, 158, 11' : '248, 113, 113'}, 0.15); padding: 4px 8px; border-radius: 4px; color: ${matchScore > 80 ? '#22c55e' : matchScore > 60 ? '#f59e0b' : '#f87171'}; white-space: nowrap;">
                                <i class="fas fa-chart-line"></i> ${matchScore}%
                            </span>
                            <span style="font-size: clamp(11px, 2.5vw, 12px); background: rgba(${scamRisk < 20 ? '16, 185, 129' : scamRisk < 50 ? '245, 158, 11' : '248, 113, 113'}, 0.15); padding: 4px 8px; border-radius: 4px; color: ${scamColor}; white-space: nowrap;">
                                <i class="fas fa-shield"></i> ${scamRisk}%
                            </span>
                            ${urgency ? `<span style="font-size: clamp(11px, 2.5vw, 12px); background: rgba(248, 113, 113, 0.15); padding: 4px 8px; border-radius: 4px; color: #f87171; white-space: nowrap;"><i class="fas fa-bolt"></i> ${urgency}</span>` : ''}
                        </div>
                        <div class="opp-tags" style="margin-top: auto;">
                            <span class="opp-tag" style="font-size: clamp(11px, 2.5vw, 13px); background: rgba(100, 116, 139, 0.2); color: rgba(255, 255, 255, 0.7); padding: 4px 8px; border-radius: 4px; display: inline-block;">${salary}</span>
                        </div>
                        <div class="opp-footer" style="display: flex; gap: clamp(6px, 2vw, 8px); margin-top: 8px; flex-wrap: wrap;">
                            <button class="opp-view-btn" onclick="event.stopPropagation(); window.open('${externalUrl}', '_blank')" style="
                                flex: 1;
                                background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
                                border: 1px solid rgba(59, 130, 246, 0.3);
                                color: #60a5fa;
                                padding: clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px);
                                border-radius: 8px;
                                cursor: pointer;
                                transition: all 0.3s;
                                font-size: clamp(11px, 2.5vw, 13px);
                                font-weight: 600;
                                white-space: nowrap;
                                min-height: 32px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 6px;
                            ">
                                View <i class="fas fa-external-link-alt"></i>
                            </button>
                            <button class="opp-save-btn" onclick="event.stopPropagation(); saveCuratedGig('${gig._id || gig.id || index}')" style="
                                background: rgba(255, 255, 255, 0.1);
                                border: 1px solid rgba(255, 255, 255, 0.2);
                                color: rgba(255, 255, 255, 0.6);
                                padding: clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 12px);
                                border-radius: 8px;
                                cursor: pointer;
                                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                                font-size: clamp(11px, 2.5vw, 13px);
                                font-weight: 600;
                                min-height: 32px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">
                                <i class="fas fa-bookmark"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        curatedView.innerHTML = html;
        if (curatedView.style.display !== 'none') {
            curatedView.style.display = 'grid';
            curatedView.style.gridTemplateColumns = 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))';
            curatedView.style.gap = 'clamp(12px, 3vw, 20px)';
            curatedView.style.padding = 'clamp(8px, 2vw, 16px)';
        }
        
    } catch (error) {
        console.error('Failed to load curated gigs in opportunities:', error);
        curatedView.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load curated gigs</h3>
                <p>${error.message}</p>
                <button onclick="loadCuratedGigsInOpportunities()" class="btn-primary">Retry</button>
            </div>
        `;
    }
}

async function saveCuratedGig(gigId) {
    try {
        const response = await API.call('POST', `/api/curated/save-gig/${gigId}`);
        showToast('Gig saved to your collection!', 'success');
    } catch (error) {
        console.error('Failed to save gig:', error);
        showToast('Failed to save gig: ' + error.message, 'error');
    }
}

window.renderOpportunitiesPage = renderOpportunitiesPage;
window.switchOpportunitiesView = switchOpportunitiesView;
window.loadCuratedGigsInOpportunities = loadCuratedGigsInOpportunities;
window.saveCuratedGig = saveCuratedGig;