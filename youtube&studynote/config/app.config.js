// ==============================================
// CENTRALIZED CONFIGURATION FILE
// ==============================================
// This file contains all common paths, URLs, and settings
// Works in both browser (frontend) and Node.js (backend)
// ==============================================

/**
 * Detect current environment and get appropriate base URL
 * Supports: development, staging, production
 * Safe for both browser and Node.js environments
 */
function getEnvironmentConfig() {
    // Check if running in browser
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // Determine environment based on hostname
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return {
                ENV: 'development',
                BASE_URL: 'http://localhost:3000',
                API_BASE_URL: 'http://localhost:3000'
            };
        } else if (hostname.includes('staging') || hostname.includes('dev-')) {
            return {
                ENV: 'staging',
                BASE_URL: 'https://staging-app.render.com',
                API_BASE_URL: 'https://staging-api.render.com'
            };
        } else {
            // Production
            return {
                ENV: 'production',
                BASE_URL: `${protocol}//${hostname}`,
                API_BASE_URL: `${protocol}//${hostname}`
            };
        }
    } else {
        // Running in Node.js (backend) - use environment variables
        const env = process.env.NODE_ENV || 'development';
        
        const configs = {
            development: {
                ENV: 'development',
                BASE_URL: 'http://localhost:3000',
                API_BASE_URL: 'http://localhost:3000'
            },
            staging: {
                ENV: 'staging',
                BASE_URL: 'https://staging-app.render.com',
                API_BASE_URL: 'https://staging-api.render.com'
            },
            production: {
                ENV: 'production',
                BASE_URL: process.env.FRONTEND_URL || 'https://your-production-domain.com',
                API_BASE_URL: process.env.BACKEND_URL || 'https://your-production-domain.com'
            }
        };
        
        return configs[env] || configs.development;
    }
}

const ENV_CONFIG = getEnvironmentConfig();

const APP_CONFIG = {
    // Environment Detection
    ENVIRONMENT: ENV_CONFIG.ENV,
    BASE_URL: ENV_CONFIG.BASE_URL,
    
    // API Configuration
    API: {
        BASE_URL: ENV_CONFIG.API_BASE_URL,
        ENDPOINTS: {
            YOUTUBE_ROADMAP: '/api/youtube-roadmap',
            STUDY_NOTES: '/api/notes',
            LOGIN: '/api/auth/login',
            AUTH_CONFIG: '/api/auth-config',
            HEALTH: '/api/health'
        }
    },

    // Asset Paths
    ASSETS: {
        LOGO: '../assets/CT logo.jpg',
        LOGO_WHITE_BG: '../assets/CT Logog white background.jpg'
    },

    // Channel Information
    CHANNEL: {
        NAME: 'Coding Terminals',
        TAGLINE: 'Your Complete Learning Video Playlist',
        LOGO: '../../assets/CT logo.jpg',
        LOGO_FROM_ROOT: './assets/CT logo.jpg',
    },

    // YouTube Configuration
    YOUTUBE: {
        API_KEY: 'AIzaSyAhpyVPDCMaMUrNSVUfcYmevleEr3wVXS4',
        PLAYLIST_ID: 'PLHX7ZNz5nHXkWJpmDn6lY1Zz6ghSeOs1I',
        CHANNEL_URL: 'https://www.youtube.com/@codingterminals'
    },

    // ==============================================
    // 🎯 NAVIGATION URLs - Centralized URL Management
    // ==============================================
    URLS: {
        // ========== AUTHENTICATION ==========
        AUTH: {
            LOGIN: {
                FROM_ADMIN: '../../auth/login.html',
                FROM_VIEWER: '../../auth/login.html',
                FROM_ROOT: './auth/login.html',
            }
        },

        // ========== YOUTUBE ROADMAP MODULE ==========
        YOUTUBE_ROADMAP: {
            ADMIN: {
                FROM_STUDY_NOTES_ADMIN: '../../CodingTerminals-YouTubeRoadmap/admin/YouTubeRoadmap-admin.html',
                FROM_STUDY_NOTES_VIEWER: '../../CodingTerminals-YouTubeRoadmap/admin/YouTubeRoadmap-admin.html',
                FROM_ROOT: './CodingTerminals-YouTubeRoadmap/admin/YouTubeRoadmap-admin.html',
            },
            
            VIEWER: {
                FROM_STUDY_NOTES_ADMIN: '../../CodingTerminals-YouTubeRoadmap/viewer/YouTubeRoadmap-viewer.html',
                FROM_STUDY_NOTES_VIEWER: '../../CodingTerminals-YouTubeRoadmap/viewer/YouTubeRoadmap-viewer.html',
                FROM_YOUTUBE_ADMIN: '../viewer/YouTubeRoadmap-viewer.html',
                FROM_ROOT: './CodingTerminals-YouTubeRoadmap/viewer/YouTubeRoadmap-viewer.html',
            },
        },

        // ========== STUDY NOTES MODULE ==========
        STUDY_NOTES: {
            ADMIN: {
                FROM_YOUTUBE_ADMIN: '../../CodingTerminals-StudyNotes/admin/study-notes-admin.html',
                FROM_YOUTUBE_VIEWER: '../../CodingTerminals-StudyNotes/admin/study-notes-admin.html',
                FROM_ROOT: './CodingTerminals-StudyNotes/admin/study-notes-admin.html',
            },
            
            VIEWER: {
                FROM_YOUTUBE_ADMIN: '../../CodingTerminals-StudyNotes/viewer/study-notes-viewer.html',
                FROM_YOUTUBE_VIEWER: '../../CodingTerminals-StudyNotes/viewer/study-notes-viewer.html',
                FROM_STUDY_NOTES_ADMIN: '../viewer/study-notes-viewer.html',
                FROM_ROOT: './CodingTerminals-StudyNotes/viewer/study-notes-viewer.html',
            },
        },

        // ========== EXTERNAL LINKS ==========
        EXTERNAL: {
            YOUTUBE_CHANNEL: 'https://www.youtube.com/@codingterminals',
            GITHUB: 'https://github.com/codingterminals',
        },

        // ========== HOME/LANDING PAGE ==========
        HOME: {
            FROM_ADMIN: '../../index.html',
            FROM_VIEWER: '../../index.html',
            FROM_ROOT: './index.html',
        }
    },

    // ==============================================
    // 🔧 URL HELPER FUNCTIONS
    // ==============================================
    URL_HELPERS: {
        /**
         * Get full API URL with base URL
         * @param {string} endpoint - Endpoint key from API.ENDPOINTS
         * @returns {string} Full API URL
         * @example APP_CONFIG.URL_HELPERS.getApiUrl('YOUTUBE_ROADMAP')
         */
        getApiUrl: function(endpoint) {
            return `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS[endpoint]}`;
        },

        /**
         * Navigate to a page using URL constants
         * @param {string} module - Module name
         * @param {string} page - Page type
         * @param {string} from - Current location
         */
        navigateTo: function(module, page, from) {
            // Only works in browser
            if (typeof window === 'undefined') {
                console.error('Navigation only available in browser');
                return;
            }
            try {
                const url = APP_CONFIG.URLS[module][page][from];
                if (url) {
                    window.location.href = url;
                } else {
                    console.error(`Invalid URL path: ${module}.${page}.${from}`);
                }
            } catch (error) {
                console.error(`Navigation error:`, error);
            }
        },

        /**
         * Get URL by path
         * @param {string} module - Module name
         * @param {string} page - Page type
         * @param {string} from - Current location
         * @returns {string} URL string
         */
        getUrl: function(module, page, from) {
            try {
                return APP_CONFIG.URLS[module][page][from] || '';
            } catch (error) {
                console.error(`URL retrieval error:`, error);
                return '';
            }
        },

        /**
         * Navigate to external link
         * @param {string} linkKey - External link key
         */
        navigateToExternal: function(linkKey) {
            // Only works in browser
            if (typeof window === 'undefined') {
                console.error('External navigation only available in browser');
                return;
            }
            const url = APP_CONFIG.URLS.EXTERNAL[linkKey];
            if (url) {
                window.open(url, '_blank');
            } else {
                console.error(`Invalid external link key: ${linkKey}`);
            }
        }
    },

    // Page URLs (relative paths) - DEPRECATED - Use URLS instead
    PAGES: {
        YOUTUBE_ADMIN_LOGIN: '../CodingTerminals-YouTubeRoadmap/admin/login.html',
        YOUTUBE_ADMIN_PANEL: '../CodingTerminals-YouTubeRoadmap/admin/admin.html',
        YOUTUBE_VIEWER: '../CodingTerminals-YouTubeRoadmap/viewer/viewer.html',
        
        STUDY_NOTES_ADMIN_LOGIN: '../CodingTerminals-StudyNotes/admin/login.html',
        STUDY_NOTES_ADMIN_PANEL: '../CodingTerminals-StudyNotes/admin/admin.html',
        STUDY_NOTES_VIEWER: '../CodingTerminals-StudyNotes/viewer/viewer.html',
        
        HOME: '../index.html'
    },

    // Application Settings
    APP: {
        CHANNEL_NAME: 'Coding Terminals',
        SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
        SEARCH_DEBOUNCE_TIME: 500,
        DEFAULT_SORT_ORDER: 'desc'
    },

    // IndexedDB Configuration
    INDEXEDDB: {
        DB_NAME: 'CodingTerminalsDB',
        DB_VERSION: 3,
        STORES: {
            YOUTUBE_ROADMAP: 'youtubeRoadmapData',
            STUDY_NOTES: 'studyNotesData'
        }
    },

    // Backend Configuration
    SERVER: {
        PORT: 3000,
        FILES: {}
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