/**
 * Admin Users Management Page
 * Displays all users with management capabilities
 */

async function loadUsersPage() {
    const adminContent = document.getElementById('adminContent');
    
    // Show loading state
    adminContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading users...</p>
        </div>
    `;

    try {
        // Fetch users list
        const response = await API.call('GET', '/api/admin/users');
        const users = Array.isArray(response) ? response : response?.users || [];

        let html = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">User Management</h2>
                <p style="color: rgba(255, 255, 255, 0.6); margin-top: 8px;">Manage system users and their access</p>
            </div>

            <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <input type="text" id="userSearchInput" placeholder="Search users by email or ID..." 
                        style="width: 100%; max-width: 400px; padding: 12px; background: rgba(255, 255, 255, 0.05); 
                        border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white;"
                        onkeyup="filterUsers()">
                </div>
                <button class="btn-primary" onclick="loadUsersPage()" style="padding: 12px 24px; background: rgba(59, 130, 246, 0.2); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-sync"></i> Refresh
                </button>
            </div>

            <div class="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Tier</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="usersTableBody">
                        ${users.length === 0 ? '<tr><td colspan="6" style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.5);">No users found</td></tr>' : ''}
                        ${users.map(user => renderUserRow(user)).join('')}
                    </tbody>
                </table>
            </div>
        `;

        adminContent.innerHTML = html;

        // Store users data for filtering
        window.allUsers = users;

    } catch (error) {
        console.error('Failed to load users:', error);
        adminContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #f87171; margin-bottom: 16px;"></i>
                <h3>Failed to Load Users</h3>
                <p>${error.message || 'An error occurred while loading users.'}</p>
                <button class="btn-primary" onclick="loadUsersPage()" style="margin-top: 16px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

/**
 * Render a user row in the table
 */
function renderUserRow(user) {
    // Handle both MongoDB _id and standard id field
    const userId = user._id || user.id || user.user_id || 'Unknown';
    const email = user.email || 'N/A';
    const status = user.is_suspended ? 'Suspended' : 'Active';
    const statusColor = user.is_suspended ? '#f87171' : '#4ade80';
    const tier = user.tier || user.subscription_tier || 'Free';
    const joinedDate = new Date(user.created_at || user.joined_date).toLocaleDateString();

    return `
        <tr>
            <td style="font-family: monospace; font-size: 12px;">${userId.substring(0, 12)}...</td>
            <td>${email}</td>
            <td>
                <span class="status-badge" style="background: rgba(${status === 'Suspended' ? '248, 113, 113' : '74, 222, 128'}, 0.2); color: ${statusColor};">
                    ${status}
                </span>
            </td>
            <td><strong>${tier}</strong></td>
            <td style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">${joinedDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-view" onclick="viewUserDetails('${userId}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    ${user.is_suspended ? `
                        <button class="btn-small btn-activate" onclick="activateUser('${userId}')">
                            <i class="fas fa-check"></i> Activate
                        </button>
                    ` : `
                        <button class="btn-small btn-suspend" onclick="suspendUserConfirm('${userId}')">
                            <i class="fas fa-ban"></i> Suspend
                        </button>
                    `}
                </div>
            </td>
        </tr>
    `;
}

/**
 * View user details modal
 */
async function viewUserDetails(userId) {
    const modal = document.getElementById('userDetailsModal');
    const modalContent = document.getElementById('userDetailsContent');

    // Show loading state
    modalContent.innerHTML = '<div class="loading-container"><div class="spinner"></div><p>Loading user details...</p></div>';
    modal.classList.add('active');

    try {
        const response = await API.call('GET', `/api/admin/users/${userId}`);
        
        // API returns {user: {...}, stats: {...}}
        const user = response.user || response;
        const stats = response.stats || {};

        const userId_val = user._id || user.id || user.user_id || 'N/A';
        const email = user.email || 'N/A';
        const tier = user.tier || user.subscription_tier || 'Free';
        const status = user.is_suspended ? 'Suspended' : 'Active';
        const joinedDate = user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A';

        let html = `
            <div class="form-group-admin">
                <label>User ID</label>
                <input type="text" value="${userId_val}" readonly>
            </div>
            <div class="form-group-admin">
                <label>Email</label>
                <input type="text" value="${email}" readonly>
            </div>
            <div class="form-group-admin">
                <label>Name</label>
                <input type="text" value="${user.name || 'N/A'}" readonly>
            </div>
            <div class="form-group-admin">
                <label>Current Tier</label>
                <input type="text" value="${tier}" readonly>
            </div>
            <div class="form-group-admin">
                <label>Select New Tier</label>
                <select id="newTierSelect" style="width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white;">
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                </select>
            </div>
            <div class="form-group-admin">
                <label>Status</label>
                <input type="text" value="${status}" readonly>
            </div>
            <div class="form-group-admin">
                <label>Joined Date</label>
                <input type="text" value="${joinedDate}" readonly>
            </div>
            <div class="form-group-admin">
                <label>Total API Calls</label>
                <input type="text" value="${user.total_api_calls || 0}" readonly>
            </div>
            <div class="form-group-admin">
                <label>User Stats</label>
                <input type="text" value="Niches: ${stats.niches || 0}, Opportunities: ${stats.opportunities || 0}, Scans: ${stats.scans || 0}" readonly>
            </div>
            <div style="display: flex; gap: 12px; margin-top: 24px;">
                <button onclick="closeUserDetailsModal()" class="btn-secondary" style="flex: 1; padding: 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: white; cursor: pointer; font-weight: 600;">
                    Close
                </button>
                <button onclick="updateUserTier('${userId}')" class="btn-primary" style="flex: 1; padding: 12px; background: rgba(59, 130, 246, 0.2); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; cursor: pointer; font-weight: 600;">
                    Update Tier
                </button>
            </div>
        `;

        modalContent.innerHTML = html;

    } catch (error) {
        modalContent.innerHTML = `
            <div class="error-state" style="text-align: center;">
                <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #f87171; margin-bottom: 16px;"></i>
                <h3>Failed to Load User Details</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

/**
 * Close user details modal
 */
function closeUserDetailsModal() {
    document.getElementById('userDetailsModal').classList.remove('active');
}

/**
 * Update user tier
 */
async function updateUserTier(userId) {
    const tierSelect = document.getElementById('newTierSelect');
    const newTier = tierSelect.value;
    const button = event.target;
    const originalHTML = button.innerHTML;

    try {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

        await API.call('PUT', `/api/admin/users/${userId}/tier`, { tier: newTier });

        button.innerHTML = '<i class="fas fa-check"></i> Updated!';
        setTimeout(() => {
            closeUserDetailsModal();
            loadUsersPage();
        }, 1500);

    } catch (error) {
        button.innerHTML = originalHTML;
        button.disabled = false;
        alert('Failed to update tier: ' + error.message);
    }
}

/**
 * Confirm suspend user
 */
function suspendUserConfirm(userId) {
    if (confirm('Are you sure you want to suspend this user? They will lose access to the platform.')) {
        suspendUser(userId);
    }
}

/**
 * Suspend user
 */
async function suspendUser(userId) {
    try {
        await API.call('POST', `/api/admin/users/${userId}/suspend`);
        alert('User suspended successfully');
        loadUsersPage();
    } catch (error) {
        alert('Failed to suspend user: ' + error.message);
    }
}

/**
 * Activate user
 */
async function activateUser(userId) {
    try {
        await API.call('POST', `/api/admin/users/${userId}/activate`);
        alert('User activated successfully');
        loadUsersPage();
    } catch (error) {
        alert('Failed to activate user: ' + error.message);
    }
}

/**
 * Filter users by search term
 */
function filterUsers() {
    const searchInput = document.getElementById('userSearchInput').value.toLowerCase();
    const tableBody = document.getElementById('usersTableBody');

    if (!window.allUsers) return;

    const filtered = window.allUsers.filter(user => {
        const email = (user.email || '').toLowerCase();
        const userId = (user.id || user.user_id || '').toLowerCase();
        return email.includes(searchInput) || userId.includes(searchInput);
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.5);">No users found matching your search</td></tr>';
    } else {
        tableBody.innerHTML = filtered.map(user => renderUserRow(user)).join('');
    }
}
