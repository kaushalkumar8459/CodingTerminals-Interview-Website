const express = require('express');
const router = express.Router();

/**
 * Authentication Routes
 * /api/auth
 */

// Load admin credentials from environment variables
const ADMIN_USERS = [
    {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin@123'
    }
];

// Add additional users from environment variables
if (process.env.ADMIN_USER2_USERNAME && process.env.ADMIN_USER2_PASSWORD) {
    ADMIN_USERS.push({
        username: process.env.ADMIN_USER2_USERNAME,
        password: process.env.ADMIN_USER2_PASSWORD
    });
}

// GET - Auth configuration (returns only usernames, not passwords)
router.get('/config', (req, res) => {
    res.json({
        users: ADMIN_USERS.map(u => ({ username: u.username }))
    });
});

// POST - Login authentication
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Validate credentials
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

module.exports = router;
