require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_CLOUD = process.env.MONGODB_CLOUD || 
  'mongodb+srv://kaushalkumar:J5oEvYxAU0WXdsWO@cluster0.crjph.mongodb.net/codingTerminals';

/**
 * Check all YouTube Roadmap related collections for duplicates
 */

async function checkAllCollections() {
    try {
        console.log('🔄 Connecting to MongoDB Atlas...\n');
        
        await mongoose.connect(MONGODB_CLOUD);
        
        console.log('✅ Connected successfully!\n');
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📋 All collections in database:');
        collections.forEach(col => console.log(`   - ${col.name}`));
        
        // Check each roadmap-related collection
        const roadmapCollections = collections.filter(col => 
            col.name.toLowerCase().includes('roadmap') || 
            col.name.toLowerCase().includes('youtube')
        );
        
        console.log('\n📺 YouTube Roadmap related collections:\n');
        
        for (const col of roadmapCollections) {
            const collection = mongoose.connection.db.collection(col.name);
            const count = await collection.countDocuments();
            const docs = await collection.find({}).toArray();
            
            console.log(`Collection: ${col.name}`);
            console.log(`   Document count: ${count}`);
            
            if (count > 0) {
                console.log(`   Documents:`);
                docs.forEach((doc, index) => {
                    console.log(`      ${index + 1}. ID: ${doc._id}`);
                    console.log(`         Created: ${doc.createdAt}`);
                    console.log(`         Title: ${doc.videoPlaylist?.[0]?.title || doc.channelName || 'N/A'}`);
                });
            }
            console.log('');
        }
        
        console.log('💡 Recommendation:');
        console.log('   - Keep: codingTerminalsYouTubeRoadmap (new organized structure)');
        console.log('   - Delete: youtuberoadmaps (old test data)');
        console.log('   - Delete: Any other old collections\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Connection closed.\n');
        process.exit(0);
    }
}

checkAllCollections();
