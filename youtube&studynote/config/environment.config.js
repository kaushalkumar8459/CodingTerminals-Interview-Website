/**
 * Environment Configuration Utility
 * Handles automatic environment detection and URL switching
 * Supports: development, staging, production
 */

const EnvironmentConfig = {
    /**
     * Detect current environment based on hostname
     * @returns {string} Environment name: 'development', 'staging', or 'production'
     */
    getEnvironment() {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        } else if (hostname.includes('staging') || hostname.includes('dev-') || hostname.includes('test')) {
            return 'staging';
        } else {
            return 'production';
        }
    },

    /**
     * Get API base URL based on current environment
     * @returns {string} API base URL
     */
    getApiBaseUrl() {
        const env = this.getEnvironment();
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        
        switch (env) {
            case 'development':
                return 'http://localhost:3000';
            case 'staging':
                return 'https://staging-api.render.com'; // Update with your staging URL
            case 'production':
                return `${protocol}//${hostname}`;
            default:
                return `${protocol}//${hostname}`;
        }
    },

    /**
     * Get frontend base URL based on current environment
     * @returns {string} Frontend base URL
     */
    getFrontendBaseUrl() {
        const env = this.getEnvironment();
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        
        switch (env) {
            case 'development':
                return 'http://localhost:3000';
            case 'staging':
                return 'https://staging-app.render.com'; // Update with your staging URL
            case 'production':
                return `${protocol}//${hostname}`;
            default:
                return `${protocol}//${hostname}`;
        }
    },

    /**
     * Get full API endpoint URL
     * @param {string} endpoint - API endpoint path (e.g., '/api/videos')
     * @returns {string} Full API URL
     */
    getApiUrl(endpoint) {
        const baseUrl = this.getApiBaseUrl();
        return `${baseUrl}${endpoint}`;
    },

    /**
     * Check if running in development environment
     * @returns {boolean}
     */
    isDevelopment() {
        return this.getEnvironment() === 'development';
    },

    /**
     * Check if running in staging environment
     * @returns {boolean}
     */
    isStaging() {
        return this.getEnvironment() === 'staging';
    },

    /**
     * Check if running in production environment
     * @returns {boolean}
     */
    isProduction() {
        return this.getEnvironment() === 'production';
    },

    /**
     * Log environment info (useful for debugging)
     */
    logEnvironmentInfo() {
        console.log(`
╔══════════════════════════════════════════╗
║   ENVIRONMENT CONFIGURATION              ║
╠══════════════════════════════════════════╣
║ Environment: ${this.getEnvironment().toUpperCase().padEnd(30)} ║
║ Frontend URL: ${this.getFrontendBaseUrl().substring(0, 28).padEnd(30)} ║
║ API Base URL: ${this.getApiBaseUrl().substring(0, 28).padEnd(30)} ║
║ Hostname: ${window.location.hostname.padEnd(34)} ║
║ Protocol: ${window.location.protocol.padEnd(32)} ║
╚══════════════════════════════════════════╝
        `);
    },

    /**
     * Make fetch request with automatic URL resolution
     * @param {string} endpoint - API endpoint (e.g., '/api/videos')
     * @param {object} options - Fetch options
     * @returns {Promise}
     */
    async fetchApi(endpoint, options = {}) {
        const url = this.getApiUrl(endpoint);
        const defaultOptions = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Request Error (${url}):`, error);
            throw error;
        }
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnvironmentConfig;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.EnvironmentConfig = EnvironmentConfig;
    
    // Log environment info on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            EnvironmentConfig.logEnvironmentInfo();
        });
    } else {
        EnvironmentConfig.logEnvironmentInfo();
    }
}