/**
 * API Utilities
 * Centralized API communication with authentication
 */

const API_BASE_URL = 'https://huntr-backend.onrender.com';

// Cache Manager with TTL (Time-To-Live)
const CacheManager = {
    CACHE_TTL: 10 * 60 * 1000, // 10 minutes in milliseconds
    
    getCacheKey(endpoint) {
        return `cache_${endpoint}`;
    },
    
    getTTLKey(endpoint) {
        return `cache_ttl_${endpoint}`;
    },
    
    set(endpoint, data) {
        try {
            const cacheKey = this.getCacheKey(endpoint);
            const ttlKey = this.getTTLKey(endpoint);
            localStorage.setItem(cacheKey, JSON.stringify(data));
            localStorage.setItem(ttlKey, Date.now().toString());
        } catch (e) {
            console.warn('Cache write failed:', e);
        }
    },
    
    get(endpoint) {
        try {
            const cacheKey = this.getCacheKey(endpoint);
            const ttlKey = this.getTTLKey(endpoint);
            
            const cachedTime = localStorage.getItem(ttlKey);
            if (!cachedTime) return null;
            
            // Check if cache expired
            if (Date.now() - parseInt(cachedTime) > this.CACHE_TTL) {
                this.clear(endpoint);
                return null;
            }
            
            const cached = localStorage.getItem(cacheKey);
            return cached ? JSON.parse(cached) : null;
        } catch (e) {
            console.warn('Cache read failed:', e);
            return null;
        }
    },
    
    clear(endpoint) {
        try {
            localStorage.removeItem(this.getCacheKey(endpoint));
            localStorage.removeItem(this.getTTLKey(endpoint));
        } catch (e) {
            console.warn('Cache clear failed:', e);
        }
    },
    
    clearAll() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('cache_')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (e) {
            console.warn('Cache clear all failed:', e);
        }
    }
};

const TokenManager = {
    getAccessToken() {
        return localStorage.getItem('access_token');
    },
    
    getRefreshToken() {
        return localStorage.getItem('refresh_token');
    },
    
    setTokens(accessToken, refreshToken) {
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
        }
    },
    
    clearTokens() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },
    
    isAuthenticated() {
        return !!this.getAccessToken();
    }
};

// Public (unauthenticated) fetch for landing pages
async function publicFetch(endpoint, options = {}) {
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            console.error('❌ Public API Error:', {
                status: response.status,
                statusText: response.statusText,
                detail: data.detail,
                error: data.error,
                message: data.message
            });
            throw new Error(data.detail || data.error || data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('Public API request failed:', error);
        throw error;
    }
}

// Authenticated Fetch Wrapper
async function authenticatedFetch(endpoint, options = {}) {
    const accessToken = TokenManager.getAccessToken();
    
    if (!accessToken) {
        throw new Error('Not authenticated');
    }
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // Handle token expiration
        if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                // Retry request with new token
                config.headers['Authorization'] = `Bearer ${TokenManager.getAccessToken()}`;
                return await fetch(`${API_BASE_URL}${endpoint}`, config);
            } else {
                // Refresh failed, redirect to login
                redirectToLogin();
                throw new Error('Authentication failed');
            }
        }
        
        // Parse response
        const data = await response.json();
        
        if (!response.ok) {
            console.error('❌ API Error:', {
                status: response.status,
                statusText: response.statusText,
                detail: data.detail,
                error: data.error,
                message: data.message,
                fullResponse: data
            });
            // Create error with full data attached
            const error = new Error(data.detail || data.error || data.message || 'Request failed');
            // Attach all response data to error object
            Object.assign(error, data);
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Refresh Access Token
async function refreshAccessToken() {
    const refreshToken = TokenManager.getRefreshToken();
    
    if (!refreshToken) {
        return false;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh_token: refreshToken })
        });
        
        if (response.ok) {
            const data = await response.json();
            TokenManager.setTokens(data.access_token);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
}

// Require Authentication
function requireAuth() {
    if (!TokenManager.isAuthenticated()) {
        redirectToLogin();
        return false;
    }
    return true;
}

// Redirect to Login
function redirectToLogin() {
    TokenManager.clearTokens();
    window.location.href = '/auth.html';
}

// Redirect to Dashboard
function redirectToDashboard() {
    window.location.href = '/dashboard.html';
}

// API Methods
const API = {
    // PUBLIC ENDPOINTS (no auth required)
    async getPublicPricingPlans() {
        try {
            // Check cache first
            const cached = CacheManager.get('/api/pricing/plans');
            if (cached !== null) {
                return cached;
            }
            
            // Use public fetch (no auth)
            const response = await publicFetch('/api/pricing/plans');
            
            // Normalize response shape
            let plans = [];
            if (response && response.data) {
                if (typeof response.data === 'object' && !Array.isArray(response.data)) {
                    plans = Object.values(response.data);
                } else if (Array.isArray(response.data)) {
                    plans = response.data;
                }
            }
            
            // Fallback: check if response itself is the plans object
            if (plans.length === 0 && response && typeof response === 'object') {
                if (response.free || response.pro || response.premium || response.ultra) {
                    plans = Object.values(response);
                }
            }
            
            // Cache the result
            CacheManager.set('/api/pricing/plans', plans);
            return plans;
        } catch (error) {
            console.error('Failed to fetch public pricing plans:', error);
            throw error;
        }
    },
    
    // Auth
    async getCurrentUser() {
        // Check cache first
        const cached = CacheManager.get('/api/auth/me');
        if (cached !== null) {
            return cached;
        }
        
        const user = await authenticatedFetch('/api/auth/me');
        CacheManager.set('/api/auth/me', user);
        return user;
    },
    
    async updateProfile(data) {
        return await authenticatedFetch('/api/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    async saveOnboarding(data) {
        return await authenticatedFetch('/api/auth/onboarding', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async checkOnboardingStatus() {
        return await authenticatedFetch('/api/auth/onboarding-status');
    },
    
    async logout() {
        try {
            await authenticatedFetch('/api/auth/logout', { method: 'POST' });
        } finally {
            TokenManager.clearTokens();
            redirectToLogin();
        }
    },
    
    // Payments
    async getSubscriptionPlans() {
        // Check cache first
        const cached = CacheManager.get('/api/payments/plans');
        if (cached !== null) {
            return cached;
        }
        
        // Normalize response shape: backend may return { plans: [...] } or an array
        const res = await authenticatedFetch('/api/payments/plans');
        let plans = [];
        if (!res) plans = [];
        else if (Array.isArray(res)) plans = res;
        else if (res.plans && Array.isArray(res.plans)) plans = res.plans;
        // If backend returns object keyed by tiers, convert to array
        else if (typeof res === 'object') plans = Object.values(res);
        
        // Cache the result
        CacheManager.set('/api/payments/plans', plans);
        return plans;
    },
    
    async initializePayment(planId) {
        console.log('🔄 Initializing payment with plan_id:', planId);
        
        // Try with plan_id first, backend might accept either plan_id or tier
        const payload = { 
            plan_id: planId,
            tier: planId  // Add tier as alternative
        };
        console.log('📤 Sending payload:', payload);
        
        const response = await authenticatedFetch('/api/payments/initialize', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        console.log('✅ Payment initialization response:', response);
        return response;
    },
    
    async verifyPayment(reference) {
        return await authenticatedFetch(`/api/payments/verify/${reference}`);
    },
    
    async getCurrentSubscription() {
        return await authenticatedFetch('/api/payments/subscription/current');
    },
    
    async cancelSubscription() {
        return await authenticatedFetch('/api/payments/subscription/cancel', {
            method: 'POST'
        });
    },
    
    // Opportunities
    async getOpportunities(page = 1, perPage = 20, filters = {}) {
        let url = `/api/opportunities?page=${page}&per_page=${perPage}`;
        
        if (filters.viewed !== undefined) {
            url += `&viewed=${filters.viewed}`;
        }
        if (filters.saved !== undefined) {
            url += `&saved=${filters.saved}`;
        }
        if (filters.platform) {
            url += `&platform=${encodeURIComponent(filters.platform)}`;
        }
        
        return await authenticatedFetch(url);
    },
    
    async getOpportunity(opportunityId) {
        return await authenticatedFetch(`/api/opportunities/${opportunityId}`);
    },
    
    async saveOpportunity(opportunityId) {
        return await authenticatedFetch(`/api/opportunities/${opportunityId}/save`, {
            method: 'POST'
        });
    },
    
    async markApplied(opportunityId) {
        return await authenticatedFetch(`/api/opportunities/${opportunityId}/apply`, {
            method: 'POST'
        });
    },
    
    async deleteOpportunity(opportunityId) {
        return await authenticatedFetch(`/api/opportunities/${opportunityId}`, {
            method: 'DELETE'
        });
    },
    
    async getOpportunitiesStats() {
        return await authenticatedFetch('/api/opportunities/stats/summary');
    },
    
    async getAvailablePlatforms() {
        return await authenticatedFetch('/api/opportunities/platforms/available');
    },

    // Scans
    async startScan() {
        return await authenticatedFetch('/api/scans/start', { method: 'POST' });
    },

    async getScanStatus(scanId) {
        return await authenticatedFetch(`/api/scans/status/${scanId}`);
    },

    async getScanHistory() {
        return await authenticatedFetch('/api/scans/history');
    },
    
    // Niches
    async getNiches() {
        // Check cache first
        const cached = CacheManager.get('/api/niches');
        if (cached !== null) {
            return cached;
        }
        
        // Normalize response: backend may return { niches: [...] } or array directly
        const res = await authenticatedFetch('/api/niches');
        let niches = [];
        if (!res) niches = [];
        else if (Array.isArray(res)) niches = res;
        else if (res.niches && Array.isArray(res.niches)) niches = res.niches;
        // If backend returns object keyed by IDs, convert to array
        else if (typeof res === 'object') niches = Object.values(res);
        
        // Cache the result
        CacheManager.set('/api/niches', niches);
        return niches;
    },
    
    async createNiche(data) {
        const result = await authenticatedFetch('/api/niches', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        // Invalidate cache when niche is created
        CacheManager.clear('/api/niches');
        return result;
    },
    
    async updateNiche(nicheId, data) {
        const result = await authenticatedFetch(`/api/niches/${nicheId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        // Invalidate cache when niche is updated
        CacheManager.clear('/api/niches');
        return result;
    },
    
    async deleteNiche(nicheId) {
        const result = await authenticatedFetch(`/api/niches/${nicheId}`, {
            method: 'DELETE'
        });
        // Invalidate cache when niche is deleted
        CacheManager.clear('/api/niches');
        return result;
    },
    
    async toggleNiche(nicheId) {
        return await authenticatedFetch(`/api/niches/${nicheId}/toggle`, {
            method: 'POST'
        });
    },
    
    async getNicheStats(nicheId) {
        return await authenticatedFetch(`/api/niches/${nicheId}/stats`);
    },
    
    // Dashboard endpoints
    async getDashboardStats() {
        return await authenticatedFetch('/api/dashboard/stats');
    },
    
    async getRecentActivity(limit = 10) {
        return await authenticatedFetch(`/api/dashboard/activity?limit=${limit}`);
    },
    
    async getTopKeywords(limit = 10) {
        return await authenticatedFetch(`/api/dashboard/keywords?limit=${limit}`);
    },
    
    async getSignupsChartData() {
        return await authenticatedFetch('/api/dashboard/charts/signups');
    },
    
    async getPricingConfig() {
        return await authenticatedFetch('/api/dashboard/config/pricing');
    },
    
    // Credits System
    async getCredits() {
        return await authenticatedFetch('/api/credits/balance');
    },
    
    async getRealtimeBalance() {
        return await authenticatedFetch('/api/credits/balance/realtime', {
            method: 'GET',
            cache: 'no-store' // Prevent caching for realtime data
        });
    },
    
    async checkCredits(action) {
        return await authenticatedFetch('/api/credits/check/' + action, {
            method: 'POST'
        });
    },
    
    async getCreditsCosts() {
        return await authenticatedFetch('/api/credits/costs');
    },
    
    async getCreditsTierLimits() {
        return await authenticatedFetch('/api/credits/tier-limits');
    },
    
    async getCreditsHistory(limit = 20) {
        return await authenticatedFetch(`/api/credits/history?limit=${limit}`);
    },
    
    async getCreditsSummary() {
        return await authenticatedFetch('/api/credits/summary');
    },
    
    // Promotions API Methods
    async importPromoUsers(formData) {
        const token = TokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/promo/import-csv?trial_duration_days=14&trial_tier=pro`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        return handleResponse(response);
    },
    
    async getActiveTrials(status = 'active') {
        return await authenticatedFetch(`/api/promo/active-trials?status=${status}`);
    },
    
    async getUserTrial(userId) {
        return await authenticatedFetch(`/api/promo/user/${userId}/trial`);
    },
    
    async extendTrial(userId, additionalDays, reason = '') {
        return await authenticatedFetch(`/api/promo/extend/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ additional_days: additionalDays, reason })
        });
    },
    
    async cancelTrial(userId) {
        return await authenticatedFetch(`/api/promo/cancel/${userId}`, {
            method: 'POST'
        });
    },
    
    async checkTrialExpirations() {
        return await authenticatedFetch('/api/promo/check-expirations', {
            method: 'POST'
        });
    },
    
    // Follow/Social API Methods
    async checkFollowStatus() {
        return await authenticatedFetch('/api/auth/follow/status', {
            method: 'GET'
        });
    },
    
    async markFollowed() {
        return await authenticatedFetch('/api/auth/follow/mark-followed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
    },
    
    async dismissFollowModal() {
        return await authenticatedFetch('/api/auth/follow/dismiss-modal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
    },
    
    // Generic API call method for admin and other flexible endpoints
    async call(method, endpoint, body = null) {
        const options = { method };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        return await authenticatedFetch(endpoint, options);
    },

    // File Upload Method (for CV analysis, proof of work, etc.)
    async uploadFile(endpoint, formData) {
        const accessToken = TokenManager.getAccessToken();
        
        if (!accessToken) {
            throw new Error('Not authenticated');
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                    // CRITICAL: Don't set Content-Type - browser handles it with boundary
                },
                body: formData
            });
            
            // Handle token expiration
            if (response.status === 401) {
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    // Retry with new token
                    return await fetch(`${API_BASE_URL}${endpoint}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${TokenManager.getAccessToken()}`
                        },
                        body: formData
                    });
                } else {
                    redirectToLogin();
                    throw new Error('Authentication failed');
                }
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('❌ File Upload Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    detail: data.detail,
                    error: data.error,
                    message: data.message
                });
                throw new Error(data.detail || data.error || data.message || 'Upload failed');
            }
            
            return data;
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    }
};



// Error Handler
function handleAPIError(error, userMessage = 'An error occurred') {
    console.error('API Error:', error);
    
    // Show user-friendly message
    if (window.showNotification) {
        window.showNotification(userMessage, 'error');
    } else {
        alert(userMessage);
    }
}

// Export
window.API = API;
window.publicFetch = publicFetch;
window.TokenManager = TokenManager;
window.requireAuth = requireAuth;
window.redirectToLogin = redirectToLogin;
window.redirectToDashboard = redirectToDashboard;
window.handleAPIError = handleAPIError;

