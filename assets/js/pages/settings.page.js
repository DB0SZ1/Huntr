/**
 * settings.page.js - Settings page rendering
 */

async function renderSettingsPage() {
    const mainContent = document.querySelector('.dashboard-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading settings...</p>
        </div>
    `;
    
    try {
        const user = await API.getCurrentUser();
        const currentTheme = window.getTheme?.() || 'system';
        
        let html = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">Settings</h2>
                <div class="breadcrumb">Home / Settings</div>
            </div>

            <div class="settings-container">
                <div class="glass-card">
                    <h3 class="card-title" style="margin-bottom: 24px;">Profile Settings</h3>
                    <div class="settings-form">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" class="form-input" id="settingsName" value="${user.name || ''}">
                        </div>
                        <div class="form-group">
                            <label>Email Address</label>
                            <input type="email" class="form-input" value="${user.email || ''}" disabled>
                            <small>Email cannot be changed (linked to Google account)</small>
                        </div>
                        <div class="form-group">
                            <label>WhatsApp Number</label>
                            <input type="tel" class="form-input" id="settingsWhatsapp" 
                                   value="${user.settings?.whatsapp_number || ''}" 
                                   placeholder="+234 XXX XXX XXXX">
                        </div>
                    </div>
                </div>

                <div class="glass-card" style="margin-top: 24px;">
                    <h3 class="card-title" style="margin-bottom: 24px;">Appearance</h3>
                    <div class="settings-form">
                        <div class="form-group">
                            <label>Theme Preference</label>
                            <select class="form-input" id="themePreference" onchange="changeTheme(this.value)">
                                <option value="system" ${currentTheme === 'system' ? 'selected' : ''}>System Default</option>
                                <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>Light Mode</option>
                                <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>Dark Mode</option>
                            </select>
                            <small>Choose how the interface should appear</small>
                        </div>
                    </div>
                </div>

                <div class="glass-card" style="margin-top: 24px;">
                    <h3 class="card-title" style="margin-bottom: 24px;">Account & Billing</h3>
                    <div class="settings-info">
                        <div class="info-row">
                            <span>Current Plan</span>
                            <strong style="text-transform: capitalize;">${user.tier || 'free'}</strong>
                        </div>
                        <div class="info-row">
                            <span>Member Since</span>
                            <strong>${new Date(user.created_at).toLocaleDateString()}</strong>
                        </div>
                        <div class="info-row">
                            <span>Subscription Status</span>
                            <strong style="text-transform: capitalize;">${user.subscription?.status || 'Free'}</strong>
                        </div>
                        ${user.tier !== 'free' ? `
                        <div style="margin-top: 16px; display: flex; gap: 12px;">
                            ${user.tier !== 'premium' ? `
                            <button class="upgrade-settings-btn" onclick="openUpgradeModal()">
                                <i class="fas fa-crown"></i> Upgrade Plan
                            </button>
                            ` : ''}
                            <button class="cancel-subscription-btn" onclick="cancelSubscriptionClick()" style="
                                background: rgba(248, 113, 113, 0.15);
                                color: #f87171;
                                border: 1px solid rgba(248, 113, 113, 0.3);
                                padding: 12px 20px;
                                border-radius: 12px;
                                cursor: pointer;
                                font-weight: 600;
                                transition: all 0.3s ease;
                                flex: 1;
                            ">
                                <i class="fas fa-times"></i> Cancel Subscription
                            </button>
                        </div>
                        ` : `
                        <button class="upgrade-settings-btn" onclick="openUpgradeModal()">
                            <i class="fas fa-crown"></i> Upgrade Plan
                        </button>
                        `}
                    </div>
                </div>

                <button class="save-settings-btn" onclick="saveSettings()">
                    <i class="fas fa-save"></i> Save Changes
                </button>
            </div>
        `;
        
        mainContent.innerHTML = html;
        
    } catch (error) {
        console.error('Failed to load settings:', error);
        mainContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load settings</h3>
                <p>${error.message}</p>
                <button onclick="renderSettingsPage()" class="btn-primary">Retry</button>
            </div>
        `;
    }
}

function changeTheme(theme) {
    window.setTheme?.(theme);
}

async function saveSettings() {
    const name = document.getElementById('settingsName')?.value || '';
    const whatsapp = document.getElementById('settingsWhatsapp')?.value || '';
    
    try {
        await API.updateProfile({ name, whatsapp_number: whatsapp });
        showToast('Settings saved successfully!', 'success');
    } catch (error) {
        console.error('Failed to save settings:', error);
        showToast('Failed to save settings: ' + error.message, 'error');
    }
}

async function cancelSubscriptionClick() {
    if (!confirm('Are you sure you want to cancel your subscription? You will remain active until the end of your billing period.')) {
        return;
    }
    
    try {
        const result = await API.cancelSubscription();
        showToast('Subscription cancelled successfully', 'success');
        await renderSettingsPage();
    } catch (error) {
        console.error('Failed to cancel subscription:', error);
        showToast('Failed to cancel subscription: ' + (error.message || 'Unknown error'), 'error');
    }
}

window.renderSettingsPage = renderSettingsPage;
window.changeTheme = changeTheme;
window.saveSettings = saveSettings;
window.cancelSubscriptionClick = cancelSubscriptionClick;
