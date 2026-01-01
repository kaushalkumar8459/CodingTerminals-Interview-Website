# 📊 Data Flow Architecture - CodingTerminals

## 🎯 **MODERN ARCHITECTURE (Current)**

### **Offline-First with Individual Documents**

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETE DATA FLOW                            │
└─────────────────────────────────────────────────────────────────┘

🔄 FETCH FLOW (Load Data)
═══════════════════════════════════════════════════════════════════

1. UI Loads (Admin Panel)
   ↓
2. Check IndexedDB Cache
   ↓
   [Has cached data?]
   │
   ├─ YES → Render UI INSTANTLY ⚡
   │         ↓
   │         Continue to Step 3 (background sync)
   │
   └─ NO → Continue to Step 3
   
3. Fetch YouTube API (statistics)
   ↓ (5 videos with views, likes, comments)
   
4. Call MongoDB API: GET /api/videos or GET /api/notes
   ↓
   MongoDB returns: Array of individual documents
   [
     { _id, videoId/noteId, title, content, ... },
     { _id, videoId/noteId, title, content, ... }
   ]
   ↓
5. Merge data
   ↓
6. Save to IndexedDB (cache for next load)
   ↓
7. Refresh UI silently (if already rendered)
   
───────────────────────────────────────────────────────────────────

💾 SAVE FLOW (Edit Data)
═══════════════════════════════════════════════════════════════════

1. User edits video/note
   ↓
2. User clicks "Save Changes"
   ↓
3. STEP 1: Save to IndexedDB IMMEDIATELY ⚡
   ↓
4. STEP 2: Update UI optimistically
   ↓
5. STEP 3: Send to MongoDB API
   │
   ├─ If has _id:
   │    PUT /api/videos/:id or PUT /api/notes/:id
   │
   └─ If no _id:
        POST /api/videos or POST /api/notes
   ↓
6. MongoDB Response
   │
   ├─ SUCCESS ✅
   │    └─ Show: "✅ Synced with MongoDB"
   │
   └─ FAILED ❌
        └─ Show: "⚠️ Saved locally, will sync when online"
```

---

## 🗄️ **DATA SOURCES**

### **1. YouTube API (Read-Only)**
```
Source: https://www.googleapis.com/youtube/v3/
Purpose: Fetch video metadata and statistics

Data fetched:
✅ Video title
✅ Video ID
✅ Thumbnail
✅ Description
✅ Published date
✅ View count
✅ Like count
✅ Comment count
```

### **2. MongoDB Atlas (Read/Write)**
```
Database: codingTerminals
Collections: 
  - youtubeVideos (one document per video)
  - studyNotes (one document per note)
  - interviewQuestions (linked to videos)

Schema Examples:

// Video Document
{
  _id: ObjectId,
  videoId: "youtube_video_id",
  title: "Video title",
  videoUrl: "https://youtube.com/...",
  thumbnail: "...",
  description: "...",
  date: "2024-12-31",
  subtopics: ["topic1", "topic2"],
  interviewQuestions: [...],
  day: 1,
  viewCount: 1000,
  likeCount: 50,
  commentCount: 10,
  category: "Angular",
  status: "published"
}

// Note Document
{
  _id: ObjectId,
  noteId: "note_123",
  title: "Note title",
  content: "Rich text content...",
  category: "JavaScript",
  tags: ["async", "promises"],
  type: "code-snippet",
  isPinned: false,
  isFavorite: false,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### **3. IndexedDB (Local Cache)**
```
Database: codingTerminalsDB
Stores: 
  - youtubeRoadmapData
  - studyNotesData

Purpose: Offline-first caching for instant load
```

---

## 🔌 **API ENDPOINTS**

### **Videos API**
```javascript
GET    /api/videos              // Get all videos
GET    /api/videos/:id          // Get video by MongoDB _id
GET    /api/videos/youtube/:id  // Get video by YouTube videoId
POST   /api/videos              // Create new video
PUT    /api/videos/:id          // Update video
DELETE /api/videos/:id          // Delete video
POST   /api/videos/bulk         // Bulk upsert videos
```

### **Notes API**
```javascript
GET    /api/notes                    // Get all notes
GET    /api/notes/search?q=query    // Search notes
GET    /api/notes/category/:cat     // Get by category
GET    /api/notes/note/:noteId      // Get by noteId
GET    /api/notes/:id               // Get by MongoDB _id
POST   /api/notes                   // Create new note
PUT    /api/notes/:id               // Update note
DELETE /api/notes/:id               // Delete note
POST   /api/notes/bulk              // Bulk upsert notes
```

### **Interview Questions API**
```javascript
GET    /api/interview-questions/video/:videoId  // Get questions by video
POST   /api/interview-questions                 // Create question
PUT    /api/interview-questions/:id             // Update question
DELETE /api/interview-questions/:id             // Delete question
POST   /api/interview-questions/bulk            // Bulk upsert
```

### **Authentication API**
```javascript
POST   /api/auth/login          // User login
GET    /api/auth/config         // Get auth config
```

---

## 📁 **FILE STRUCTURE**

### **Backend (Node.js + Express)**
```
backend/
├── server.js                          ✅ Main server
├── config/
│   └── database.js                    ✅ MongoDB connection
├── models/
│   ├── Video.js                       ✅ Video schema
│   ├── Note.js                        ✅ Note schema
│   ├── InterviewQuestion.js           ✅ Question schema
│   └── index.js                       ✅ Model exports
├── controllers/
│   ├── videoController.js             ✅ Video CRUD
│   ├── noteController.js              ✅ Note CRUD
│   └── interviewQuestionController.js ✅ Question CRUD
└── routes/
    ├── video.routes.js                ✅ /api/videos
    ├── note.routes.js                 ✅ /api/notes
    ├── interviewQuestion.routes.js    ✅ /api/interview-questions
    ├── auth.routes.js                 ✅ /api/auth
    └── index.js                       ✅ Route exports
```

### **Frontend**
```
CodingTerminals-YouTubeRoadmap/
├── admin/
│   ├── YouTubeRoadmap-admin.html      ✅ Admin UI
│   ├── YouTubeRoadmap-admin.js        ✅ Logic
│   ├── YouTubeRoadmap-admin.css       ✅ Styles
│   └── admin-api-service.js           ✅ API client
└── viewer/
    └── YouTubeRoadmap-viewer.html     ✅ Public viewer

CodingTerminals-StudyNotes/
├── admin/
│   ├── study-notes-admin.html         ✅ Admin UI
│   ├── study-notes-admin.js           ✅ Logic
│   └── study-notes-admin.css          ✅ Styles
└── viewer/
    └── study-notes-viewer.html        ✅ Public viewer
```

---

## ⚡ **PERFORMANCE BENEFITS**

### **Individual Document Architecture**
```
✅ Fetch only needed documents = ~10KB each
✅ Update only one document at a time
✅ No document size limit issues
✅ Fast indexed queries
✅ Efficient pagination
✅ Scalable to thousands of documents
✅ Better concurrency (no conflicts)
```

---

## 🎯 **CURRENT STATUS**

### ✅ **Completed**
- ✅ Modern REST API with individual documents
- ✅ Video model with interview questions
- ✅ Note model with rich features
- ✅ Offline-first IndexedDB caching
- ✅ Clean backend architecture
- ✅ Removed all legacy code

### 🎉 **Architecture Status: FULLY MODERNIZED**

---

**Last Updated:** December 31, 2025  
**Author:** Coding Terminals Development Team  
**Status:** ✅ Production Ready
