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
app.use(express.static(path.join(__dirname, '..'))); // Serve static files from parent directory (roadmap folder)

const JSON_FILE = path.join(__dirname, APP_CONFIG.SERVER.JSON_FILE_PATH); // JSON file from config
const STUDY_NOTES_FILE = path.join(__dirname, '../assets/studyNotesData.json'); // Study notes JSON file

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

// API endpoint to get video playlist data
app.get('/api/roadmap', (req, res) => {
    try {
        if (fs.existsSync(JSON_FILE)) {
            const data = fs.readFileSync(JSON_FILE, 'utf8');
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
        console.error('Error reading video playlist:', error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to save video playlist data
app.post('/api/roadmap', (req, res) => {
    try {
        const data = req.body;
        fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log('✅ Video Playlist saved successfully!');
        res.json({ message: 'Video Playlist saved successfully!' });
    } catch (error) {
        console.error('Error saving video playlist:', error);
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

// Start server
app.listen(PORT, () => {
    console.log('\n🚀 Server is running!');
    console.log(`🔐 Login Page: ${APP_CONFIG.API.BASE_URL}/CodingTerminals-admin/login.html`);
    console.log(`📝 Admin Panel: ${APP_CONFIG.API.BASE_URL}/CodingTerminals-admin/admin.html`);
    console.log(`📚 Study Notes: ${APP_CONFIG.API.BASE_URL}/CodingTerminals-admin/study-notes/study-notes.html`);
    console.log(`👁️  Video Playlist Viewer: ${APP_CONFIG.API.BASE_URL}/CodingTerminals-viewer/CodingTerminals.html`);
    console.log(`📡 API Endpoints:`);
    console.log(`   - Video Playlist: ${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.ROADMAP}`);
    console.log(`   - Study Notes: ${APP_CONFIG.API.BASE_URL}/api/study-notes`);
    console.log('\n✨ Ready to manage your content!\n');
    console.log('👤 Admin Credentials:');
    console.log(`Username: ${ADMIN_USERS[0].username}`);
    console.log(`Password: ${ADMIN_USERS[0].password}`);
    console.log('\n⚠️  Change credentials using environment variables in production!\n');
});
