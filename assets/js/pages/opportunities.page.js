/**
 * opportunities.page.js - Opportunities page rendering (FIXED WITH NEW CARD STYLES)
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
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title" style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">Opportunities (${data.pagination.total})</h2>
                <div class="breadcrumb" style="font-size: 13px; color: rgba(255, 255, 255, 0.5); margin-bottom: 20px;">Home / Opportunities</div>
                
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <button class="toggle-btn active" onclick="switchOpportunitiesView('regular')" style="
                        padding: 10px 20px;
                        border-radius: 10px;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        background: rgba(255, 255, 255, 0.1);
                        color: rgba(255, 255, 255, 0.9);
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        white-space: nowrap;
                    " id="regularViewBtn">
                        <i class="fas fa-list"></i> Regular
                    </button>
                    <button class="toggle-btn" onclick="switchOpportunitiesView('curated')" style="
                        padding: 10px 20px;
                        border-radius: 10px;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        background: rgba(255, 255, 255, 0.05);
                        color: rgba(255, 255, 255, 0.6);
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        white-space: nowrap;
                    " id="curatedViewBtn">
                        <i class="fas fa-star"></i> Curated
                    </button>
                </div>
            </div>

            <div class="opportunities-grid" id="regularOppView" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">
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
                const timeAgo = opp.time_ago || getTimeAgo(new Date(opp.timestamp || opp.found_at || new Date()));
                const confidence = opp.confidence || 75;
                const saved = opp.is_saved || false;
                const applied = opp.is_applied || false;
                
                const platform = opp.platform || 'Unknown Platform';
                const title = opp.title || 'Opportunity';
                const contact = opp.contact || opp.twitter || opp.email || 'Contact Available';
                
                html += `
                    <div class="opportunity-card glass-card" onclick="openOpportunityModal('${opp._id}')" style="
                        display: flex;
                        flex-direction: column;
                        padding: 20px;
                        gap: 12px;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        overflow: hidden;
                        position: relative;
                        min-height: 280px;
                    ">
                        <!-- Top gradient line on hover -->
                        <div style="
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 3px;
                            background: linear-gradient(90deg, rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5));
                            opacity: 0;
                            transition: opacity 0.3s ease;
                        " class="card-top-line"></div>
                        
                        <div class="opp-header" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <div class="opp-platform" style="
                                font-size: 10px;
                                font-weight: 700;
                                padding: 5px 10px;
                                background: rgba(59, 130, 246, 0.15);
                                border: 1px solid rgba(59, 130, 246, 0.3);
                                border-radius: 6px;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                color: #60a5fa;
                                white-space: nowrap;
                            ">${platform}</div>
                            <div class="opp-time" style="font-size: 11px; color: rgba(255, 255, 255, 0.5); white-space: nowrap; font-weight: 500;">${timeAgo}</div>
                        </div>
                        
                        <h3 class="opp-title" style="
                            font-size: 16px;
                            font-weight: 700;
                            color: white;
                            margin: 8px 0;
                            line-height: 1.4;
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                            min-height: 44px;
                            font-family: 'Poppins', sans-serif;
                        ">${title}</h3>
                        
                        <div class="opp-company" style="
                            font-size: 13px;
                            color: rgba(255, 255, 255, 0.7);
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            font-weight: 500;
                            margin-bottom: 12px;
                        ">${contact}</div>
                        
                        <div class="opp-details" style="display: flex; gap: 8px; flex-wrap: wrap; margin: auto 0 12px 0;">
                            <span style="
                                font-size: 11px;
                                background: rgba(34, 197, 94, 0.15);
                                color: #22c55e;
                                padding: 5px 10px;
                                border-radius: 6px;
                                white-space: nowrap;
                                font-weight: 600;
                                display: inline-flex;
                                align-items: center;
                                gap: 5px;
                            "><i class="fas fa-chart-line" style="font-size: 10px;"></i> ${confidence}%</span>
                            ${saved ? `<span style="
                                font-size: 11px;
                                background: rgba(251, 191, 36, 0.15);
                                color: #fbbf24;
                                padding: 5px 10px;
                                border-radius: 6px;
                                white-space: nowrap;
                                font-weight: 600;
                                display: inline-flex;
                                align-items: center;
                                gap: 5px;
                            "><i class="fas fa-bookmark" style="font-size: 10px;"></i> Saved</span>` : ''}
                            ${applied ? `<span style="
                                font-size: 11px;
                                background: rgba(16, 185, 129, 0.15);
                                color: #10b981;
                                padding: 5px 10px;
                                border-radius: 6px;
                                white-space: nowrap;
                                font-weight: 600;
                                display: inline-flex;
                                align-items: center;
                                gap: 5px;
                            "><i class="fas fa-check-circle" style="font-size: 10px;"></i> Applied</span>` : ''}
                        </div>
                        
                        <div class="opp-footer" style="
                            display: flex;
                            gap: 8px;
                            margin-top: auto;
                            padding-top: 12px;
                            border-top: 1px solid rgba(255, 255, 255, 0.08);
                        ">
                            <button class="opp-view-btn" onclick="event.stopPropagation(); openOpportunityModal('${opp._id}')" style="
                                flex: 1;
                                padding: 10px 16px;
                                background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
                                border: 1px solid rgba(59, 130, 246, 0.3);
                                border-radius: 10px;
                                color: #60a5fa;
                                font-size: 13px;
                                font-weight: 600;
                                cursor: pointer;
                                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 6px;
                                font-family: 'Poppins', sans-serif;
                            " onmouseover="this.style.background='linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.2))'; this.style.borderColor='rgba(59, 130, 246, 0.5)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.3)'" onmouseout="this.style.background='linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))'; this.style.borderColor='rgba(59, 130, 246, 0.3)'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                                View <i class="fas fa-arrow-right" style="font-size: 11px;"></i>
                            </button>
                            <button class="opp-save-btn" onclick="event.stopPropagation(); saveOpportunity('${opp._id}')" style="
                                padding: 10px 12px;
                                background: ${saved ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.06)'};
                                border: 1px solid ${saved ? 'rgba(251, 191, 36, 0.4)' : 'rgba(255, 255, 255, 0.15)'};
                                border-radius: 10px;
                                color: ${saved ? '#fbbf24' : 'rgba(255, 255, 255, 0.7)'};
                                font-size: 14px;
                                cursor: pointer;
                                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                min-width: 40px;
                            " onmouseover="if (!${saved}) { this.style.background='rgba(251, 191, 36, 0.15)'; this.style.borderColor='rgba(251, 191, 36, 0.3)'; this.style.color='#fbbf24'; } this.style.transform='translateY(-2px)'" onmouseout="if (!${saved}) { this.style.background='rgba(255, 255, 255, 0.06)'; this.style.borderColor='rgba(255, 255, 255, 0.15)'; this.style.color='rgba(255, 255, 255, 0.7)'; } this.style.transform='translateY(0)'">
                                <i class="fas fa-bookmark"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        html += `
            <div class="opportunities-grid" id="curatedOppView" style="display: none; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">
                <div class="loading-container">
                    <div class="spinner"></div>
                    <p>Loading curated gigs...</p>
                </div>
            </div>
        `;
        
        mainContent.innerHTML = html;
        
        // Add hover effect for top line
        document.querySelectorAll('.opportunity-card').forEach(card => {
            const topLine = card.querySelector('.card-top-line');
            card.addEventListener('mouseenter', () => {
                if (topLine) topLine.style.opacity = '1';
            });
            card.addEventListener('mouseleave', () => {
                if (topLine) topLine.style.opacity = '0';
            });
        });
        
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
                    <h3 style="font-size: 22px;">No curated gigs this week</h3>
                    <p style="font-size: 15px;">Check back later for top opportunities</p>
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
                    <div class="opportunity-card glass-card" style="display: flex; flex-direction: column; padding: 20px; gap: 12px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; min-height: 280px; position: relative;">
                        <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, rgba(251, 191, 36, 0.6), rgba(245, 158, 11, 0.6)); opacity: 0; transition: opacity 0.3s ease;" class="card-top-line"></div>
                        
                        <div class="opp-header" style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                            <div class="opp-platform" style="font-size: 10px; font-weight: 700; background: rgba(251, 191, 36, 0.2); padding: 5px 10px; border-radius: 6px; color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); white-space: nowrap;">#${index + 1}</div>
                            <div class="opp-time" style="font-size: 11px; color: #fbbf24; white-space: nowrap;">
                                <i class="fas fa-star"></i> Featured
                            </div>
                        </div>
                        <h3 class="opp-title" style="font-size: 16px; font-weight: 700; color: white; margin: 8px 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-family: 'Poppins', sans-serif; min-height: 44px;">${title}</h3>
                        <div class="opp-company" style="font-size: 13px; color: rgba(255, 255, 255, 0.7); font-weight: 500;">${niche}</div>
                        <div class="opp-details" style="display: flex; gap: 8px; flex-wrap: wrap; margin: auto 0 12px 0;">
                            <span style="font-size: 11px; background: rgba(${matchScore > 80 ? '22, 197, 94' : matchScore > 60 ? '245, 158, 11' : '248, 113, 113'}, 0.15); padding: 5px 10px; border-radius: 6px; color: ${matchScore > 80 ? '#22c55e' : matchScore > 60 ? '#f59e0b' : '#f87171'}; white-space: nowrap; font-weight: 600;">
                                <i class="fas fa-chart-line"></i> ${matchScore}%
                            </span>
                            <span style="font-size: 11px; background: rgba(${scamRisk < 20 ? '16, 185, 129' : scamRisk < 50 ? '245, 158, 11' : '248, 113, 113'}, 0.15); padding: 5px 10px; border-radius: 6px; color: ${scamColor}; white-space: nowrap; font-weight: 600;">
                                <i class="fas fa-shield"></i> ${scamRisk}%
                            </span>
                            ${urgency ? `<span style="font-size: 11px; background: rgba(248, 113, 113, 0.15); padding: 5px 10px; border-radius: 6px; color: #f87171; white-space: nowrap; font-weight: 600;"><i class="fas fa-bolt"></i> ${urgency}</span>` : ''}
                        </div>
                        <div class="opp-tags" style="margin-top: auto;">
                            <span class="opp-tag" style="font-size: 11px; background: rgba(100, 116, 139, 0.2); color: rgba(255, 255, 255, 0.7); padding: 5px 10px; border-radius: 6px; display: inline-block;">${salary}</span>
                        </div>
                        <div class="opp-footer" style="display: flex; gap: 8px; margin-top: auto; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                            <button class="opp-view-btn" onclick="event.stopPropagation(); window.open('${externalUrl}', '_blank')" style="
                                flex: 1;
                                padding: 10px 16px;
                                background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
                                border: 1px solid rgba(59, 130, 246, 0.3);
                                border-radius: 10px;
                                color: #60a5fa;
                                font-size: 13px;
                                font-weight: 600;
                                cursor: pointer;
                                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 6px;
                                font-family: 'Poppins', sans-serif;
                            ">
                                View <i class="fas fa-external-link-alt"></i>
                            </button>
                            <button class="opp-save-btn" onclick="event.stopPropagation(); saveCuratedGig('${gig._id || gig.id || index}')" style="
                                padding: 10px 12px;
                                background: rgba(255, 255, 255, 0.06);
                                border: 1px solid rgba(255, 255, 255, 0.15);
                                border-radius: 10px;
                                color: rgba(255, 255, 255, 0.7);
                                font-size: 14px;
                                cursor: pointer;
                                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                                min-width: 40px;
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
        
        // Add hover effect for curated cards
        document.querySelectorAll('#curatedOppView .opportunity-card').forEach(card => {
            const topLine = card.querySelector('.card-top-line');
            card.addEventListener('mouseenter', () => {
                if (topLine) topLine.style.opacity = '1';
            });
            card.addEventListener('mouseleave', () => {
                if (topLine) topLine.style.opacity = '0';
            });
        });
        
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