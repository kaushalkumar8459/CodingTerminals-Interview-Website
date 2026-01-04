const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

/**
 * Profile Routes
 * Base URL: /api/profile
 */

// GET profile
router.get('/', profileController.getProfile);

// UPDATE profile (ADMIN)
router.put('/', profileController.updateProfile);

module.exports = router;