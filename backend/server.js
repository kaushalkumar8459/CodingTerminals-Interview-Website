require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/database');
const { youtubeRoadmapRoutes, studyNotesRoutes, authRoutes } = require('./routes');
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

// API Routes
app.use('/api/youtube-roadmap', youtubeRoadmapRoutes);
app.use('/api/study-notes', studyNotesRoutes);
app.use('/api/auth', authRoutes);

// Legacy auth endpoints (for backward compatibility)
app.get('/api/auth-config', (req, res) => {
    res.redirect('/api/auth/config');
});

app.post('/api/auth/login', (req, res, next) => {
    // Handled by auth routes
    next();
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
    console.log(`   - YouTube Roadmap: ${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.YOUTUBE_ROADMAP}`);
    console.log(`   - Study Notes: ${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.STUDY_NOTES}`);
    console.log(`   - Authentication: ${APP_CONFIG.API.BASE_URL}/api/auth/login`);
    console.log('\n✨ Ready to manage your content!\n');
});
