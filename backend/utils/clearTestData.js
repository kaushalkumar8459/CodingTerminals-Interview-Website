require('dotenv').config();
const mongoose = require('mongoose');
const { Video, Note, InterviewQuestion } = require('../models');

const MONGODB_CLOUD = process.env.MONGODB_CLOUD || 
  'mongodb+srv://kaushalkumar:J5oEvYxAU0WXdsWO@cluster0.crjph.mongodb.net/codingTerminals';

/**
 * Clear Test Data Script
 * Removes all documents marked as test data
 */

async function clearTestData() {
    try {
        console.log('🔄 Connecting to MongoDB Atlas...\n');
        
        await mongoose.connect(MONGODB_CLOUD);
        
        console.log('✅ Connected successfully!\n');
        console.log('📦 Database:', mongoose.connection.name);
        
        // Count test data before deletion
        const videoCount = await Video.countDocuments({ isTestData: true });
        const noteCount = await Note.countDocuments({ isTestData: true });
        const questionCount = await InterviewQuestion.countDocuments({ isTestData: true });
        
        console.log('\n📊 Test data found:');
        console.log(`   Videos: ${videoCount}`);
        console.log(`   Notes: ${noteCount}`);
        console.log(`   Interview Questions: ${questionCount}`);
        
        if (videoCount === 0 && noteCount === 0 && questionCount === 0) {
            console.log('\n✅ No test data found. Nothing to clear.\n');
            return;
        }
        
        console.log('\n🧹 Clearing test data...');
        
        // Delete test data
        const deletedVideos = await Video.deleteMany({ isTestData: true });
        const deletedNotes = await Note.deleteMany({ isTestData: true });
        const deletedQuestions = await InterviewQuestion.deleteMany({ isTestData: true });
        
        console.log('\n✅ Test data cleared successfully!\n');
        console.log('📊 Deletion summary:');
        console.log(`   Videos removed: ${deletedVideos.deletedCount}`);
        console.log(`   Notes removed: ${deletedNotes.deletedCount}`);
        console.log(`   Interview Questions removed: ${deletedQuestions.deletedCount}`);
        
        // Verify remaining data
        const remainingVideos = await Video.countDocuments();
        const remainingNotes = await Note.countDocuments();
        const remainingQuestions = await InterviewQuestion.countDocuments();
        
        console.log('\n📊 Remaining data:');
        console.log(`   Videos: ${remainingVideos}`);
        console.log(`   Notes: ${remainingNotes}`);
        console.log(`   Interview Questions: ${remainingQuestions}`);
        
        console.log('\n💡 To create new test data, run: node utils/seedTestData.js\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Connection closed.\n');
        process.exit(0);
    }
}

clearTestData();
