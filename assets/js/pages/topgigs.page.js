/**
 * topgigs.page.js - Top Gigs page rendering
 */

async function renderTopGigsPage() {
    const mainContent = document.querySelector('.dashboard-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading top gigs...</p>
        </div>
    `;
    
    try {
        const user = await API.getCurrentUser();
        const topGigs = await API.call('GET', '/api/curated/weekly-top-20');
        
        let gigs = [];
        if (Array.isArray(topGigs?.gigs)) {
            gigs = topGigs.gigs;
        } else if (topGigs?.gigs && typeof topGigs.gigs === 'object') {
            gigs = Object.values(topGigs.gigs);
        }
        
        // Apply tier-specific limits
        const tierLimits = { free: 6, pro: 20, premium: 100 };
        const limit = tierLimits[user.tier] || 6;
        gigs = gigs.slice(0, limit);

        let html = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">Top Gigs This Week</h2>
                <p style="color: rgba(255, 255, 255, 0.6);">Curated opportunities matching your niches (${gigs.length})</p>
            </div>

            <div class="top-gigs-container">
        `;
        
        if (gigs.length === 0) {
            html += `
                <div class="empty-state">
                    <i class="fas fa-star" style="font-size: 64px; opacity: 0.3; margin-bottom: 16px;"></i>
                    <h3>No gigs available</h3>
                    <p>Check back later for more curated opportunities</p>
                </div>
            `;
        } else {
            gigs.forEach((gig, index) => {
                const matchScore = gig.match_score || 0;
                const scamRisk = gig.scam_risk || 0;
                const riskColor = scamRisk < 20 ? '#10b981' : scamRisk < 50 ? '#f59e0b' : '#f87171';
                
                html += `
                    <div class="gig-card glass-card" style="position: relative;">
                        <div style="position: absolute; top: 16px; right: 16px; background: rgba(59, 130, 246, 0.2); 
                            padding: 6px 12px; border-radius: 20px; color: #3b82f6; font-size: 12px; font-weight: 600;">
                            #${index + 1}
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                            <div>
                                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-bottom: 4px;">
                                    <i class="fas fa-globe"></i> ${gig.platform || 'Platform'}
                                </div>
                                <h3 style="font-size: 18px; font-weight: 700; color: white; margin: 0; margin-bottom: 4px;">
                                    ${gig.title || 'Opportunity'}
                                </h3>
                                ${gig.niche ? `<div style="font-size: 12px; color: #a855f7; margin-bottom: 8px;">📌 ${gig.niche}</div>` : ''}
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                            <div style="background: rgba(59, 130, 246, 0.15); padding: 12px; border-radius: 8px;">
                                <div style="font-size: 11px; color: rgba(255, 255, 255, 0.6); margin-bottom: 4px;">Match Score</div>
                                <div style="font-size: 20px; font-weight: 700; color: #3b82f6;">${matchScore.toFixed(1)}%</div>
                            </div>
                            <div style="background: rgba(248, 113, 113, 0.15); padding: 12px; border-radius: 8px;">
                                <div style="font-size: 11px; color: rgba(255, 255, 255, 0.6); margin-bottom: 4px;">Scam Risk</div>
                                <div style="font-size: 20px; font-weight: 700; color: ${riskColor};">${scamRisk}%</div>
                            </div>
                        </div>
                        
                        ${gig.salary ? `
                        <div style="background: rgba(16, 185, 129, 0.15); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                            <div style="font-size: 11px; color: rgba(255, 255, 255, 0.6); margin-bottom: 4px;">💰 Salary / Compensation</div>
                            <div style="font-size: 16px; font-weight: 700; color: #10b981;">${gig.salary}</div>
                        </div>
                        ` : ''}
                        
                        ${gig.urgency ? `
                        <div style="background: rgba(249, 115, 22, 0.15); padding: 8px 12px; border-radius: 8px; margin-bottom: 12px; text-align: center;">
                            <span style="color: #f97316; font-weight: 600; font-size: 12px;">
                                <i class="fas fa-bolt"></i> ${gig.urgency.toUpperCase()}
                            </span>
                        </div>
                        ` : ''}
                        
                        <div style="display: flex; gap: 8px;">
                            <a href="${gig.url || '#'}" target="_blank" class="btn-primary" style="flex: 1; text-align: center; padding: 10px; border-radius: 8px; cursor: pointer; text-decoration: none; display: inline-block;">
                                <i class="fas fa-external-link-alt"></i> View Opportunity
                            </a>
                            <button onclick="saveCuratedGig('${gig.id || index}')" class="btn-secondary" style="padding: 10px 16px; background: rgba(168, 85, 247, 0.2); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 8px; cursor: pointer;">
                                <i class="fas fa-bookmark"></i> Save
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        html += `
            </div>
            
            <div style="margin-top: 32px; text-align: center; color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                <p>💡 Top gigs update weekly. More options available in your tier.</p>
            </div>
        `;
        
        mainContent.innerHTML = html;
        
    } catch (error) {
        console.error('Failed to load top gigs:', error);
        mainContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load top gigs</h3>
                <p>${error.message}</p>
                <button onclick="renderTopGigsPage()" class="btn-primary">Retry</button>
            </div>
        `;
    }
}

window.renderTopGigsPage = renderTopGigsPage;
