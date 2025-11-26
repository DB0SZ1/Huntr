/**
 * response-parser.js - Universal API Response Parser
 * Handles inconsistent API response formats and normalizes data
 */

const ResponseParser = {
    /**
     * Parse array response from various formats
     * Handles: direct arrays, { data: [] }, { items: [] }, { [key]: [] }, etc.
     */
    parseArray(response, fallback = []) {
        if (!response) return fallback;
        
        // Direct array
        if (Array.isArray(response)) {
            return response;
        }
        
        // Common array keys
        const arrayKeys = ['data', 'items', 'results', 'opportunities', 'niches', 
                          'gigs', 'activities', 'keywords', 'scans', 'users'];
        
        for (const key of arrayKeys) {
            if (response[key] && Array.isArray(response[key])) {
                return response[key];
            }
        }
        
        // Object with numeric or ID keys - convert to array
        if (typeof response === 'object') {
            const values = Object.values(response);
            if (values.length > 0 && Array.isArray(values[0])) {
                return values[0];
            }
            // Check if values themselves are the items
            if (values.length > 0 && typeof values[0] === 'object') {
                return values;
            }
        }
        
        console.warn('Could not parse array from response:', response);
        return fallback;
    },

    /**
     * Parse pagination metadata
     */
    parsePagination(response, defaultPage = 1, defaultLimit = 20) {
        if (!response) {
            return { page: defaultPage, per_page: defaultLimit, total: 0 };
        }

        // Direct pagination object
        if (response.pagination) {
            return {
                page: response.pagination.page || defaultPage,
                per_page: response.pagination.per_page || response.pagination.limit || defaultLimit,
                total: response.pagination.total || 0
            };
        }

        // Meta object
        if (response.meta) {
            return {
                page: response.meta.page || response.meta.current_page || defaultPage,
                per_page: response.meta.per_page || response.meta.limit || defaultLimit,
                total: response.meta.total || response.meta.total_count || 0
            };
        }

        // Flat structure
        return {
            page: response.page || defaultPage,
            per_page: response.per_page || response.limit || defaultLimit,
            total: response.total || response.count || 0
        };
    },

    /**
     * Parse opportunities response
     */
    parseOpportunities(response) {
        const opportunities = this.parseArray(response);
        const pagination = this.parsePagination(response);
        
        return {
            opportunities: opportunities.map(opp => this.normalizeOpportunity(opp)),
            pagination
        };
    },

    /**
     * Normalize single opportunity object
     */
    normalizeOpportunity(opp) {
        if (!opp) return null;

        return {
            _id: opp._id || opp.id || '',
            title: opp.title || 'Untitled Opportunity',
            platform: opp.platform || 'Unknown',
            confidence: opp.confidence || opp.match_score || 0,
            saved: opp.saved || opp.is_saved || false,
            applied: opp.applied || opp.has_applied || false,
            viewed_at: opp.viewed_at || opp.created_at || new Date().toISOString(),
            sent_at: opp.sent_at || opp.created_at || new Date().toISOString(),
            created_at: opp.created_at || new Date().toISOString(),
            ...opp // Keep other fields
        };
    },

    /**
     * Parse niches response
     */
    parseNiches(response) {
        const niches = this.parseArray(response);
        
        return niches.map(niche => this.normalizeNiche(niche));
    },

    /**
     * Normalize single niche object
     */
    normalizeNiche(niche) {
        if (!niche) return null;

        return {
            _id: niche._id || niche.id || '',
            name: niche.name || 'Unnamed Niche',
            description: niche.description || '',
            keywords: niche.keywords || [],
            excluded_keywords: niche.excluded_keywords || [],
            platforms: niche.platforms || [],
            is_active: niche.is_active !== undefined ? niche.is_active : true,
            total_matches: niche.total_matches || niche.matches || 0,
            created_at: niche.created_at || new Date().toISOString(),
            ...niche
        };
    },

    /**
     * Parse activity response
     */
    parseActivity(response) {
        const activities = this.parseArray(response);
        
        return activities.map(activity => this.normalizeActivity(activity));
    },

    /**
     * Normalize single activity object
     */
    normalizeActivity(activity) {
        if (!activity) return null;

        return {
            id: activity.id || activity._id || '',
            type: activity.type || activity.action || 'activity',
            title: activity.title || activity.message || 'Activity',
            description: activity.description || activity.details || '',
            timestamp: activity.timestamp || activity.created_at || new Date().toISOString(),
            ...activity
        };
    },

    /**
     * Parse stats/summary response
     */
    parseStats(response, defaults = {}) {
        if (!response) return defaults;

        // Handle nested stats object
        if (response.stats) {
            return { ...defaults, ...response.stats };
        }

        // Direct stats object
        return { ...defaults, ...response };
    },

    /**
     * Parse subscription plans
     */
    parsePlans(response) {
        let plans = this.parseArray(response);
        
        // Ensure free tier exists
        if (!plans.find(p => p.tier === 'free')) {
            plans.unshift({
                tier: 'free',
                name: 'Free',
                price: 0,
                price_ngn: 0,
                max_niches: 1,
                max_keywords_per_niche: 5,
                platforms: ['Twitter/X', 'Reddit'],
                monthly_opportunities_limit: 50,
                features: [
                    'Create 1 niche',
                    'Manual scanning only',
                    'Up to 50 opportunities/month',
                    'Email notifications'
                ]
            });
        }

        return plans.map(plan => ({
            id: plan.id || plan._id || plan.tier,
            tier: plan.tier || 'free',
            name: plan.name || (plan.tier ? plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1) : 'Plan'),
            price: plan.price ?? plan.price_ngn ?? 0,
            price_ngn: plan.price_ngn ?? plan.price ?? 0,
            max_niches: plan.max_niches ?? 1,
            max_keywords_per_niche: plan.max_keywords_per_niche ?? 5,
            platforms: plan.platforms || [],
            monthly_opportunities_limit: plan.monthly_opportunities_limit ?? 50,
            features: plan.features || []
        }));
    },

    /**
     * Parse curated gigs response
     */
    parseCuratedGigs(response) {
        let gigs = this.parseArray(response);
        
        return gigs.map((gig, index) => ({
            id: gig.id || gig._id || `gig-${index}`,
            title: gig.title || gig.name || 'Gig Opportunity',
            platform: gig.platform || 'Platform',
            niche: gig.niche || gig.category || 'General',
            match_score: gig.match_score || gig.score || Math.floor(Math.random() * 30) + 70,
            scam_risk: gig.scam_risk || gig.risk || Math.floor(Math.random() * 40),
            salary: gig.salary || gig.budget || gig.compensation || 'Negotiable',
            urgency: gig.urgency || gig.priority || null,
            url: gig.url || gig.external_url || '#',
            ...gig
        }));
    },

    /**
     * Safely extract a numeric value from response
     */
    extractNumber(response, keys = [], fallback = 0) {
        if (typeof response === 'number') return response;
        
        for (const key of keys) {
            if (response && response[key] !== undefined) {
                const val = Number(response[key]);
                if (!isNaN(val)) return val;
            }
        }
        
        return fallback;
    },

    /**
     * Safely extract a string value from response
     */
    extractString(response, keys = [], fallback = '') {
        for (const key of keys) {
            if (response && response[key] !== undefined && response[key] !== null) {
                return String(response[key]);
            }
        }
        return fallback;
    }
};

/**
 * Safe forEach that handles undefined/null
 */
ResponseParser.safeForEach = function(data, callback, fallback = []) {
    const arr = this.parseArray(data, fallback);
    arr.forEach(callback);
};

// Export for use
window.ResponseParser = ResponseParser;