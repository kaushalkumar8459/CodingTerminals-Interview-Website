const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication and authorization endpoints
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

/**
 * @swagger
 * /api/auth/config:
 *   get:
 *     summary: Get authentication configuration
 *     tags: [Authentication]
 *     description: Retrieve available admin usernames (passwords not returned for security)
 *     responses:
 *       200:
 *         description: Authentication configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 */
router.get('/config', (req, res) => {
    res.json({
        users: ADMIN_USERS.map(u => ({ username: u.username }))
    });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Authentication]
 *     description: Authenticate admin user with username and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Admin username
 *               password:
 *                 type: string
 *                 description: Admin password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 username:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
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
