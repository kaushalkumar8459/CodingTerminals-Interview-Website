# 🔍 Where to Find Your MongoDB Data

## Your MongoDB Structure:

```
MongoDB Atlas Dashboard
│
├── 📊 Cluster0 (Your Cluster)
│   │
│   └── 🗄️ Databases
│       │
│       └── 📦 codingTerminals (Your Database)
│           │
│           ├── 📁 codingTerminalsYouTubeRoadmap (Collection)
│           │   └── Documents (Your YouTube roadmap data)
│           │
│           └── 📁 codingTerminalsStudyNotes (Collection)
│               └── Documents (Your study notes data)
```

---

## 🚨 Important: Database is Created ONLY After First Save!

If you **don't see** the `codingTerminals` database, it means:
- ✅ Your connection is working
- ⚠️ But you haven't saved any data yet!

**The database and collections are auto-created when you save data for the first time.**

---

## 🎯 How to Make the Database Appear:

### Option 1: Save Data from Admin Panel (Recommended)

**Step 1:** Start your server
```bash
cd backend
npm start
```

**Step 2:** Login to admin panel
```
http://localhost:3000/auth/login.html
Username: admin
Password: admin@123
```

**Step 3:** Add and Save Content
- Go to YouTube Roadmap Admin or Study Notes Admin
- Add some content
- Click **"Save"**

**Step 4:** Check MongoDB Atlas
- Refresh your MongoDB Atlas dashboard
- Click **"Browse Collections"**
- You should now see **`codingTerminals`** database! 🎉

---

### Option 2: Test Connection and Create Sample Data

Run this script to test connection and create sample data:

**Save this as:** `backend/utils/createTestData.js`

```javascript
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
                    answer: 'Angular is a TypeScript-based open-source web application framework...'
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
                content: '<h2>JavaScript Introduction</h2><p>JavaScript is a programming language...</p>',
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
```

**Run it:**
```bash
cd backend
node utils/createTestData.js
```

---

## 📊 What You Should See in MongoDB Atlas:

### After saving data, your MongoDB Atlas should show:

```
Databases
└── codingTerminals
    ├── codingTerminalsYouTubeRoadmap
    │   └── 1 document (or more)
    │
    └── codingTerminalsStudyNotes
        └── 1 document (or more)
```

### Screenshot Guide:

**1. Cluster View:**
```
┌─────────────────────────────────────┐
│ Cluster0                            │
│                                     │
│ [Browse Collections] [Connect]      │
└─────────────────────────────────────┘
```

**2. Collections View:**
```
┌─────────────────────────────────────┐
│ Databases                           │
│                                     │
│ ▼ codingTerminals                  │
│   ├── codingTerminalsYouTubeRoadmap│
│   └── codingTerminalsStudyNotes    │
└─────────────────────────────────────┘
```

---

## 🆘 Troubleshooting:

### ❓ "I don't see 'codingTerminals' database"

**Reason:** Database is only created after first save

**Solution:**
1. Start server: `npm start`
2. Login to admin panel
3. Save any content
4. Refresh MongoDB Atlas
5. Database should appear! ✅

---

### ❓ "I see other databases but not 'codingTerminals'"

**Check your connection string in `.env`:**
```properties
MONGODB_CLOUD=mongodb+srv://kaushalkumar:J5oEvYxAU0WXdsWO@cluster0.crjph.mongodb.net/codingTerminals
                                                                                              ↑
                                                                                    This is your database name
```

Make sure it ends with `/codingTerminals`

---

### ❓ "Connection error when trying to save"

**Check Network Access:**
1. MongoDB Atlas → Network Access
2. Make sure your IP is whitelisted
3. Or use 0.0.0.0/0 (allow from anywhere)

---

## 🎯 Quick Summary:

| Question | Answer |
|----------|--------|
| **Database Name** | `codingTerminals` |
| **When is it created?** | After first save |
| **Where to find it?** | MongoDB Atlas → Browse Collections |
| **Collections inside** | `codingTerminalsYouTubeRoadmap`<br>`codingTerminalsStudyNotes` |

---

**Next Step:** Start your server and save some data to make the database appear! 🚀
