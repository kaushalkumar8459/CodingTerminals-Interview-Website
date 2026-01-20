// ✅ Load environment variables from .env.{NODE_ENV} file
require('./env-loader');

const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config');
const connectDB = require('./config/database');
const { authRoutes, videoRoutes, noteRoutes, backupRoutes } = require('./routes');
const interviewQuestionRoutes = require('./routes/interviewQuestion.routes');
const APP_CONFIG = require('../config/app.config.js');

const app = express();
// ✅ Render automatically provides PORT via environment variable
const PORT = process.env.PORT || APP_CONFIG.SERVER.PORT || 3000;

// Connect to MongoDB
connectDB();

// ✅ RENDER-OPTIMIZED CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // List of allowed origins
        const allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            // Add your Render frontend URL here (will be auto-detected in production)
            process.env.FRONTEND_URL || 'https://your-app.netlify.app',
            /\.netlify\.app$/, // Allow all Netlify preview URLs
            /\.render\.com$/, // Allow Render URLs
            /\.ngrok\.io$/ // Allow ngrok URLs for local testing
        ];

        // In production, also allow the current origin
        if (process.env.NODE_ENV === 'production' && origin) {
            return callback(null, true);
        }

        // Check if origin matches any allowed pattern
        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return allowed === origin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('⚠️ Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..'))); // Serve static files

// ============================================
// SWAGGER DOCUMENTATION
// ============================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
        persistAuthorization: true,
        displayOperationId: true
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CodingTerminals API Documentation'
}));

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

// Serve TestSeries admin panel
app.use('/testseries/admin', express.static(path.join(__dirname, '../CodingTerminals-TestSeries/admin')));

// Serve TestSeries viewer
app.use('/testseries/viewer', express.static(path.join(__dirname, '../CodingTerminals-TestSeries/viewer')));

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


// Add redirect routes for easier access
app.get('/testseries', (req, res) => {
    res.redirect('/testseries/admin/question-upload.html');
});

app.get('/test-series', (req, res) => {
    res.redirect('/testseries/admin/question-upload.html');
});

app.get('/tests', (req, res) => {
    res.redirect('/testseries/viewer/practice-interface.html');
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
    console.log(`📡 Server URL: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`\n📺 YouTube Roadmap:`);
    console.log(`   🔐 Login: http://localhost:${PORT}/auth/login.html`);
    console.log(`   📝 Admin: http://localhost:${PORT}/CodingTerminals-YouTubeRoadmap/admin/YouTubeRoadmap-admin.html`);
    console.log(`   👁️  Viewer: http://localhost:${PORT}/CodingTerminals-YouTubeRoadmap/viewer/YouTubeRoadmap-viewer.html`);
    console.log(`\n📚 Study Notes:`);
    console.log(`   🔐 Login: http://localhost:${PORT}/auth/login.html`);
    console.log(`   📝 Admin: http://localhost:${PORT}/CodingTerminals-StudyNotes/admin/study-notes-admin.html`);
    console.log(`   👁️  Viewer: http://localhost:${PORT}/CodingTerminals-StudyNotes/viewer/study-notes-viewer.html`);
    console.log(`\n📡 API Endpoints:`);
    console.log(`   - Videos: http://localhost:${PORT}/api/videos`);
    console.log(`   - Notes: http://localhost:${PORT}/api/notes`);
    console.log(`   - Interview Questions: http://localhost:${PORT}/api/interview-questions`);
    console.log(`   - Authentication: http://localhost:${PORT}/api/auth/login`);
    console.log('\n✨ Ready to manage your content!\n');
});
