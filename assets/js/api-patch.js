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
    }
};
