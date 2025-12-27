const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const APP_CONFIG = require('../config/app.config.js');

const app = express();
const PORT = APP_CONFIG.SERVER.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..'))); // Serve static files from parent directory

const YOUTUBE_ROADMAP_FILE = path.join(__dirname, APP_CONFIG.SERVER.YOUTUBE_ROADMAP_FILE);
const STUDY_NOTES_FILE = path.join(__dirname, APP_CONFIG.SERVER.STUDY_NOTES_FILE);

// ============================================
// AUTHENTICATION CONFIGURATION
// ============================================
// Load admin credentials from environment variables or use defaults
const ADMIN_USERS = [
    {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin@123'
    }
];

// You can add more users from environment variables
if (process.env.ADMIN_USER2_USERNAME && process.env.ADMIN_USER2_PASSWORD) {
    ADMIN_USERS.push({
        username: process.env.ADMIN_USER2_USERNAME,
        password: process.env.ADMIN_USER2_PASSWORD
    });
}

// API endpoint to get auth configuration (only returns usernames, not passwords)
app.get('/api/auth-config', (req, res) => {
    // Don't send actual passwords - just structure
    res.json({
        users: ADMIN_USERS.map(u => ({ username: u.username }))
    });
});

// API endpoint for login authentication
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    // Check if credentials match
    const user = ADMIN_USERS.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({ 
            success: true, 
            message: 'Login successful',
            username: user.username 
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid credentials' 
        });
    }
});

// ============================================
// YOUTUBE ROADMAP API ENDPOINTS
// ============================================

// API endpoint to get YouTube roadmap data
app.get('/api/youtube-roadmap', (req, res) => {
    try {
        if (fs.existsSync(YOUTUBE_ROADMAP_FILE)) {
            const data = fs.readFileSync(YOUTUBE_ROADMAP_FILE, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.json({
                channelName: "Coding Terminals",
                channelLogo: "./assets/CT logo.jpg",
                videoPlaylist: [],
                upcomingTopic: null
            });
        }
    } catch (error) {
        console.error('Error reading YouTube roadmap:', error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to save YouTube roadmap data
app.post('/api/youtube-roadmap', (req, res) => {
    try {
        const data = req.body;
        fs.writeFileSync(YOUTUBE_ROADMAP_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log('✅ YouTube Roadmap saved successfully!');
        res.json({ message: 'YouTube Roadmap saved successfully!' });
    } catch (error) {
        console.error('Error saving YouTube roadmap:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// STUDY NOTES API ENDPOINTS
// ============================================

// API endpoint to get study notes data
app.get('/api/study-notes', (req, res) => {
    try {
        if (fs.existsSync(STUDY_NOTES_FILE)) {
            const data = fs.readFileSync(STUDY_NOTES_FILE, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.json({
                _id: "study_notes_collection",
                version: "1.0",
                notes: [],
                categories: [],
                tags: []
            });
        }
    } catch (error) {
        console.error('Error reading study notes:', error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to save study notes data
app.post('/api/study-notes', (req, res) => {
    try {
        const data = req.body;
        fs.writeFileSync(STUDY_NOTES_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log('✅ Study Notes saved successfully!');
        res.json({ message: 'Study Notes saved successfully!' });
    } catch (error) {
        console.error('Error saving study notes:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// URL REDIRECTS & ALIASES
// ============================================

// Redirect short URLs to actual file paths
app.get('/CodingTerminals-YouTubeRoadmap/viewer/CodingTerminals.html', (req, res) => {
    res.redirect('/CodingTerminals-YouTubeRoadmap/viewer/YouTubeRoadmap-viewer.html');
});

app.get('/roadmap', (req, res) => {
    res.redirect('/CodingTerminals-YouTubeRoadmap/viewer/YouTubeRoadmap-viewer.html');
});

app.get('/notes', (req, res) => {
    res.redirect('/CodingTerminals-StudyNotes/viewer/study-notes-viewer.html');
});

// Default route - redirect to YouTube Roadmap viewer
app.get('/', (req, res) => {
    res.redirect('/CodingTerminals-YouTubeRoadmap/viewer/YouTubeRoadmap-viewer.html');
});

// Start server
app.listen(PORT, () => {
    console.log('\n🚀 CodingTerminals Server is running!');
    console.log(`\n📺 YouTube Roadmap:`);
    console.log(`   🔐 Login: ${APP_CONFIG.API.BASE_URL}/auth/login.html`);
    console.log(`   📝 Admin: ${APP_CONFIG.API.BASE_URL}/CodingTerminals-YouTubeRoadmap/admin/YouTubeRoadmap-admin.html`);
    console.log(`   👁️  Viewer: ${APP_CONFIG.API.BASE_URL}/CodingTerminals-YouTubeRoadmap/viewer/YouTubeRoadmap-viewer.html`);
    console.log(`\n📚 Study Notes:`);
    console.log(`   🔐 Login: ${APP_CONFIG.API.BASE_URL}/auth/login.html`);
    console.log(`   📝 Admin: ${APP_CONFIG.API.BASE_URL}/CodingTerminals-StudyNotes/admin/study-notes.html`);
    console.log(`   👁️  Viewer: ${APP_CONFIG.API.BASE_URL}/CodingTerminals-StudyNotes/viewer/study-notes-viewer.html`);
    console.log(`\n📡 API Endpoints:`);
    console.log(`   - YouTube Roadmap: ${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.YOUTUBE_ROADMAP}`);
    console.log(`   - Study Notes: ${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.STUDY_NOTES}`);
    console.log('\n✨ Ready to manage your content!\n');
    console.log('👤 Admin Credentials:');
    console.log(`Username: ${ADMIN_USERS[0].username}`);
    console.log(`Password: ${ADMIN_USERS[0].password}`);
    console.log('\n⚠️  Change credentials using environment variables in production!\n');
});
