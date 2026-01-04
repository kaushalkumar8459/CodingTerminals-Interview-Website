require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_CLOUD = process.env.MONGODB_CLOUD || 
  'mongodb+srv://kaushalkumar:J5oEvYxAU0WXdsWO@cluster0.crjph.mongodb.net/codingTerminals';

/**
 * Database Status Checker
 * Checks MongoDB connection and lists all collections with document counts
 */

async function checkDatabase() {
    try {
        console.log('🔄 Connecting to MongoDB Atlas...\n');
        
        await mongoose.connect(MONGODB_CLOUD);
        
        console.log('✅ Connected successfully!\n');
        console.log('📦 Current Database:', mongoose.connection.name);
        console.log('🔗 Host:', mongoose.connection.host);
        
        // List ALL databases in cluster
        console.log('\n📋 Listing ALL databases in your cluster:');
        const adminDb = mongoose.connection.db.admin();
        const { databases } = await adminDb.listDatabases();
        
        console.log('\nDatabases found:');
        databases.forEach(db => {
            console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024).toFixed(2)} KB)`);
        });
        
        // Check current database collections
        const codingTerminalsExists = databases.find(db => db.name === 'codingTerminals');
        
        if (codingTerminalsExists) {
            console.log('\n✅ "codingTerminals" database EXISTS!');
            
            // List collections with document counts
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log('\n📁 Collections in codingTerminals:\n');
            
            if (collections.length > 0) {
                for (const col of collections) {
                    const collection = mongoose.connection.db.collection(col.name);
                    const count = await collection.countDocuments();
                    console.log(`   📄 ${col.name}`);
                    console.log(`      Documents: ${count}`);
                    
                    // Show sample document structure
                    if (count > 0) {
                        const sample = await collection.findOne();
                        const keys = Object.keys(sample).slice(0, 5);
                        console.log(`      Fields: ${keys.join(', ')}${keys.length < Object.keys(sample).length ? '...' : ''}`);
                    }
                    console.log('');
                }
            } else {
                console.log('   (No collections yet - database will be created when you save data)');
            }
        } else {
            console.log('\n⚠️  "codingTerminals" database NOT FOUND!');
            console.log('\n💡 This means no data has been saved yet.');
            console.log('   Database will be created automatically when you save data from admin panel.');
        }
        
        console.log('\n📍 Expected collections in modern architecture:');
        console.log('   - videos (YouTube video documents)');
        console.log('   - notes (Study notes documents)');
        console.log('   - interviewquestions (Interview Q&A documents)');
        console.log('   - users (Authentication users)');
        
        console.log('\n📍 To manage your database:');
        console.log('   1. Go to: https://cloud.mongodb.com');
        console.log('   2. Click "Browse Collections" on Cluster0');
        console.log('   3. Look for "codingTerminals" database');
        console.log('   4. View and manage your collections\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Connection refused - Check:');
            console.log('   1. Internet connection');
            console.log('   2. Network Access in MongoDB Atlas (whitelist your IP)');
        } else if (error.message.includes('Authentication')) {
            console.log('\n💡 Authentication failed - Check:');
            console.log('   1. Username/password in .env file');
            console.log('   2. Database user permissions in MongoDB Atlas');
        }
    } finally {
        await mongoose.connection.close();
        console.log('👋 Connection closed.\n');
        process.exit(0);
    }
}

checkDatabase();
