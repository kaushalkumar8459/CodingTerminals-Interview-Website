require('dotenv').config();
const mongoose = require('mongoose');

/**
 * MongoDB Connection Test Script
 * Run this to verify your MongoDB Atlas connection
 */

const MONGODB_CLOUD = process.env.MONGODB_CLOUD || 'mongodb+srv://kaushalkumar:J5oEvYxAU0WXdsWO@cluster0.crjph.mongodb.net/codingTerminals';

console.log('🔍 Testing MongoDB Atlas Connection...\n');
console.log('📡 Connection String:', MONGODB_CLOUD.replace(/:[^:]*@/, ':****@')); // Hide password

async function testConnection() {
    try {
        console.log('\n⏳ Connecting to MongoDB Atlas...');
        
        await mongoose.connect(MONGODB_CLOUD, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('\n✅ SUCCESS! Connected to MongoDB Atlas!');
        console.log('📦 Database Name:', mongoose.connection.name);
        console.log('🔗 Host:', mongoose.connection.host);
        console.log('📊 Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📚 Existing Collections:', collections.length > 0 ? collections.map(c => c.name).join(', ') : 'None (Database is empty)');
        
        console.log('\n🎉 Your MongoDB Atlas is ready to use!');
        console.log('💡 You can now start your server with: npm start\n');
        
    } catch (error) {
        console.error('\n❌ CONNECTION FAILED!');
        console.error('Error:', error.message);
        
        console.log('\n🔧 Troubleshooting Steps:');
        console.log('1. Check your internet connection');
        console.log('2. Verify MongoDB Atlas credentials');
        console.log('3. Check Network Access in MongoDB Atlas (Allow your IP)');
        console.log('4. Verify Database Access user permissions');
        console.log('5. Make sure the database name is correct\n');
    } finally {
        await mongoose.connection.close();
        console.log('👋 Test completed. Connection closed.\n');
        process.exit(0);
    }
}

testConnection();
