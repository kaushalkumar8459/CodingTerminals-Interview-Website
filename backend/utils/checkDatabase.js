require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_CLOUD = process.env.MONGODB_CLOUD || 
  'mongodb+srv://kaushalkumar:J5oEvYxAU0WXdsWO@cluster0.crjph.mongodb.net/codingTerminals';

async function checkDatabase() {
    try {
        console.log('🔄 Connecting to MongoDB Atlas...\n');
        
        await mongoose.connect(MONGODB_CLOUD, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Connected successfully!\n');
        console.log('📦 Current Database:', mongoose.connection.name);
        console.log('🔗 Host:', mongoose.connection.host);
        
        // List ALL databases
        console.log('\n📋 Listing ALL databases in your cluster:');
        const adminDb = mongoose.connection.db.admin();
        const { databases } = await adminDb.listDatabases();
        
        console.log('\nDatabases found:');
        databases.forEach(db => {
            console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024).toFixed(2)} KB)`);
        });
        
        // Check if codingTerminals exists
        const codingTerminalsExists = databases.find(db => db.name === 'codingTerminals');
        
        if (codingTerminalsExists) {
            console.log('\n✅ "codingTerminals" database EXISTS!');
            
            // List collections in codingTerminals
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log('\n📁 Collections in codingTerminals:');
            if (collections.length > 0) {
                collections.forEach(col => {
                    console.log(`   - ${col.name}`);
                });
            } else {
                console.log('   (No collections yet)');
            }
        } else {
            console.log('\n⚠️  "codingTerminals" database NOT FOUND!');
            console.log('\n💡 This means no data has been saved yet.');
            console.log('   Database will be created when you save data from admin panel.');
        }
        
        console.log('\n📍 To see your database in MongoDB Atlas:');
        console.log('   1. Go to: https://cloud.mongodb.com');
        console.log('   2. Click "Browse Collections" on Cluster0');
        console.log('   3. Look for "codingTerminals" in the database list');
        console.log('   4. System databases (admin, local) can be ignored\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Connection closed.\n');
        process.exit(0);
    }
}

checkDatabase();
