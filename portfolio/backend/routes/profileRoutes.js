const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

/**
 * Profile Routes
 * Base URL: /api/profile
 */

/**
 * GET /api/profile
 * Fetch complete profile information
 * Access: Public (read-only)
 */
router.get('/', profileController.getProfile);

/**
 * GET /api/profile/summary
 * Fetch lightweight profile summary (name, title, image, contact info)
 * Access: Public
 */
router.get('/summary', profileController.getProfileSummary);

/**
 * PUT /api/profile
 * Update profile information
 * Access: Admin only
 * Requires: Authorization header with admin token
 */
router.put('/', profileController.updateProfile);

module.exports = router;