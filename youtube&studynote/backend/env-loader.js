/**
 * =====================================================
 * ENV LOADER - Automatically loads environment files
 * =====================================================
 * This script loads the correct .env file based on NODE_ENV
 * 
 * Usage:
 * - Development: NODE_ENV=development node server.js
 * - Staging: NODE_ENV=staging node server.js
 * - Production: NODE_ENV=production node server.js
 * 
 * The appropriate .env file will be loaded automatically
 */

const path = require('path');
const fs = require('fs');

/**
 * Load environment file based on NODE_ENV
 */
function loadEnvironmentFile() {
    const env = process.env.NODE_ENV || 'development';
    const envFile = path.join(__dirname, `.env.${env}`);
    
    console.log(`\n📂 Loading environment: ${env.toUpperCase()}`);
    console.log(`📄 Environment file: ${envFile}`);
    
    if (fs.existsSync(envFile)) {
        console.log(`✅ Found .env.${env} file\n`);
        require('dotenv').config({ path: envFile });
    } else {
        console.warn(`⚠️  .env.${env} not found, falling back to .env\n`);
        require('dotenv').config(); // Load default .env
    }
}

/**
 * Validate required environment variables
 */
function validateEnvironmentVariables() {
    const required = [
        'NODE_ENV',
        'PORT',
        'MONGODB_CLOUD',
        'JWT_SECRET',
        'SESSION_SECRET'
    ];

    const missing = required.filter(variable => !process.env[variable]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing);
        process.exit(1);
    }

    console.log('✅ All required environment variables loaded\n');
}

/**
 * Display current environment configuration
 */
function displayEnvironmentConfig() {
    console.log(`
╔══════════════════════════════════════════════════════╗
║        ENVIRONMENT CONFIGURATION LOADED               ║
╠══════════════════════════════════════════════════════╣
║ Environment:    ${process.env.NODE_ENV.padEnd(36)} ║
║ Port:           ${process.env.PORT.padEnd(36)} ║
║ Database:       ${process.env.DB_ENVIRONMENT.padEnd(36)} ║
║ JWT Expiry:     ${(process.env.JWT_EXPIRY || 'N/A').padEnd(36)} ║
║ Log Level:      ${(process.env.LOG_LEVEL || 'info').padEnd(36)} ║
╠══════════════════════════════════════════════════════╣
║ Frontend URL:   ${(process.env.FRONTEND_URL || 'N/A').substring(0, 37).padEnd(37)} ║
║ API URL:        ${(process.env.API_URL || 'N/A').substring(0, 37).padEnd(37)} ║
╚══════════════════════════════════════════════════════╝
    `);
}

// Load environment file
loadEnvironmentFile();

// Validate required variables
validateEnvironmentVariables();

// Display configuration
displayEnvironmentConfig();

module.exports = {
    loadEnvironmentFile,
    validateEnvironmentVariables,
    displayEnvironmentConfig
};