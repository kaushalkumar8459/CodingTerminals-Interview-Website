const mongoose = require('mongoose');

/**
 * MongoDB Database Configuration
 * Supports switching between local and cloud databases
 */

// Determine which database to use based on environment
const DB_ENVIRONMENT = process.env.DB_ENVIRONMENT || 'local';

const MONGODB_LOCAL = process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/codingTerminals';
const MONGODB_CLOUD = process.env.MONGODB_CLOUD || '';

// Select the appropriate connection string
const MONGODB_URI = DB_ENVIRONMENT === 'cloud' ? MONGODB_CLOUD : MONGODB_LOCAL;

const connectDB = async () => {
    try {
        // Validate connection string
        if (!MONGODB_URI) {
            throw new Error('MongoDB URI is not defined. Check your .env file.');
        }

        await mongoose.connect(MONGODB_URI);
        
        console.log('✅ Connected to MongoDB successfully!');
        console.log(`📦 Database: ${mongoose.connection.name}`);
        console.log(`🔗 Host: ${mongoose.connection.host}`);
        console.log(`🌍 Environment: ${DB_ENVIRONMENT.toUpperCase()} ${DB_ENVIRONMENT === 'cloud' ? '(MongoDB Atlas)' : '(Local)'}`);
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('⚠️  Server will continue with JSON file storage only...');
        
        // Log helpful debugging info
        if (DB_ENVIRONMENT === 'cloud' && !MONGODB_CLOUD) {
            console.log('💡 Tip: Set MONGODB_CLOUD in your .env file for cloud database');
        } else if (DB_ENVIRONMENT === 'local') {
            console.log('💡 Tip: Make sure MongoDB is running locally or switch to cloud');
            console.log('   Run: net start MongoDB (Windows) or brew services start mongodb-community (Mac)');
        }
    }
};

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('🔄 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️  Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed due to app termination');
    process.exit(0);
});

module.exports = connectDB;
