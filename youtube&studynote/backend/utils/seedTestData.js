require('dotenv').config();
const mongoose = require('mongoose');
const { Video, Note, InterviewQuestion } = require('../models');

const MONGODB_CLOUD = process.env.MONGODB_CLOUD || 
  'mongodb+srv://kaushalkumar:J5oEvYxAU0WXdsWO@cluster0.crjph.mongodb.net/codingTerminals';

/**
 * Seed Test Data Script
 * Creates sample documents for testing the modern architecture
 */

async function seedTestData() {
    try {
        console.log('🔄 Connecting to MongoDB Atlas...\n');
        
        await mongoose.connect(MONGODB_CLOUD);
        
        console.log('✅ Connected successfully!\n');
        console.log('📦 Database:', mongoose.connection.name);
        
        // Clear existing test data (optional)
        console.log('🧹 Clearing existing test data...');
        await Video.deleteMany({ isTestData: true });
        await Note.deleteMany({ isTestData: true });
        await InterviewQuestion.deleteMany({ isTestData: true });
        
        // Create sample videos
        console.log('\n📺 Creating sample videos...');
        const sampleVideos = [
            {
                title: 'Angular Tutorial Day 1 - Introduction',
                videoUrl: 'https://youtube.com/watch?v=sample1',
                thumbnailUrl: './assets/CT logo.jpg',
                category: 'Angular',
                tags: ['angular', 'tutorial', 'beginner'],
                description: 'Complete Angular introduction for beginners',
                channelName: 'Coding Terminals',
                uploadDate: new Date('2025-01-01'),
                subtopics: ['What is Angular?', 'Setup Environment', 'First App'],
                isTestData: true
            },
            {
                title: 'React Hooks Complete Guide',
                videoUrl: 'https://youtube.com/watch?v=sample2',
                thumbnailUrl: './assets/CT logo.jpg',
                category: 'React',
                tags: ['react', 'hooks', 'advanced'],
                description: 'Master React Hooks with practical examples',
                channelName: 'Coding Terminals',
                uploadDate: new Date('2025-01-15'),
                subtopics: ['useState', 'useEffect', 'Custom Hooks'],
                isTestData: true
            }
        ];
        
        const createdVideos = await Video.insertMany(sampleVideos);
        console.log(`✅ Created ${createdVideos.length} sample videos`);
        
        // Create sample notes
        console.log('\n📝 Creating sample notes...');
        const sampleNotes = [
            {
                title: 'JavaScript Fundamentals',
                category: 'JavaScript',
                tags: ['javascript', 'basics', 'fundamentals'],
                content: '<h2>JavaScript Introduction</h2><p>JavaScript is a versatile programming language for web development.</p><ul><li>Variables and Data Types</li><li>Functions</li><li>Objects and Arrays</li></ul>',
                isTestData: true
            },
            {
                title: 'CSS Flexbox Guide',
                category: 'CSS',
                tags: ['css', 'flexbox', 'layout'],
                content: '<h2>CSS Flexbox</h2><p>Flexbox is a powerful layout system in CSS.</p><pre><code>.container { display: flex; }</code></pre>',
                isTestData: true
            }
        ];
        
        const createdNotes = await Note.insertMany(sampleNotes);
        console.log(`✅ Created ${createdNotes.length} sample notes`);
        
        // Create sample interview questions
        console.log('\n❓ Creating sample interview questions...');
        const sampleQuestions = [
            {
                videoId: createdVideos[0]._id,
                question: 'What is Angular?',
                answer: 'Angular is a TypeScript-based open-source web application framework led by the Angular Team at Google and by a community of individuals and corporations.',
                difficulty: 'beginner',
                category: 'Angular',
                tags: ['angular', 'basics'],
                isTestData: true
            },
            {
                videoId: createdVideos[1]._id,
                question: 'What is the difference between useState and useEffect?',
                answer: 'useState is used to manage state in functional components, while useEffect is used to handle side effects like API calls, subscriptions, or DOM manipulations.',
                difficulty: 'intermediate',
                category: 'React',
                tags: ['react', 'hooks'],
                isTestData: true
            },
            {
                question: 'What is closure in JavaScript?',
                answer: 'A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned.',
                difficulty: 'intermediate',
                category: 'JavaScript',
                tags: ['javascript', 'closures'],
                isTestData: true
            }
        ];
        
        const createdQuestions = await InterviewQuestion.insertMany(sampleQuestions);
        console.log(`✅ Created ${createdQuestions.length} sample interview questions`);
        
        // Summary
        console.log('\n🎉 SUCCESS! Test data created!\n');
        console.log('📊 Summary:');
        console.log(`   Videos: ${createdVideos.length}`);
        console.log(`   Notes: ${createdNotes.length}`);
        console.log(`   Interview Questions: ${createdQuestions.length}`);
        
        console.log('\n💡 Next steps:');
        console.log('   1. Start your server: npm start');
        console.log('   2. Access viewer pages to see the test data');
        console.log('   3. Use admin panels to modify or add more data');
        console.log('\n📍 To remove test data later, run: node utils/clearTestData.js\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Connection closed.\n');
        process.exit(0);
    }
}

seedTestData();
