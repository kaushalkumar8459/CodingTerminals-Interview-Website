require('dotenv').config();
const mongoose = require('mongoose');

/**
 * MongoDB Connection Test Script
 * Tests MongoDB Atlas connection and verifies server readiness
 */

const MONGODB_CLOUD = process.env.MONGODB_CLOUD || 
  'mongodb+srv://kaushalkumar:J5oEvYxAU0WXdsWO@cluster0.crjph.mongodb.net/codingTerminals';

console.log('🔍 Testing MongoDB Atlas Connection...\n');
console.log('📡 Connection String:', MONGODB_CLOUD.replace(/:[^:]*@/, ':****@')); // Hide password

async function testConnection() {
    try {
        console.log('\n⏳ Connecting to MongoDB Atlas...');
        
        await mongoose.connect(MONGODB_CLOUD);
        
        console.log('\n✅ SUCCESS! Connected to MongoDB Atlas!');
        console.log('📦 Database Name:', mongoose.connection.name);
        console.log('🔗 Host:', mongoose.connection.host);
        console.log('📊 Ready State:', mongoose.connection.readyState === 1 ? 'Connected ✓' : 'Not Connected ✗');
        
        // Test database operations
        console.log('\n🧪 Testing database operations...');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📚 Collections Found:', collections.length);
        
        if (collections.length > 0) {
            console.log('\n📋 Available Collections:');
            collections.forEach(col => {
                console.log(`   - ${col.name}`);
            });
        } else {
            console.log('   (Database is empty - collections will be created automatically)');
        }
        
        // Test write permission
        console.log('\n✍️  Testing write permissions...');
        try {
            const testCollection = mongoose.connection.db.collection('_test');
            await testCollection.insertOne({ test: true, timestamp: new Date() });
            await testCollection.deleteOne({ test: true });
            console.log('✅ Write permissions: OK');
        } catch (writeError) {
            console.log('❌ Write permissions: FAILED');
            console.log('   Error:', writeError.message);
        }
        
        console.log('\n🎉 MongoDB Atlas is fully operational!');
        console.log('\n💡 Next steps:');
        console.log('   1. Start your server: npm start');
        console.log('   2. Access admin panels to create data');
        console.log('   3. View data in MongoDB Atlas dashboard\n');
        
    } catch (error) {
        console.error('\n❌ CONNECTION FAILED!');
        console.error('Error:', error.message);
        
        console.log('\n🔧 Troubleshooting Steps:');
        console.log('1. ✓ Check your internet connection');
        console.log('2. ✓ Verify .env file has correct MONGODB_CLOUD value');
        console.log('3. ✓ Check Network Access in MongoDB Atlas:');
        console.log('     - Go to Network Access tab');
        console.log('     - Add your current IP address or use 0.0.0.0/0 for testing');
        console.log('4. ✓ Verify Database Access user:');
        console.log('     - Go to Database Access tab');
        console.log('     - Ensure user has "Read and write to any database" role');
        console.log('5. ✓ Check if MongoDB Atlas cluster is active');
        console.log('6. ✓ Verify connection string format is correct\n');
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('💡 Connection refused - likely internet or firewall issue');
        } else if (error.message.includes('Authentication')) {
            console.log('💡 Authentication failed - check username/password in .env');
        } else if (error.message.includes('timeout')) {
            console.log('💡 Connection timeout - check Network Access IP whitelist');
        }
        
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Test completed. Connection closed.\n');
        process.exit(0);
    }
}

testConnection();
