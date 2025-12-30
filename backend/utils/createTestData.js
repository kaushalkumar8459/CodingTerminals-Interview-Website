require('dotenv').config();
const mongoose = require('mongoose');
const { YouTubeRoadmap, StudyNotes } = require('../models');

const MONGODB_CLOUD = process.env.MONGODB_CLOUD || 
  'mongodb+srv://kaushalkumar:J5oEvYxAU0WXdsWO@cluster0.crjph.mongodb.net/codingTerminals';

async function createTestData() {
    try {
        console.log('🔄 Connecting to MongoDB Atlas...\n');
        
        await mongoose.connect(MONGODB_CLOUD, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Connected successfully!\n');
        console.log('📦 Database:', mongoose.connection.name);
        console.log('🔗 Host:', mongoose.connection.host);
        
        // Create sample YouTube Roadmap
        console.log('\n📺 Creating sample YouTube Roadmap...');
        const sampleRoadmap = new YouTubeRoadmap({
            channelName: 'Coding Terminals',
            channelLogo: './assets/CT logo.jpg',
            videoPlaylist: [{
                title: 'Angular Tutorial Day 1 - Introduction',
                subtopics: [
                    'What is Angular?',
                    'Setting up Development Environment',
                    'First Angular Application'
                ],
                interviewQuestions: [{
                    question: 'What is Angular?',
                    answer: 'Angular is a TypeScript-based open-source web application framework led by the Angular Team at Google.'
                }]
            }],
            upcomingTopic: {
                title: 'Angular Components Deep Dive',
                description: 'Learn about Angular components in detail',
                subtopics: ['Component Architecture', 'Lifecycle Hooks', 'Data Binding'],
                estimatedDate: '2025-01-05'
            }
        });
        
        await sampleRoadmap.save();
        console.log('✅ YouTube Roadmap created!');
        
        // Create sample Study Notes
        console.log('\n📚 Creating sample Study Notes...');
        const sampleNotes = {
            _id: 'study_notes_collection',
            version: '1.0',
            notes: [{
                _id: 'note_001',
                title: 'JavaScript Basics',
                category: 'JavaScript',
                tags: ['javascript', 'fundamentals', 'basics'],
                content: '<h2>JavaScript Introduction</h2><p>JavaScript is a programming language that enables interactive web pages.</p>',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }],
            categories: ['JavaScript', 'Angular', 'React'],
            tags: ['javascript', 'angular', 'react', 'fundamentals']
        };
        
        await StudyNotes.findByIdAndUpdate(
            'study_notes_collection',
            sampleNotes,
            { upsert: true, new: true }
        );
        console.log('✅ Study Notes created!');
        
        // List all collections
        console.log('\n📋 Listing all collections:');
        const collections = await mongoose.connection.db.listCollections().toArray();
        collections.forEach(col => {
            console.log(`   - ${col.name}`);
        });
        
        console.log('\n🎉 SUCCESS! Test data created!');
        console.log('\n📍 Now check MongoDB Atlas:');
        console.log('   1. Go to: https://cloud.mongodb.com');
        console.log('   2. Click "Browse Collections"');
        console.log('   3. Look for database: codingTerminals');
        console.log('   4. You should see your collections! ✅\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Connection refused - Check:');
            console.log('   1. Internet connection');
            console.log('   2. Network Access in MongoDB Atlas');
        } else if (error.message.includes('Authentication')) {
            console.log('\n💡 Authentication failed - Check:');
            console.log('   1. Username/password in .env');
            console.log('   2. Database user permissions');
        }
    } finally {
        await mongoose.connection.close();
        console.log('👋 Connection closed.\n');
        process.exit(0);
    }
}

createTestData();
