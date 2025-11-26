/**
 * Niches Management Page - FIXED
 * Proper modal display and button styling
 */

// Helper function to format relative time
function getTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return date.toLocaleDateString();
}

async function renderNichesPage() {
    const mainContent = document.querySelector('.dashboard-content');
    mainContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading niches...</p>
        </div>
    `;
    
    try {
        const user = await API.getCurrentUser();
        const plans = await API.getSubscriptionPlans();
        const currentPlan = plans.find(p => p.tier === user.tier);
        const niches = await API.getNiches();
        
        const maxNiches = currentPlan?.max_niches || 1;
        
        let html = `
            <div class="page-header" style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 class="page-title">My Niches (${niches.length}/${maxNiches})</h2>
                    <div class="breadcrumb">Home / Niches</div>
                </div>
                <button onclick="showCreateNicheModal()" class="btn-primary" style="
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #333333 0%, #1a1a1a 100%);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    color: white;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(0, 0, 0, 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.4)'">
                    <i class="fas fa-plus"></i> Create Niche
                </button>
            </div>
        `;
        
        if (niches.length === 0) {
            html += `
                <div class="empty-state" style="padding: 60px 20px; text-align: center; background: rgba(255, 255, 255, 0.05); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);">
                    <div style="font-size: 64px; margin-bottom: 16px;">🎯</div>
                    <h3 style="color: #FFFFFF; font-size: 24px; margin-bottom: 12px; font-weight: 700;">No niches yet</h3>
                    <p style="color: rgba(255, 255, 255, 0.6); margin-bottom: 32px; font-size: 16px;">Create your first niche to start discovering opportunities</p>
                    <button onclick="showCreateNicheModal()" class="btn-primary" style="
                        padding: 14px 28px;
                        background: linear-gradient(135deg, #333333 0%, #1a1a1a 100%);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 12px;
                        color: white;
                        font-weight: 600;
                        font-size: 15px;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
                    " onmouseover="this.style.transform='translateY(-3px) scale(1.02)'; this.style.boxShadow='0 12px 24px rgba(0, 0, 0, 0.5)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 16px rgba(0, 0, 0, 0.4)'">
                        <i class="fas fa-plus"></i> Create Your First Niche
                    </button>
                </div>
            `;
        } else {
            html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">`;
            
            niches.forEach(niche => {
                const oppCount = niche.opportunities_found || 0;
                const isActive = niche.status === 'active';
                const createdAt = getTimeAgo(new Date(niche.created_at));
                
                html += `
                    <div style="
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 16px;
                        padding: 24px;
                        position: relative;
                        overflow: hidden;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
                        transition: all 0.3s ease;
                    " onmouseover="this.style.boxShadow='0 8px 24px rgba(0, 0, 0, 0.4)'; this.style.transform='translateY(-4px)'; this.style.borderColor='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.boxShadow='0 4px 16px rgba(0, 0, 0, 0.3)'; this.style.transform='translateY(0)'; this.style.borderColor='rgba(255, 255, 255, 0.1)'">
                        <div style="position: absolute; top: 0; right: 0; width: 120px; height: 120px; background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%); pointer-events: none;"></div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px; position: relative; z-index: 1;">
                            <div>
                                <h3 style="color: #FFFFFF; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">${niche.name}</h3>
                                <p style="color: rgba(255, 255, 255, 0.5); margin: 6px 0 0; font-size: 13px;">${createdAt}</p>
                            </div>
                            <span style="
                                display: inline-block;
                                padding: 6px 14px;
                                background: ${isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(107, 114, 128, 0.2)'};
                                color: ${isActive ? '#22c55e' : '#9ca3af'};
                                border-radius: 24px;
                                font-size: 12px;
                                font-weight: 700;
                                border: 1px solid ${isActive ? 'rgba(34, 197, 94, 0.4)' : 'rgba(107, 114, 128, 0.3)'};
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                            ">${isActive ? '✓ Active' : '○ Paused'}</span>
                        </div>
                        
                        <p style="color: rgba(255, 255, 255, 0.7); margin: 16px 0; position: relative; z-index: 1; font-size: 14px; line-height: 1.6;">
                            ${niche.description || 'No description'}
                        </p>
                        
                        <div style="display: flex; gap: 12px; margin: 20px 0; position: relative; z-index: 1;">
                            <div style="flex: 1; padding: 12px; background: rgba(100, 100, 100, 0.15); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px; text-align: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);">
                                <div style="color: #FFFFFF; font-weight: 700; font-size: 20px; font-family: 'Poppins', sans-serif;">${niche.keywords?.length || 0}</div>
                                <div style="color: rgba(255, 255, 255, 0.5); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Keywords</div>
                            </div>
                            <div style="flex: 1; padding: 12px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 10px; text-align: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);">
                                <div style="color: #22c55e; font-weight: 700; font-size: 20px; font-family: 'Poppins', sans-serif;">${oppCount}</div>
                                <div style="color: rgba(255, 255, 255, 0.5); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Opportunities</div>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 10px; position: relative; z-index: 1;">
                            <button onclick="editNiche('${niche._id}')" style="
                                flex: 1;
                                padding: 10px 16px;
                                background: rgba(100, 100, 100, 0.2);
                                border: 1px solid rgba(255, 255, 255, 0.15);
                                color: #FFFFFF;
                                border-radius: 10px;
                                cursor: pointer;
                                font-size: 14px;
                                font-weight: 600;
                                transition: all 0.3s ease;
                                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                            " onmouseover="this.style.background='rgba(150, 150, 150, 0.3)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.3)'" onmouseout="this.style.background='rgba(100, 100, 100, 0.2)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.2)'">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button onclick="confirmDeleteNiche('${niche._id}', '${niche.name}')" style="
                                flex: 1;
                                padding: 10px 16px;
                                background: rgba(239, 68, 68, 0.15);
                                border: 1px solid rgba(239, 68, 68, 0.3);
                                color: #ef4444;
                                border-radius: 10px;
                                cursor: pointer;
                                font-size: 14px;
                                font-weight: 600;
                                transition: all 0.3s ease;
                                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                            " onmouseover="this.style.background='rgba(239, 68, 68, 0.25)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(239, 68, 68, 0.3)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.15)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.2)'">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
        
        mainContent.innerHTML = html;
        
    } catch (error) {
        console.error('Failed to load niches:', error);
        mainContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle" style="font-size: 64px; opacity: 0.3; margin-bottom: 16px; color: #ef4444;"></i>
                <h3 style="color: #FFFFFF; font-size: 20px; margin-bottom: 12px;">Failed to load niches</h3>
                <p style="color: rgba(255, 255, 255, 0.6); margin-bottom: 24px;">${error.message}</p>
                <button onclick="renderNichesPage()" class="btn-primary" style="
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #333333 0%, #1a1a1a 100%);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                ">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

async function showCreateNicheModal() {
    try {
        const user = await API.getCurrentUser();
        const plans = await API.getSubscriptionPlans();
        const currentPlan = plans.find(p => p.tier === user.tier);
        const niches = await API.getNiches();
        
        const maxNiches = currentPlan?.max_niches || 1;
        
        if (niches.length >= maxNiches) {
            alert(`You've reached the maximum of ${maxNiches} niches for your ${user.tier} plan. Upgrade to add more!`);
            if (window.openUpgradeModal) {
                window.openUpgradeModal();
            }
            return;
        }
        
        // Close any existing modal
        const existingModal = document.getElementById('createNicheModal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.id = 'createNicheModal';
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 11000;
            padding: 20px;
            box-sizing: border-box;
            backdrop-filter: blur(8px);
        `;
        
        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, rgba(16, 20, 36, 0.95) 0%, rgba(25, 30, 48, 0.95) 100%);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                padding: 40px;
                max-width: 540px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(20px);
            ">
                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🎯</div>
                    <h2 style="color: #FFFFFF; margin-bottom: 12px; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Create New Niche</h2>
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: 15px; line-height: 1.5;">Define your niche to start discovering tailored opportunities</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="color: rgba(255, 255, 255, 0.8); display: block; margin-bottom: 10px; font-size: 14px; font-weight: 600; letter-spacing: 0.3px;">Niche Name *</label>
                    <input type="text" id="nicheName" placeholder="e.g., Web3 Developer" style="
                        width: 100%;
                        padding: 14px 16px;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        border-radius: 12px;
                        color: #FFFFFF;
                        font-size: 15px;
                        box-sizing: border-box;
                        transition: all 0.3s ease;
                        font-family: inherit;
                    " onfocus="this.style.borderColor='rgba(255, 255, 255, 0.4)'; this.style.background='rgba(255, 255, 255, 0.08)'" onblur="this.style.borderColor='rgba(255, 255, 255, 0.15)'; this.style.background='rgba(255, 255, 255, 0.05)'">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="color: rgba(255, 255, 255, 0.8); display: block; margin-bottom: 10px; font-size: 14px; font-weight: 600; letter-spacing: 0.3px;">Description</label>
                    <textarea id="nicheDescription" placeholder="What makes this niche special?" style="
                        width: 100%;
                        padding: 14px 16px;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        border-radius: 12px;
                        color: #FFFFFF;
                        font-size: 15px;
                        box-sizing: border-box;
                        min-height: 100px;
                        resize: vertical;
                        transition: all 0.3s ease;
                        font-family: inherit;
                    " onfocus="this.style.borderColor='rgba(255, 255, 255, 0.4)'; this.style.background='rgba(255, 255, 255, 0.08)'" onblur="this.style.borderColor='rgba(255, 255, 255, 0.15)'; this.style.background='rgba(255, 255, 255, 0.05)'"></textarea>
                </div>
                
                <div style="margin-bottom: 32px;">
                    <label style="color: rgba(255, 255, 255, 0.8); display: block; margin-bottom: 10px; font-size: 14px; font-weight: 600; letter-spacing: 0.3px;">Keywords (comma-separated) *</label>
                    <input type="text" id="nicheKeywords" placeholder="react, web3, developer" style="
                        width: 100%;
                        padding: 14px 16px;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        border-radius: 12px;
                        color: #FFFFFF;
                        font-size: 15px;
                        box-sizing: border-box;
                        transition: all 0.3s ease;
                        font-family: inherit;
                    " onfocus="this.style.borderColor='rgba(255, 255, 255, 0.4)'; this.style.background='rgba(255, 255, 255, 0.08)'" onblur="this.style.borderColor='rgba(255, 255, 255, 0.15)'; this.style.background='rgba(255, 255, 255, 0.05)'">
                    <p style="color: rgba(255, 255, 255, 0.4); font-size: 12px; margin-top: 8px; line-height: 1.5;">Separate keywords with commas. Use 3-5 keywords for best results.</p>
                </div>
                
                <div style="display: flex; gap: 12px;">
                    <button onclick="closeCreateNicheModal()" style="
                        flex: 1;
                        padding: 14px 20px;
                        background: rgba(255, 255, 255, 0.08);
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        border-radius: 12px;
                        color: rgba(255, 255, 255, 0.8);
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 15px;
                        transition: all 0.3s ease;
                        font-family: inherit;
                    " onmouseover="this.style.background='rgba(255, 255, 255, 0.12)'; this.style.borderColor='rgba(255, 255, 255, 0.25)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.08)'; this.style.borderColor='rgba(255, 255, 255, 0.15)'">
                        Cancel
                    </button>
                    <button onclick="createNiche()" style="
                        flex: 1;
                        padding: 14px 20px;
                        background: linear-gradient(135deg, #333333 0%, #1a1a1a 100%);
                        border: none;
                        border-radius: 12px;
                        color: white;
                        cursor: pointer;
                        font-weight: 700;
                        font-size: 15px;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
                        font-family: inherit;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(0, 0, 0, 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(0, 0, 0, 0.4)'">
                        <i class="fas fa-plus"></i> Create Niche
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeCreateNicheModal();
            }
        });
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('nicheName').focus();
        }, 100);
        
    } catch (error) {
        console.error('Failed to show create niche modal:', error);
        alert('Error: ' + error.message);
    }
}

async function createNiche() {
    try {
        const name = document.getElementById('nicheName').value.trim();
        const description = document.getElementById('nicheDescription').value.trim();
        const keywords = document.getElementById('nicheKeywords').value.split(',').map(k => k.trim()).filter(k => k);
        
        if (!name || keywords.length === 0) {
            alert('Please enter a niche name and at least one keyword');
            return;
        }
        
        const response = await API.createNiche({
            name,
            description,
            keywords,
            platforms: ['Twitter/X', 'Reddit'],
            min_confidence: 70
        });
        
        closeCreateNicheModal();
        renderNichesPage();
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(34, 197, 94, 0.4);
            z-index: 12000;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        successMsg.innerHTML = `<i class="fas fa-check-circle"></i> Niche created successfully!`;
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.remove();
        }, 3000);
        
    } catch (error) {
        console.error('Failed to create niche:', error);
        alert('Failed to create niche: ' + error.message);
    }
}

function closeCreateNicheModal() {
    const modal = document.getElementById('createNicheModal');
    if (modal) modal.remove();
}

function editNiche(nicheId) {
    alert('Edit niche feature coming soon!');
}

async function confirmDeleteNiche(nicheId, nicheName) {
    if (!confirm(`Are you sure you want to delete "${nicheName}"? This cannot be undone.`)) {
        return;
    }
    
    try {
        await API.deleteNiche(nicheId);
        renderNichesPage();
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
            z-index: 12000;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 600;
        `;
        successMsg.innerHTML = `<i class="fas fa-trash"></i> Niche deleted successfully`;
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.remove();
        }, 3000);
    } catch (error) {
        console.error('Failed to delete niche:', error);
        alert('Failed to delete niche: ' + error.message);
    }
}

// Export functions
window.renderNichesPage = renderNichesPage;
window.showCreateNicheModal = showCreateNicheModal;
window.createNiche = createNiche;
window.closeCreateNicheModal = closeCreateNicheModal;
window.editNiche = editNiche;
window.confirmDeleteNiche = confirmDeleteNiche;
window.navigateToNiches = () => navigateToPage('niches');