/**
 * pages.modals.js - Modal and opportunity handling
 * Shared modal and user action functions
 */

// ========================= OPPORTUNITY MODAL =========================
async function openOpportunityModal(opportunityId) {
    try {
        const data = await API.getOpportunity(opportunityId);
        const opportunity = data.opportunity;
        currentOpportunityData = opportunity;
        
        const modalHTML = `
            <div class="modal-overlay opportunity-modal active" id="opportunityModal">
                <div class="modal-content opportunity-modal-content">
                    <button class="modal-close" onclick="closeOpportunityModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="opp-modal-header">
                        <div class="opp-modal-platform">${opportunity.platform}</div>
                        <h2 class="opp-modal-title">${opportunity.title}</h2>
                        <div class="opp-modal-company">${opportunity.contact || 'Contact available'}</div>
                    </div>

                    <div class="opp-modal-meta">
                        <div class="opp-modal-meta-item">
                            <i class="fas fa-chart-line"></i>
                            <span>${opportunity.match_data?.confidence || 0}% match</span>
                        </div>
                        <div class="opp-modal-meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${getTimeAgo(new Date(opportunity.created_at))}</span>
                        </div>
                    </div>

                    <div class="opp-modal-section">
                        <h3>Description</h3>
                        <p>${opportunity.description || 'No description provided'}</p>
                    </div>

                    ${opportunity.metadata?.requirements ? `
                    <div class="opp-modal-section">
                        <h3>Requirements</h3>
                        <ul>
                            ${opportunity.metadata.requirements.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}

                    <div class="opp-modal-actions">
                        <button class="opp-apply-btn" onclick="window.open('${opportunity.url}', '_blank')">
                            <i class="fas fa-external-link-alt"></i> View Opportunity
                        </button>
                        <button class="opp-save-btn" onclick="saveOpportunity('${opportunity._id}')">
                            <i class="fas fa-bookmark"></i> ${opportunity.match_data?.saved ? 'Unsave' : 'Save'}
                        </button>
                        <button class="opp-apply-btn" onclick="markAsApplied('${opportunity._id}')">
                            <i class="fas fa-check"></i> Mark as Applied
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
    } catch (error) {
        console.error('Failed to load opportunity:', error);
        showToast('Failed to load opportunity: ' + error.message, 'error');
    }
}

function closeOpportunityModal() {
    const modal = document.getElementById('opportunityModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

async function saveOpportunity(opportunityId) {
    try {
        await API.saveOpportunity(opportunityId);
        showToast('Opportunity saved successfully!', 'success');
        closeOpportunityModal();
        if (currentPage === 'opportunities') {
            await renderOpportunitiesPage();
        }
    } catch (error) {
        console.error('Failed to save opportunity:', error);
        showToast('Failed to save opportunity: ' + error.message, 'error');
    }
}

async function markAsApplied(opportunityId) {
    try {
        await API.markApplied(opportunityId);
        showToast('Marked as applied!', 'success');
        closeOpportunityModal();
        if (currentPage === 'opportunities') {
            await renderOpportunitiesPage();
        }
    } catch (error) {
        console.error('Failed to mark as applied:', error);
        showToast('Failed to mark as applied: ' + error.message, 'error');
    }
}

// ========================= USER FUNCTIONS =========================
async function logoutUser() {
    try {
        await API.call('POST', '/api/auth/logout');
    } catch (error) {
        console.warn('Logout API call failed:', error);
    } finally {
        // Clear local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('is_admin');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_tier');
        localStorage.removeItem('user_name');
        
        // Redirect to auth page
        window.location.href = '/auth.html';
    }
}

function openUpgradeModal() {
    const upgradeModal = document.getElementById('upgradeModal');
    if (upgradeModal) {
        upgradeModal.classList.add('active');
    }
}

// ========================= EXPORTS =========================
window.openOpportunityModal = openOpportunityModal;
window.closeOpportunityModal = closeOpportunityModal;
window.saveOpportunity = saveOpportunity;
window.markAsApplied = markAsApplied;
window.logoutUser = logoutUser;
window.openUpgradeModal = openUpgradeModal;
