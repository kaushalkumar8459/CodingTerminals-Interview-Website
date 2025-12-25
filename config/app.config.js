// ==============================================
// CENTRALIZED CONFIGURATION FILE
// ==============================================
// This file contains all common paths, URLs, and settings
// Update here to reflect changes across the entire application
// ==============================================

const APP_CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'http://localhost:3000',
        ENDPOINTS: {
            ROADMAP: '/api/roadmap',
            LOGIN: '/api/auth/login',
            AUTH_CONFIG: '/api/auth-config'
        }
    },

    // Asset Paths
    ASSETS: {
        JSON_FILE: '../assets/codingTerminalsData.json',
        LOGO: '../assets/CT logo.jpg',
        LOGO_WHITE_BG: '../assets/CT Logog white background.jpg'
    },

    // YouTube Configuration
    YOUTUBE: {
        API_KEY: 'AIzaSyAhpyVPDCMaMUrNSVUfcYmevleEr3wVXS4',
        PLAYLIST_ID: 'PLHX7ZNz5nHXkWJpmDn6lY1Zz6ghSeOs1I',
        CHANNEL_URL: 'https://www.youtube.com/@codingterminals'
    },

    // Page URLs (relative paths)
    PAGES: {
        ADMIN_LOGIN: '../CodingTerminals-admin/login.html',
        ADMIN_PANEL: '../CodingTerminals-admin/admin.html',
        VIEWER: '../CodingTerminals-viewer/CodingTerminals.html'
    },

    // Application Settings
    APP: {
        CHANNEL_NAME: 'Coding Terminals',
        SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        SEARCH_DEBOUNCE_TIME: 500, // milliseconds
        DEFAULT_SORT_ORDER: 'desc' // 'desc' for newest first, 'asc' for oldest first
    },

    // Backend File Paths (for server.js)
    SERVER: {
        JSON_FILE_PATH: '../assets/codingTerminalsData.json',
        PORT: 3000
    }
};

// Export for Node.js (backend)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
}

// Export for browser (frontend)
if (typeof window !== 'undefined') {
    window.APP_CONFIG = APP_CONFIG;
}