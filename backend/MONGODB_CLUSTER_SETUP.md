# 🌐 MongoDB Atlas Cluster Setup Guide

## Your Project Structure

Your MongoDB database will have collections named after your JSON files:

```
MongoDB Atlas Cluster: Cluster0
    └── Database: codingTerminals
        ├── Collection: codingTerminalsYouTubeRoadmap
        │   └── Stores YouTube roadmap data
        └── Collection: codingTerminalsStudyNotes
            └── Stores study notes data
```

---

## 📊 Current Configuration

### Your Setup:
- **Cluster Name:** `Cluster0` (Already exists in your Atlas account)
- **Database Name:** `codingTerminals`
- **Connection String:** `mongodb+srv://kaushalkumar:J5oEvYxAU0WXdsWO@cluster0.crjph.mongodb.net/codingTerminals`

### Collections (Auto-created when you save data):
1. **codingTerminalsYouTubeRoadmap** - Matches `assets/codingTerminalsYouTubeRoadmap.json`
2. **codingTerminalsStudyNotes** - Matches `assets/codingTerminalsStudyNotes.json`

---

## 🚀 MongoDB Atlas Dashboard Steps

### Step 1: Login to MongoDB Atlas
1. Go to: https://cloud.mongodb.com
2. Login with your credentials
3. You should see your **Cluster0**

### Step 2: Verify Cluster Settings
1. Click on **Cluster0**
2. Check cluster tier (Free M0 is perfect for development)
3. Region should be closest to you for better speed

### Step 3: Configure Network Access
1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Choose **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

**Security Note:** For production, whitelist only specific IPs.

### Step 4: Verify Database User
1. Click **"Database Access"** in left sidebar
2. Verify user **kaushalkumar** exists
3. Make sure it has **"Read and write to any database"** permission
4. If not, click **"Edit"** → Set permissions → **"Save"**

### Step 5: Browse Collections (After running your app)
1. Click **"Browse Collections"** on Cluster0
2. Select database: **codingTerminals**
3. You'll see your collections:
   - `codingTerminalsYouTubeRoadmap`
   - `codingTerminalsStudyNotes`

---

## 🗂️ Collection Details

### **Collection 1: codingTerminalsYouTubeRoadmap**
**Purpose:** Stores YouTube video roadmap data

**Structure:**
```json
{
  "_id": "ObjectId(...)",
  "channelName": "Coding Terminals",
  "channelLogo": "./assets/CT logo.jpg",
  "videoPlaylist": [
    {
      "title": "Angular Day 1",
      "subtopics": ["Introduction", "Setup"],
      "interviewQuestions": [
        {
          "question": "What is Angular?",
          "answer": "Angular is a framework..."
        }
      ]
    }
  ],
  "upcomingTopic": {
    "title": "Next Topic",
    "subtopics": [...],
    "estimatedDate": "2025-01-05"
  },
  "createdAt": "2025-12-30T10:00:00.000Z",
  "updatedAt": "2025-12-30T10:00:00.000Z"
}
```

### **Collection 2: codingTerminalsStudyNotes**
**Purpose:** Stores study notes with categories and tags

**Structure:**
```json
{
  "_id": "study_notes_collection",
  "version": "1.0",
  "notes": [
    {
      "_id": "note_123",
      "title": "JavaScript Basics",
      "category": "JavaScript",
      "tags": ["js", "fundamentals"],
      "content": "<p>Rich text content...</p>",
      "createdAt": "2025-12-30T10:00:00.000Z",
      "updatedAt": "2025-12-30T10:00:00.000Z"
    }
  ],
  "categories": ["JavaScript", "Angular", "React"],
  "tags": ["js", "angular", "react"],
  "createdAt": "2025-12-30T10:00:00.000Z",
  "updatedAt": "2025-12-30T10:00:00.000Z"
}
```

---

## 🔧 MongoDB Shell Commands

### Connect to Your Cluster:
```bash
mongosh "mongodb+srv://cluster0.crjph.mongodb.net/codingTerminals" --username kaushalkumar
```

### View Your Collections:
```javascript
// List all collections
show collections

// Output will show:
// codingTerminalsYouTubeRoadmap
// codingTerminalsStudyNotes
```

### Query YouTube Roadmap:
```javascript
db.codingTerminalsYouTubeRoadmap.find().pretty()
```

### Query Study Notes:
```javascript
db.codingTerminalsStudyNotes.find().pretty()
```

### Count Documents:
```javascript
db.codingTerminalsYouTubeRoadmap.countDocuments()
db.codingTerminalsStudyNotes.countDocuments()
```

### Find Specific Data:
```javascript
// Find roadmap with specific channel name
db.codingTerminalsYouTubeRoadmap.find({ channelName: "Coding Terminals" })

// Find notes by category
db.codingTerminalsStudyNotes.find({ "notes.category": "JavaScript" })
```

---

## 📥 Import Existing JSON Files to MongoDB

If you want to import your existing JSON files to MongoDB Atlas:

### Using MongoDB Compass (GUI):
1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connect using your connection string
3. Select database: `codingTerminals`
4. Create collections manually or let app create them
5. Click **"Add Data"** → **"Import File"**
6. Select your JSON files from `assets/` folder
7. Import complete!

### Using mongoimport (Command Line):
```bash
# Import YouTube Roadmap
mongoimport --uri="mongodb+srv://kaushalkumar:J5oEvYxAU0WXdsWO@cluster0.crjph.mongodb.net/codingTerminals" \
  --collection=codingTerminalsYouTubeRoadmap \
  --file="assets/codingTerminalsYouTubeRoadmap.json"

# Import Study Notes
mongoimport --uri="mongodb+srv://kaushalkumar:J5oEvYxAU0WXdsWO@cluster0.crjph.mongodb.net/codingTerminals" \
  --collection=codingTerminalsStudyNotes \
  --file="assets/codingTerminalsStudyNotes.json"
```

---

## 📊 Data Flow

```
Admin Panel (Save Data)
        ↓
Backend Server (POST API)
        ↓
    ┌───┴───┐
    │       │
MongoDB     JSON File
(Cloud)     (Backup)
    │       │
    └───┬───┘
        ↓
   IndexedDB
  (Browser Cache)
```

---

## 🎯 Testing Your Setup

### Step 1: Start Server
```bash
cd backend
npm start
```

Expected output:
```
✅ Connected to MongoDB successfully!
📦 Database: codingTerminals
🔗 Host: cluster0-shard-00-00.crjph.mongodb.net
🌍 Environment: CLOUD (MongoDB Atlas)
```

### Step 2: Save Some Data
1. Login: http://localhost:3000/auth/login.html
2. Go to YouTube Roadmap Admin
3. Add a video day with topics
4. Click **Save**

### Step 3: Verify in MongoDB Atlas
1. Go to MongoDB Atlas Dashboard
2. Click **"Browse Collections"**
3. Select `codingTerminals` database
4. Click on `codingTerminalsYouTubeRoadmap`
5. You should see your data! 🎉

### Step 4: Verify Console Output
```
✅ YouTube Roadmap saved to MongoDB
✅ YouTube Roadmap saved to JSON file
```

---

## 🔐 Security Best Practices

### ✅ DO:
- Use **Network Access** to whitelist IPs
- Create separate users for different environments
- Use strong passwords
- Enable **Database Auditing** in production
- Set up **Backup** schedules

### ❌ DON'T:
- Never commit `.env` file to Git
- Don't use same password for dev and production
- Don't allow 0.0.0.0/0 in production
- Don't share connection strings publicly

---

## 📈 Monitoring & Maintenance

### View Database Stats:
1. In Atlas Dashboard → Select **Cluster0**
2. Click **"Metrics"** tab
3. Monitor:
   - Connection count
   - Operations per second
   - Storage usage
   - Query performance

### Set Up Alerts:
1. Click **"Alerts"** in left sidebar
2. Create alert for:
   - High connection count
   - Storage reaching limit
   - Slow queries

---

## 🆘 Troubleshooting

### Connection Timeout?
- Check Network Access (whitelist IP)
- Verify internet connection
- Check if cluster is paused (free tier pauses after inactivity)

### Authentication Failed?
- Verify username/password in Database Access
- Check connection string format
- Make sure user has correct permissions

### Collections Not Appearing?
- Collections are created only after first data save
- Run your app and save some data first
- Refresh MongoDB Atlas dashboard

---

## 📚 Quick Reference

| Item | Value |
|------|-------|
| **Cluster Name** | Cluster0 |
| **Database Name** | codingTerminals |
| **Collection 1** | codingTerminalsYouTubeRoadmap |
| **Collection 2** | codingTerminalsStudyNotes |
| **Connection Type** | MongoDB Atlas (Cloud) |
| **Region** | Based on your cluster settings |
| **Tier** | M0 (Free) or higher |

---

## 🎓 Next Steps

1. ✅ Start your server: `npm start`
2. ✅ Login to admin panel
3. ✅ Save some test data
4. ✅ Verify in MongoDB Atlas
5. ✅ Celebrate! 🎉

---

**Created:** December 30, 2025  
**Last Updated:** December 30, 2025  
**Author:** Coding Terminals
