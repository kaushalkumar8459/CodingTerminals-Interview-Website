require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/database');
const { authRoutes, videoRoutes, noteRoutes, backupRoutes } = require('./routes');
const interviewQuestionRoutes = require('./routes/interviewQuestion.routes');
const APP_CONFIG = require('../config/app.config.js');

const app = express();
const PORT = process.env.PORT || APP_CONFIG.SERVER.PORT;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..'))); // Serve static files

// ============================================
// API ROUTES (MODERN ARCHITECTURE)
// ============================================

// Individual video documents API
app.use('/api/videos', videoRoutes);

// YouTube Roadmap bulk save (for admin panel compatibility)
app.post('/api/youtube-roadmap', require('./controllers/videoController').saveYouTubeRoadmap);

// YouTube Roadmap GET endpoint (for viewer to fetch data)
app.get('/api/youtube-roadmap', require('./controllers/videoController').getAllVideos);

// Individual note documents API
app.use('/api/notes', noteRoutes);

// Interview Questions API (linked to videos by videoId)
app.use('/api/interview-questions', interviewQuestionRoutes);

// Authentication API
app.use('/api/auth', authRoutes);

// Backup API for Notes
app.use('/api/notes/backup', backupRoutes);

// Backup API for Videos
app.use('/api/videos/backup', backupRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ============================================
// URL REDIRECTS & ALIASES
// ============================================

app.get('/CodingTerminals-YouTubeRoadmap/viewer/CodingTerminals.html', (req, res) => {
    res.redirect('/CodingTerminals-YouTubeRoadmap/viewer/YouTubeRoadmap-viewer.html');
});

app.get('/roadmap', (req, res) => {
    res.redirect('/CodingTerminals-YouTubeRoadmap/viewer/YouTubeRoadmap-viewer.html');
});

app.get('/notes', (req, res) => {
    res.redirect('/CodingTerminals-StudyNotes/viewer/study-notes-viewer.html');
});

// Default route
app.get('/', (req, res) => {
    res.redirect('/CodingTerminals-YouTubeRoadmap/viewer/YouTubeRoadmap-viewer.html');
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not Found',
        message: `Route ${req.url} not found` 
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n🚀 CodingTerminals Server is running!');
    console.log(`📡 Server URL: ${APP_CONFIG.API.BASE_URL}`);
    console.log(`\n📺 YouTube Roadmap:`);
    console.log(`   🔐 Login: ${APP_CONFIG.API.BASE_URL}/auth/login.html`);
    console.log(`   📝 Admin: ${APP_CONFIG.API.BASE_URL}/CodingTerminals-YouTubeRoadmap/admin/YouTubeRoadmap-admin.html`);
    console.log(`   👁️  Viewer: ${APP_CONFIG.API.BASE_URL}/CodingTerminals-YouTubeRoadmap/viewer/YouTubeRoadmap-viewer.html`);
    console.log(`\n📚 Study Notes:`);
    console.log(`   🔐 Login: ${APP_CONFIG.API.BASE_URL}/auth/login.html`);
    console.log(`   📝 Admin: ${APP_CONFIG.API.BASE_URL}/CodingTerminals-StudyNotes/admin/study-notes-admin.html`);
    console.log(`   👁️  Viewer: ${APP_CONFIG.API.BASE_URL}/CodingTerminals-StudyNotes/viewer/study-notes-viewer.html`);
    console.log(`\n📡 API Endpoints:`);
    console.log(`   - Videos: ${APP_CONFIG.API.BASE_URL}/api/videos`);
    console.log(`   - Notes: ${APP_CONFIG.API.BASE_URL}/api/notes`);
    console.log(`   - Interview Questions: ${APP_CONFIG.API.BASE_URL}/api/interview-questions`);
    console.log(`   - Authentication: ${APP_CONFIG.API.BASE_URL}/api/auth/login`);
    console.log('\n✨ Ready to manage your content!\n');
});
