require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const portfolioRoutes = require('./routes/portfolioRoutes');
const profileRoutes = require('./routes/profileRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const educationRoutes = require('./routes/educationRoutes');
const skillRoutes = require('./routes/skillRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// ==================== API ROUTES ====================
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/skills', skillRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Portfolio Manager API'
    });
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
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n🚀 Portfolio Manager API Server Running!');
    console.log(`📡 Server URL: http://localhost:${PORT}`);
    console.log(`\n📁 API Endpoints:`);
    console.log(`   GET    /api/portfolio        - Get all portfolios`);
    console.log(`   GET    /api/portfolio/:id    - Get portfolio by ID`);
    console.log(`   GET    /api/portfolio/stats  - Get statistics`);
    console.log(`   POST   /api/portfolio        - Create portfolio (Admin)`);
    console.log(`   PUT    /api/portfolio/:id    - Update portfolio (Admin)`);
    console.log(`   DELETE /api/portfolio/:id    - Delete portfolio (Admin)`);
    console.log(`\n   GET    /api/profile          - Get profile info`);
    console.log(`   PUT    /api/profile          - Update profile (Admin)`);
    console.log(`\n   GET    /api/experience       - Get all experiences`);
    console.log(`   POST   /api/experience       - Create experience (Admin)`);
    console.log(`   PUT    /api/experience/:id   - Update experience (Admin)`);
    console.log(`   DELETE /api/experience/:id   - Delete experience (Admin)`);
    console.log(`\n   GET    /api/education        - Get all education`);
    console.log(`   POST   /api/education        - Create education (Admin)`);
    console.log(`   PUT    /api/education/:id    - Update education (Admin)`);
    console.log(`   DELETE /api/education/:id    - Delete education (Admin)`);
    console.log(`\n   GET    /api/skills           - Get all skills`);
    console.log(`   POST   /api/skills           - Create skill (Admin)`);
    console.log(`   PUT    /api/skills/:id       - Update skill (Admin)`);
    console.log(`   DELETE /api/skills/:id       - Delete skill (Admin)`);
    console.log('\n✨ Ready to manage your resume!\n');
});

module.exports = app;