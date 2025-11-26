/**
 * filters.page.js - Filters & Niches page rendering
 */

async function renderFiltersPage() {
    const mainContent = document.querySelector('.dashboard-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading filters...</p>
        </div>
    `;
    
    try {
        const niches = await API.getNiches();
        const user = await API.getCurrentUser();
        
        let html = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">Filters & Niches</h2>
                <div class="breadcrumb">Home / Filters</div>
            </div>

            <div class="filters-container">
                <div class="glass-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <h3 class="card-title">Your Niches</h3>
                        <button onclick="showCreateNicheModal()" class="btn-primary">
                            <i class="fas fa-plus"></i> Add Niche
                        </button>
                    </div>
                    <div class="niches-list">
        `;
        
        if (niches.length === 0) {
            html += `
                <div class="empty-state">
                    <p>No niches configured yet. Add your first niche to start finding opportunities.</p>
                </div>
            `;
        } else {
            niches.forEach(niche => {
                html += `
                    <div class="niche-item ${niche.is_active ? 'active' : 'inactive'}">
                        <div class="niche-info">
                            <h4>${niche.name}</h4>
                            <p>${niche.description || 'No description'}</p>
                            <div class="niche-keywords">
                                ${niche.keywords.map(kw => `<span class="keyword-tag">${kw}</span>`).join('')}
                            </div>
                            <div class="niche-stats">
                                <span><i class="fas fa-bullseye"></i> ${niche.total_matches || 0} matches</span>
                                <span><i class="fas fa-layer-group"></i> ${niche.platforms?.length || 0} platforms</span>
                            </div>
                        </div>
                        <div class="niche-actions">
                            <button onclick="toggleNiche('${niche._id}')" class="btn-icon" title="${niche.is_active ? 'Deactivate' : 'Activate'}">
                                <i class="fas fa-${niche.is_active ? 'pause' : 'play'}"></i>
                            </button>
                            <button onclick="editNiche('${niche._id}')" class="btn-icon" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteNiche('${niche._id}')" class="btn-icon btn-danger" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        html += `
                    </div>
                    <div class="niche-limit-info">
                        <span>Niches used: ${niches.length} / ∞</span>
                    </div>
                </div>

                <div class="glass-card" style="margin-top: 24px;">
                    <h3 class="card-title" style="margin-bottom: 24px;">Notification Settings</h3>
                    <div class="filter-options">
                        <label class="filter-checkbox">
                            <input type="checkbox" ${user.settings?.whatsapp_notifications ? 'checked' : ''} 
                                   onchange="updateNotificationSetting('whatsapp', this.checked)">
                            <span>WhatsApp Notifications</span>
                        </label>
                        <label class="filter-checkbox">
                            <input type="checkbox" ${user.settings?.email_notifications ? 'checked' : ''} 
                                   onchange="updateNotificationSetting('email', this.checked)">
                            <span>Email Alerts</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
        
        mainContent.innerHTML = html;
        
    } catch (error) {
        console.error('Failed to load filters:', error);
        mainContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load filters</h3>
                <p>${error.message}</p>
                <button onclick="renderFiltersPage()" class="btn-primary">Retry</button>
            </div>
        `;
    }
}

async function toggleNiche(nicheId) {
    try {
        await API.toggleNiche(nicheId);
        showToast('Niche toggled successfully', 'success');
        await renderFiltersPage();
    } catch (error) {
        console.error('Failed to toggle niche:', error);
        showToast('Failed to toggle niche: ' + error.message, 'error');
    }
}

async function deleteNiche(nicheId) {
    if (!confirm('Are you sure you want to delete this niche?')) return;
    
    try {
        await API.deleteNiche(nicheId);
        showToast('Niche deleted successfully', 'success');
        await renderFiltersPage();
    } catch (error) {
        console.error('Failed to delete niche:', error);
        showToast('Failed to delete niche: ' + error.message, 'error');
    }
}

async function updateNotificationSetting(type, enabled) {
    try {
        const updateData = {};
        if (type === 'whatsapp') {
            updateData.whatsapp_notifications = enabled;
        } else if (type === 'email') {
            updateData.email_notifications = enabled;
        }
        
        await API.updateProfile(updateData);
        showToast('Notification settings updated', 'success');
    } catch (error) {
        console.error('Failed to update notification setting:', error);
        showToast('Failed to update settings: ' + error.message, 'error');
    }
}

window.renderFiltersPage = renderFiltersPage;
window.toggleNiche = toggleNiche;
window.deleteNiche = deleteNiche;
window.updateNotificationSetting = updateNotificationSetting;
