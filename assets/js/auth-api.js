/**
 * Authentication API Utilities
 * Handles all API calls for authentication endpoints
 */

const API_BASE_URL = 'https://huntr-backend.onrender.com';

// ============================================================================
// SIGNUP / REGISTRATION
// ============================================================================

/**
 * Sign up with email and password
 * @param {Object} credentials - {email, password, name}
 * @returns {Promise} Response from server
 */
async function signupUser(credentials) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
                name: credentials.name
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Signup failed');
        }

        return data;
    } catch (error) {
        console.error('Signup API Error:', error);
        throw error;
    }
}

// ============================================================================
// LOGIN
// ============================================================================

/**
 * Login with email and password
 * @param {Object} credentials - {email, password}
 * @returns {Promise} Response with access_token and refresh_token
 */
async function loginUser(credentials) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Login failed');
        }

        // Store tokens
        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
        }
        if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token);
        }
        localStorage.setItem('is_authenticated', 'true');

        return data;
    } catch (error) {
        console.error('Login API Error:', error);
        throw error;
    }
}

// ============================================================================
// EMAIL VERIFICATION
// ============================================================================

/**
 * Verify email with token
 * @param {string} token - Email verification token
 * @returns {Promise} Response from server
 */
async function verifyEmail(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: token
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Email verification failed');
        }

        // Store tokens if returned
        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
        }
        if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token);
        }
        localStorage.setItem('is_authenticated', 'true');

        return data;
    } catch (error) {
        console.error('Email Verification API Error:', error);
        throw error;
    }
}

// ============================================================================
// PASSWORD RESET
// ============================================================================

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise} Response from server
 */
async function forgotPassword(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Password reset request failed');
        }

        return data;
    } catch (error) {
        console.error('Forgot Password API Error:', error);
        throw error;
    }
}

/**
 * Reset password with token
 * @param {Object} resetData - {token, new_password}
 * @returns {Promise} Response from server
 */
async function resetPassword(resetData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: resetData.token,
                new_password: resetData.new_password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Password reset failed');
        }

        return data;
    } catch (error) {
        console.error('Reset Password API Error:', error);
        throw error;
    }
}

// ============================================================================
// CHANGE PASSWORD
// ============================================================================

/**
 * Change password for authenticated user
 * @param {Object} passwordData - {old_password, new_password}
 * @returns {Promise} Response from server
 */
async function changePassword(passwordData) {
    try {
        const accessToken = localStorage.getItem('access_token');
        
        if (!accessToken) {
            throw new Error('Not authenticated. Please login first.');
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                old_password: passwordData.old_password,
                new_password: passwordData.new_password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Password change failed');
        }

        return data;
    } catch (error) {
        console.error('Change Password API Error:', error);
        throw error;
    }
}

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

/**
 * Get current access token
 * @returns {string|null} Access token or null
 */
function getAccessToken() {
    return localStorage.getItem('access_token');
}

/**
 * Get current refresh token
 * @returns {string|null} Refresh token or null
 */
function getRefreshToken() {
    return localStorage.getItem('refresh_token');
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
function isAuthenticated() {
    return !!localStorage.getItem('access_token') && localStorage.getItem('is_authenticated') === 'true';
}

/**
 * Logout user and clear tokens
 */
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('is_authenticated');
    window.location.href = '/auth.html';
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get authorization header for API calls
 * @returns {Object} Header object with authorization
 */
function getAuthHeader() {
    const token = getAccessToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}
