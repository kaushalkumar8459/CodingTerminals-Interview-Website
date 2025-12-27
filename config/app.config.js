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
            YOUTUBE_ROADMAP: '/api/youtube-roadmap',
            STUDY_NOTES: '/api/study-notes',
            LOGIN: '/api/auth/login',
            AUTH_CONFIG: '/api/auth-config'
        }
    },

    // Asset Paths
    ASSETS: {
        YOUTUBE_ROADMAP_JSON: '../assets/codingTerminalsYouTubeRoadmap.json',
        STUDY_NOTES_JSON: '../assets/codingTerminalsStudyNotes.json',
        LOGO: '../assets/CT logo.jpg',
        LOGO_WHITE_BG: '../assets/CT Logog white background.jpg'
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
    // Use these constants instead of hardcoded paths throughout the application
    // Benefits: Easy maintenance, consistent URLs, single source of truth
    
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
            // Admin Pages
            ADMIN: {
                FROM_STUDY_NOTES_ADMIN: '../../CodingTerminals-YouTubeRoadmap/admin/YouTubeRoadmap-admin.html',
                FROM_STUDY_NOTES_VIEWER: '../../CodingTerminals-YouTubeRoadmap/admin/YouTubeRoadmap-admin.html',
                FROM_ROOT: './CodingTerminals-YouTubeRoadmap/admin/YouTubeRoadmap-admin.html',
            },
            
            // Viewer Pages
            VIEWER: {
                FROM_STUDY_NOTES_ADMIN: '../../CodingTerminals-YouTubeRoadmap/viewer/YouTubeRoadmap-viewer.html',
                FROM_STUDY_NOTES_VIEWER: '../../CodingTerminals-YouTubeRoadmap/viewer/YouTubeRoadmap-viewer.html',
                FROM_YOUTUBE_ADMIN: '../viewer/YouTubeRoadmap-viewer.html',
                FROM_ROOT: './CodingTerminals-YouTubeRoadmap/viewer/YouTubeRoadmap-viewer.html',
            },
        },

        // ========== STUDY NOTES MODULE ==========
        STUDY_NOTES: {
            // Admin Pages
            ADMIN: {
                FROM_YOUTUBE_ADMIN: '../../CodingTerminals-StudyNotes/admin/study-notes.html',
                FROM_YOUTUBE_VIEWER: '../../CodingTerminals-StudyNotes/admin/study-notes.html',
                FROM_ROOT: './CodingTerminals-StudyNotes/admin/study-notes.html',
            },
            
            // Viewer Pages
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
            // Add more external links as needed
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
    // Utility functions to get URLs dynamically
    
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
         * @param {string} module - Module name (e.g., 'YOUTUBE_ROADMAP', 'STUDY_NOTES')
         * @param {string} page - Page type (e.g., 'ADMIN', 'VIEWER')
         * @param {string} from - Current location (e.g., 'FROM_STUDY_NOTES_ADMIN')
         * @example APP_CONFIG.URL_HELPERS.navigateTo('YOUTUBE_ROADMAP', 'VIEWER', 'FROM_STUDY_NOTES_ADMIN')
         */
        navigateTo: function(module, page, from) {
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
         * @example APP_CONFIG.URL_HELPERS.getUrl('YOUTUBE_ROADMAP', 'VIEWER', 'FROM_STUDY_NOTES_ADMIN')
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
         * @param {string} linkKey - External link key (e.g., 'YOUTUBE_CHANNEL')
         * @example APP_CONFIG.URL_HELPERS.navigateToExternal('YOUTUBE_CHANNEL')
         */
        navigateToExternal: function(linkKey) {
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
        // YouTube Roadmap Pages
        YOUTUBE_ADMIN_LOGIN: '../CodingTerminals-YouTubeRoadmap/admin/login.html',
        YOUTUBE_ADMIN_PANEL: '../CodingTerminals-YouTubeRoadmap/admin/admin.html',
        YOUTUBE_VIEWER: '../CodingTerminals-YouTubeRoadmap/viewer/viewer.html',
        
        // Study Notes Pages
        STUDY_NOTES_ADMIN_LOGIN: '../CodingTerminals-StudyNotes/admin/login.html',
        STUDY_NOTES_ADMIN_PANEL: '../CodingTerminals-StudyNotes/admin/admin.html',
        STUDY_NOTES_VIEWER: '../CodingTerminals-StudyNotes/viewer/viewer.html',
        
        // Main Landing Page
        HOME: '../index.html'
    },

    // Application Settings
    APP: {
        CHANNEL_NAME: 'Coding Terminals',
        SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        SEARCH_DEBOUNCE_TIME: 500, // milliseconds
        DEFAULT_SORT_ORDER: 'desc' // 'desc' for newest first, 'asc' for oldest first
    },

    // IndexedDB Configuration
    INDEXEDDB: {
        DB_NAME: 'CodingTerminalsDB',
        DB_VERSION: 2,
        STORES: {
            YOUTUBE_ROADMAP: 'youtubeRoadmapData',
            STUDY_NOTES: 'studyNotesData'
        }
    },

    // Backend File Paths (for server.js)
    SERVER: {
        YOUTUBE_ROADMAP_FILE: '../assets/codingTerminalsYouTubeRoadmap.json',
        STUDY_NOTES_FILE: '../assets/codingTerminalsStudyNotes.json',
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