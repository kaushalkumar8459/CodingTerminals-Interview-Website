# 🗄️ MongoDB Integration Guide

## Overview

This application now supports **triple storage** for redundancy and flexibility:
1. **MongoDB** - Primary database (production-ready)
2. **IndexedDB** - Browser storage (offline capability)
3. **JSON Files** - File backup (development/fallback)

---

## 🚀 Quick Setup

### 1️⃣ Install MongoDB Locally

#### **Windows:**
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run as a Windows service automatically
4. Verify installation:
   ```bash
   mongo --version
   ```

#### **Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### **Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 2️⃣ Install Dependencies

Navigate to the backend folder and install packages:

```bash
cd backend
npm install
```

This will install:
- `mongoose` - MongoDB ODM (Object Data Modeling)
- `dotenv` - Environment variables management

### 3️⃣ Configure Environment

The `.env` file is already created with default settings:

```properties
MONGODB_URI=mongodb://localhost:27017/codingTerminals
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin@123
NODE_ENV=development
```

**For MongoDB Atlas (Cloud):**
```properties
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codingTerminals
```

### 4️⃣ Start the Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

---

## 📊 How Data Flows

### **Saving Data** (Triple Storage):

```
User Saves Content
        ↓
┌───────┴───────┐
│  Admin Panel  │
└───────┬───────┘
        ↓
   POST /api/...
        ↓
┌───────┴───────────────────┐
│    Backend Server         │
│  ┌─────────────────────┐  │
│  │ 1. Save to MongoDB  │  │ ✅ Primary
│  │ 2. Save to JSON     │  │ ✅ Backup
│  │ 3. Save to IndexedDB│  │ ✅ Browser (client-side)
│  └─────────────────────┘  │
└───────────────────────────┘
        ↓
   Success Response
```

### **Loading Data** (Priority Order):

```
1. Try MongoDB first → If available, use it
2. Fallback to JSON file → If MongoDB fails
3. IndexedDB (client-side) → If offline
4. Default empty structure → If all fail
```

---

## 🔧 API Endpoints

### YouTube Roadmap

**GET** `/api/youtube-roadmap`
- Loads from MongoDB (primary) or JSON file (fallback)

**POST** `/api/youtube-roadmap`
- Saves to both MongoDB AND JSON file

### Study Notes

**GET** `/api/study-notes`
- Loads from MongoDB (primary) or JSON file (fallback)

**POST** `/api/study-notes`
- Saves to both MongoDB AND JSON file

---

## 📦 MongoDB Collections

### **youtuberoadmaps** Collection
```javascript
{
  _id: ObjectId("..."),
  channelName: "Coding Terminals",
  channelLogo: "./assets/CT logo.jpg",
  videoPlaylist: [
    {
      title: "Angular Tutorial Day 1",
      subtopics: ["Introduction", "Setup"],
      interviewQuestions: [
        { question: "What is Angular?", answer: "..." }
      ]
    }
  ],
  upcomingTopic: {
    title: "Next Topic",
    description: "...",
    subtopics: [...],
    estimatedDate: "2025-12-30"
  },
  createdAt: ISODate("2025-12-28T..."),
  updatedAt: ISODate("2025-12-28T..."),
  lastUpdated: ISODate("2025-12-28T...")
}
```

### **studynotes** Collection
```javascript
{
  _id: "study_notes_collection", // Fixed ID
  version: "1.0",
  notes: [
    {
      _id: "note_12345",
      title: "JavaScript Basics",
      category: "JavaScript",
      tags: ["js", "fundamentals"],
      content: "<p>Content here...</p>",
      createdAt: "2025-12-28T...",
      updatedAt: "2025-12-28T..."
    }
  ],
  categories: ["JavaScript", "Angular", "React"],
  tags: ["js", "angular", "react"],
  createdAt: ISODate("2025-12-28T..."),
  updatedAt: ISODate("2025-12-28T..."),
  lastUpdated: ISODate("2025-12-28T...")
}
```

---

## 🛠️ MongoDB Commands

### Connect to Database
```bash
mongosh
use codingTerminals
```

### View Collections
```javascript
show collections
// Output: youtuberoadmaps, studynotes
```

### Query YouTube Roadmap
```javascript
db.youtuberoadmaps.find().pretty()
```

### Query Study Notes
```javascript
db.studynotes.find().pretty()
```

### Count Documents
```javascript
db.youtuberoadmaps.countDocuments()
db.studynotes.countDocuments()
```

### Delete All Data (Reset)
```javascript
db.youtuberoadmaps.deleteMany({})
db.studynotes.deleteMany({})
```

### Export Data
```bash
mongoexport --db=codingTerminals --collection=youtuberoadmaps --out=roadmap_backup.json
mongoexport --db=codingTerminals --collection=studynotes --out=notes_backup.json
```

### Import Data
```bash
mongoimport --db=codingTerminals --collection=youtuberoadmaps --file=roadmap_backup.json
mongoimport --db=codingTerminals --collection=studynotes --file=notes_backup.json
```

---

## 🔍 Troubleshooting

### MongoDB Not Connecting?

**Check if MongoDB is running:**
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl status mongodb
```

**Check connection in server logs:**
```
✅ Connected to MongoDB successfully!
📦 Database: codingTerminals
```

**If you see:**
```
❌ MongoDB connection error: connect ECONNREFUSED
⚠️  Continuing with JSON file storage only...
```

**Solution:**
1. Make sure MongoDB is installed and running
2. Check MONGODB_URI in `.env` file
3. Try connecting with `mongosh` to verify

### Port Already in Use?

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Data Not Saving?

1. Check server console for error messages
2. Verify MongoDB connection status
3. Check if JSON files are being created (fallback)
4. Open Browser DevTools > Application > IndexedDB

---

## 🌐 MongoDB Atlas (Cloud Setup)

For production deployment, use MongoDB Atlas (free tier available):

### Steps:
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (free M0 tier)
4. Create database user
5. Whitelist IP address (0.0.0.0/0 for development)
6. Get connection string
7. Update `.env`:

```properties
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/codingTerminals?retryWrites=true&w=majority
```

---

## 📊 Current Storage Strategy

| Storage Type | Purpose | When Used | Priority |
|--------------|---------|-----------|----------|
| **MongoDB** | Primary database | Production, server-side | 1st |
| **JSON Files** | Backup & fallback | Development, MongoDB fails | 2nd |
| **IndexedDB** | Offline cache | Client-side, offline mode | 3rd |

### Why Triple Storage?

✅ **Redundancy** - Data safe even if one system fails  
✅ **Flexibility** - Works online and offline  
✅ **Development** - Easy to test with JSON files  
✅ **Production** - Scalable with MongoDB  
✅ **Offline** - IndexedDB for browser caching  

---

## 🎯 Migration Plan (Future)

**Phase 1 (Current):** All three storage methods active  
**Phase 2:** Make MongoDB primary, JSON as backup  
**Phase 3:** Remove JSON files, keep MongoDB + IndexedDB  
**Phase 4:** MongoDB only with proper backups  

---

## 📝 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://localhost:27017/codingTerminals` | MongoDB connection string |
| `PORT` | `3000` | Server port |
| `ADMIN_USERNAME` | `admin` | Admin login username |
| `ADMIN_PASSWORD` | `admin@123` | Admin login password |
| `NODE_ENV` | `development` | Environment (development/production) |

---

## 🔐 Security Notes

⚠️ **Important:** Change default credentials in production!

```bash
# Set environment variables before starting
export ADMIN_USERNAME=your_secure_username
export ADMIN_PASSWORD=your_secure_password
npm start
```

---

**Created:** December 28, 2025  
**Last Updated:** December 28, 2025  
**Version:** 1.0.0
