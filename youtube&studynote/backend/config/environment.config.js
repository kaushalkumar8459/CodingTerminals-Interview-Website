# ==============================================
# BACKEND ENVIRONMENT CONFIGURATION
# ==============================================
# This file is used by the Node.js backend
# Different configs for development, staging, and production
# ==============================================

const getEnvironmentConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    
    const configs = {
        development: {
            ENV: 'development',
            PORT: process.env.PORT || 3000,
            MONGODB_URI: process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/codingTerminals',
            FRONTEND_URL: process.env.DEV_FRONTEND_URL || 'http://localhost:3000',
            API_URL: process.env.DEV_API_URL || 'http://localhost:3000/api',
            JWT_EXPIRY: '24h',
            LOG_LEVEL: 'debug',
            CORS_ORIGIN: [
                'http://localhost:3000',
                'http://127.0.0.1:3000',
                /localhost/
            ]
        },
        staging: {
            ENV: 'staging',
            PORT: process.env.PORT || 3000,
            MONGODB_URI: process.env.MONGODB_CLOUD || 'mongodb+srv://...',
            FRONTEND_URL: process.env.STAGING_FRONTEND_URL || 'https://staging-app.render.com',
            API_URL: process.env.STAGING_API_URL || 'https://staging-api.render.com/api',
            JWT_EXPIRY: '24h',
            LOG_LEVEL: 'info',
            CORS_ORIGIN: [
                'https://staging-app.render.com',
                /staging/,
                /render\.com$/
            ]
        },
        production: {
            ENV: 'production',
            PORT: process.env.PORT || 3000,
            MONGODB_URI: process.env.MONGODB_CLOUD || 'mongodb+srv://...',
            FRONTEND_URL: process.env.PROD_FRONTEND_URL || process.env.FRONTEND_URL,
            API_URL: process.env.PROD_API_URL || process.env.API_URL,
            JWT_EXPIRY: '7d',
            LOG_LEVEL: 'warn',
            CORS_ORIGIN: [
                process.env.FRONTEND_URL,
                /render\.com$/,
                /\.netlify\.app$/
            ]
        }
    };
    
    return configs[env] || configs.development;
};

const BACKEND_CONFIG = getEnvironmentConfig();

module.exports = BACKEND_CONFIG;