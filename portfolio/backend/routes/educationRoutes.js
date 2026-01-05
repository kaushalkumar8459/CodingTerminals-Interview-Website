const express = require('express');
const router = express.Router();
const educationController = require('../controllers/educationController');

/**
 * Education Routes
 * Base URL: /api/education
 */

// Public routes
router.get('/', educationController.getAllEducation);
router.get('/:id', educationController.getEducationById);

// Admin routes
router.post('/', educationController.createEducation);
router.put('/:id', educationController.updateEducation);
router.delete('/:id', educationController.deleteEducation);

module.exports = router;