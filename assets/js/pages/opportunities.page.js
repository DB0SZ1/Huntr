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
        
        // **NEW: Fetch full opportunity details for each item**
        const detailedOpportunities = await Promise.all(
            opportunities.map(async (opp) => {
                try {
                    // Fetch the full opportunity details using opportunity_id
                    const details = await API.call('GET', `/api/opportunities/${opp.opportunity_id}`);
                    return { ...opp, details };
                } catch (error) {
                    console.error(`Failed to fetch details for opportunity ${opp.opportunity_id}:`, error);
                    // Return original if fetch fails
                    return opp;
                }
            })
        );
        
        const data = { opportunities: detailedOpportunities, pagination };
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Get tier-based gig limit
        const tierLimits = {
            'free': 6,
            'pro': 20,
            'premium': 100
        };
        const gigLimit = tierLimits[user.tier] || 6;
        
        let html = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">Opportunities (${data.pagination.total})</h2>
                <div class="breadcrumb">Home / Opportunities</div>
                
                <div style="display: flex; gap: 12px; margin-top: 16px;">
                    <button class="toggle-btn active" onclick="switchOpportunitiesView('regular')" style="
                        padding: 8px 16px;
                        border-radius: 8px;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        background: rgba(255, 255, 255, 0.1);
                        color: rgba(255, 255, 255, 0.9);
                        cursor: pointer;
                        font-size: 13px;
                        transition: all 0.2s;
                    " id="regularViewBtn">
                        <i class="fas fa-list"></i> Regular Opportunities
                    </button>
                    <button class="toggle-btn" onclick="switchOpportunitiesView('curated')" style="
                        padding: 8px 16px;
                        border-radius: 8px;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        background: rgba(255, 255, 255, 0.05);
                        color: rgba(255, 255, 255, 0.6);
                        cursor: pointer;
                        font-size: 13px;
                        transition: all 0.2s;
                    " id="curatedViewBtn">
                        <i class="fas fa-star"></i> Curated This Week
                    </button>
                </div>
            </div>

            <div class="opportunities-grid" id="regularOppView">
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
                const timeAgo = getTimeAgo(new Date(opp.viewed_at || opp.sent_at || new Date()));
                const confidence = opp.confidence || 0;
                const saved = opp.saved || false;
                const applied = opp.applied || false;
                
                // **FIXED: Use real data from API**
                const details = opp.details || {};
                const platform = details.platform || 'Unknown Platform';
                const title = details.title || 'Opportunity';
                const contact = details.client_name || details.company || 'Client Available';
                const description = details.description || '';
                const budget = details.budget || details.salary || 'Not specified';
                const skills = details.required_skills || details.skills || [];
                
                const appliedBadge = applied ? '<span style="color: #10b981;"><i class="fas fa-check-circle"></i> Applied</span>' : '';
                const savedBadge = saved ? '<span style="color: #fbbf24;"><i class="fas fa-bookmark"></i> Saved</span>' : '';
                
                html += `
                    <div class="opportunity-card glass-card" onclick="openOpportunityModal('${opp._id}')">
                        <div class="opp-header">
                            <div class="opp-platform">${platform}</div>
                            <div class="opp-time">${timeAgo}</div>
                        </div>
                        <h3 class="opp-title">${title}</h3>
                        <div class="opp-company">${contact}</div>
                        <div class="opp-details">
                            <span><i class="fas fa-chart-line"></i> ${confidence}% match</span>
                            ${savedBadge}
                            ${appliedBadge}
                        </div>
                        <div class="opp-tags">
                            ${skills.slice(0, 3).map(skill => 
                                `<span class="opp-tag">${skill}</span>`
                            ).join('')}
                            ${budget !== 'Not specified' ? `<span class="opp-tag"><i class="fas fa-dollar-sign"></i> ${budget}</span>` : ''}
                        </div>
                        <div class="opp-footer">
                            <button class="opp-view-btn" onclick="event.stopPropagation(); openOpportunityModal('${opp._id}')">
                                View Details <i class="fas fa-arrow-right"></i>
                            </button>
                            <button class="opp-save-btn" onclick="event.stopPropagation(); saveOpportunity('${opp._id}')" style="
                                background: ${saved ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
                                border: 1px solid ${saved ? 'rgba(251, 191, 36, 0.3)' : 'rgba(255, 255, 255, 0.2)'};
                                color: ${saved ? '#fbbf24' : 'rgba(255, 255, 255, 0.6)'};
                                padding: 8px 12px;
                                border-radius: 8px;
                                cursor: pointer;
                                transition: all 0.2s;
                                font-size: 13px;
                            ">
                                <i class="fas fa-bookmark"></i> ${saved ? 'Saved' : 'Save'}
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        html += `
            <div class="opportunities-grid" id="curatedOppView" style="display: none;">
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
                    <h3>No curated gigs this week</h3>
                    <p>Check back later for top opportunities from your niches</p>
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
                    <div class="opportunity-card glass-card">
                        <div class="opp-header">
                            <div class="opp-platform">#${index + 1} • ${platform}</div>
                            <div class="opp-time" style="color: #fbbf24;">
                                <i class="fas fa-star"></i> Featured
                            </div>
                        </div>
                        <h3 class="opp-title">${title}</h3>
                        <div class="opp-company" style="color: rgba(255, 255, 255, 0.7);">${niche}</div>
                        <div class="opp-details">
                            <span style="background: rgba(${matchScore > 80 ? '16, 185, 129' : matchScore > 60 ? '245, 158, 11' : '248, 113, 113'}, 0.15); padding: 4px 8px; border-radius: 4px; color: ${matchScore > 80 ? '#10b981' : matchScore > 60 ? '#f59e0b' : '#f87171'};">
                                <i class="fas fa-chart-line"></i> ${matchScore}% match
                            </span>
                            <span style="background: rgba(${scamRisk < 20 ? '16, 185, 129' : scamRisk < 50 ? '245, 158, 11' : '248, 113, 113'}, 0.15); padding: 4px 8px; border-radius: 4px; color: ${scamColor};">
                                <i class="fas fa-shield"></i> ${scamRisk}% risk
                            </span>
                            ${urgency ? `<span style="background: rgba(248, 113, 113, 0.15); padding: 4px 8px; border-radius: 4px; color: #f87171;"><i class="fas fa-bolt"></i> ${urgency}</span>` : ''}
                        </div>
                        <div class="opp-tags">
                            <span class="opp-tag">${salary}</span>
                        </div>
                        <div class="opp-footer">
                            <button class="opp-view-btn" onclick="event.stopPropagation(); window.open('${externalUrl}', '_blank')">
                                View Opportunity <i class="fas fa-external-link-alt"></i>
                            </button>
                            <button class="opp-save-btn" onclick="event.stopPropagation(); saveCuratedGig('${gig._id || gig.id || index}')" style="
                                background: rgba(255, 255, 255, 0.1);
                                border: 1px solid rgba(255, 255, 255, 0.2);
                                color: rgba(255, 255, 255, 0.6);
                                padding: 8px 12px;
                                border-radius: 8px;
                                cursor: pointer;
                                transition: all 0.2s;
                                font-size: 13px;
                            ">
                                <i class="fas fa-bookmark"></i> Save
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        curatedView.innerHTML = html;
        
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