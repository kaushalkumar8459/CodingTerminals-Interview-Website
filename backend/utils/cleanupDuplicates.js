require('dotenv').config();
const mongoose = require('mongoose');
const { YouTubeRoadmap } = require('../models');

const MONGODB_CLOUD = process.env.MONGODB_CLOUD || 
  'mongodb+srv://kaushalkumar:J5oEvYxAU0WXdsWO@cluster0.crjph.mongodb.net/codingTerminals';

/**
 * Cleanup Script - Remove Duplicate YouTube Roadmap Documents
 * Keeps only the latest document and deletes all others
 */

async function cleanupDuplicates() {
    try {
        console.log('🔄 Connecting to MongoDB Atlas...\n');
        
        await mongoose.connect(MONGODB_CLOUD);
        
        console.log('✅ Connected successfully!\n');
        
        // Count total documents
        const totalCount = await YouTubeRoadmap.countDocuments();
        console.log(`📊 Found ${totalCount} documents in codingTerminalsYouTubeRoadmap collection`);
        
        if (totalCount === 0) {
            console.log('✅ No documents found. Nothing to clean up.\n');
            return;
        }
        
        if (totalCount === 1) {
            console.log('✅ Only one document exists. No duplicates to remove.\n');
            return;
        }
        
        // Get the latest document
        const latestDoc = await YouTubeRoadmap.findOne().sort({ createdAt: -1 });
        console.log(`\n📌 Latest document:`);
        console.log(`   ID: ${latestDoc._id}`);
        console.log(`   Created: ${latestDoc.createdAt}`);
        console.log(`   Title: ${latestDoc.videoPlaylist[0]?.title || 'N/A'}`);
        
        // Delete all except the latest
        const deleteResult = await YouTubeRoadmap.deleteMany({
            _id: { $ne: latestDoc._id }
        });
        
        console.log(`\n✅ Cleanup complete!`);
        console.log(`   Deleted: ${deleteResult.deletedCount} duplicate documents`);
        console.log(`   Kept: 1 document (latest)`);
        
        // Verify
        const remainingCount = await YouTubeRoadmap.countDocuments();
        console.log(`\n📊 Final count: ${remainingCount} document(s)`);
        
        if (remainingCount === 1) {
            console.log('🎉 Success! Only one document remains.\n');
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Connection closed.\n');
        process.exit(0);
    }
}

cleanupDuplicates();
