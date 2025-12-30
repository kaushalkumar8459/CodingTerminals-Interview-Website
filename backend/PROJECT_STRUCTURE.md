# 📁 Backend Project Structure

## Overview
This backend follows the **MVC (Model-View-Controller)** architecture pattern with clear separation of concerns for scalability and maintainability.

---

## 📂 Folder Structure

```
backend/
├── config/                    # Configuration files
│   └── database.js           # MongoDB connection setup
│
├── models/                    # Database models (Mongoose schemas)
│   ├── index.js              # Models index (exports all models)
│   ├── YouTubeRoadmap.js     # YouTube Roadmap schema
│   └── StudyNotes.js         # Study Notes schema
│
├── controllers/               # Business logic layer
│   ├── youtubeRoadmapController.js   # YouTube Roadmap logic
│   └── studyNotesController.js       # Study Notes logic
│
├── routes/                    # API route definitions
│   ├── index.js              # Routes index (exports all routes)
│   ├── youtubeRoadmap.routes.js      # YouTube Roadmap endpoints
│   ├── studyNotes.routes.js          # Study Notes endpoints
│   └── auth.routes.js                # Authentication endpoints
│
├── middleware/                # Custom middleware (future use)
│   └── (empty for now - ready for auth, validation, etc.)
│
├── services/                  # Business services (future use)
│   └── (empty for now - ready for email, notifications, etc.)
│
├── utils/                     # Utility functions (future use)
│   └── (empty for now - ready for helpers, validators, etc.)
│
├── .env                       # Environment variables
├── package.json               # Dependencies
├── server.js                  # Main application entry point
├── models.js                  # Legacy file (can be removed)
├── MONGODB_SETUP.md          # MongoDB setup guide
└── README.md                  # Backend documentation
```

---

## 🔄 Request Flow

```
Client Request
      ↓
   server.js (Entry Point)
      ↓
   Routes (routes/*.routes.js)
      ↓
   Controllers (controllers/*Controller.js)
      ↓
   Models (models/*.js)
      ↓
   Database (MongoDB / JSON Files)
      ↓
   Response back to Client
```

---

## 📝 File Responsibilities

### **1. server.js**
- Main entry point
- Express app configuration
- Middleware setup
- Route mounting
- Error handling
- Server startup

### **2. config/database.js**
- MongoDB connection logic
- Connection event handlers
- Graceful shutdown handling

### **3. models/**
- Database schemas
- Data validation
- Indexes for performance
- Model methods (future)

### **4. controllers/**
- Business logic
- Request/response handling
- Data validation
- Error handling
- Service coordination

### **5. routes/**
- HTTP endpoint definitions
- Route-to-controller mapping
- Route-specific middleware (future)

### **6. middleware/** (Ready for future use)
- Authentication middleware
- Authorization checks
- Request validation
- Rate limiting
- Logging

### **7. services/** (Ready for future use)
- Email service
- File upload service
- External API integrations
- Background jobs

### **8. utils/** (Ready for future use)
- Helper functions
- Custom validators
- Data formatters
- Constants

---

## 🎯 Design Principles

### ✅ **Separation of Concerns**
Each layer has a single responsibility:
- **Routes**: Define endpoints
- **Controllers**: Handle business logic
- **Models**: Define data structure
- **Config**: Manage settings

### ✅ **Scalability**
Easy to add new features:
```javascript
// Add new feature in 3 steps:
1. Create model in models/
2. Create controller in controllers/
3. Create routes in routes/
```

### ✅ **Maintainability**
- Clear folder structure
- Consistent naming conventions
- Well-documented code
- Single responsibility principle

### ✅ **Testability**
Each layer can be tested independently:
- Unit tests for controllers
- Integration tests for routes
- Database tests for models

---

## 🔧 Adding New Features

### Example: Adding a "Blog Posts" Feature

**Step 1: Create Model**
```javascript
// models/BlogPost.js
const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: String,
    author: String,
    tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);
```

**Step 2: Create Controller**
```javascript
// controllers/blogPostController.js
const BlogPost = require('../models/BlogPost');

class BlogPostController {
    async getPosts(req, res) {
        try {
            const posts = await BlogPost.find();
            res.json(posts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    async createPost(req, res) {
        try {
            const post = new BlogPost(req.body);
            await post.save();
            res.json(post);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new BlogPostController();
```

**Step 3: Create Routes**
```javascript
// routes/blogPost.routes.js
const express = require('express');
const router = express.Router();
const blogPostController = require('../controllers/blogPostController');

router.get('/', blogPostController.getPosts);
router.post('/', blogPostController.createPost);

module.exports = router;
```

**Step 4: Mount in server.js**
```javascript
const blogPostRoutes = require('./routes/blogPost.routes');
app.use('/api/blog-posts', blogPostRoutes);
```

Done! ✅

---

## 🔐 Security Best Practices

### ✅ **Environment Variables**
- Never commit `.env` file
- Use strong passwords in production
- Rotate credentials regularly

### ✅ **Input Validation**
- Validate all user inputs
- Sanitize data before saving
- Use middleware for validation

### ✅ **Error Handling**
- Don't expose sensitive errors
- Log errors securely
- Use proper HTTP status codes

### ✅ **Database Security**
- Use indexes for performance
- Implement query limits
- Validate schemas strictly

---

## 🚀 Future Enhancements

### Phase 1: ✅ Current
- ✅ Basic CRUD operations
- ✅ MongoDB integration
- ✅ JSON file backup
- ✅ Organized structure

### Phase 2: 🔄 Next
- [ ] Authentication middleware (JWT)
- [ ] Input validation middleware
- [ ] Request logging
- [ ] Rate limiting

### Phase 3: 📅 Future
- [ ] File upload service
- [ ] Email notifications
- [ ] Caching layer (Redis)
- [ ] Background jobs
- [ ] API versioning
- [ ] Swagger documentation

---

## 📊 Current vs New Structure

### **Before (Old Structure):**
```
backend/
├── server.js (500+ lines - everything in one file)
├── models.js
├── package.json
└── README.md
```
❌ Hard to maintain
❌ Difficult to test
❌ Can't scale easily

### **After (New Structure):**
```
backend/
├── config/          ← Database setup
├── models/          ← Data schemas
├── controllers/     ← Business logic
├── routes/          ← API endpoints
├── middleware/      ← Ready for auth
├── services/        ← Ready for features
├── utils/           ← Ready for helpers
├── server.js        ← Clean entry point (80 lines)
└── ...
```
✅ Easy to maintain
✅ Simple to test
✅ Scales naturally

---

## 🎓 Learning Resources

### Recommended Order:
1. **Understand server.js** - Entry point
2. **Study routes/** - API endpoints
3. **Review controllers/** - Business logic
4. **Explore models/** - Data structure
5. **Check config/** - Database setup

### Key Concepts:
- **MVC Pattern**: Separation of concerns
- **REST API**: Standard HTTP methods
- **Mongoose**: MongoDB ODM
- **Express.js**: Web framework
- **Async/Await**: Asynchronous operations

---

## 📞 Quick Reference

### Start Server
```bash
cd backend
npm start       # Production
npm run dev     # Development (auto-reload)
```

### Add New Route
1. Create model in `models/`
2. Create controller in `controllers/`
3. Create routes in `routes/`
4. Mount in `server.js`

### File Naming Convention
- **Models**: PascalCase (e.g., `YouTubeRoadmap.js`)
- **Controllers**: camelCase with suffix (e.g., `youtubeRoadmapController.js`)
- **Routes**: camelCase with suffix (e.g., `youtubeRoadmap.routes.js`)

---

**Created:** December 28, 2025  
**Last Updated:** December 28, 2025  
**Version:** 2.0.0 (Refactored)
