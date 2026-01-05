const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experienceController');

/**
 * Experience Routes
 * Base URL: /api/experience
 */

// Public routes
router.get('/', experienceController.getAllExperiences);
router.get('/:id', experienceController.getExperienceById);

// Admin routes
router.post('/', experienceController.createExperience);
router.put('/:id', experienceController.updateExperience);
router.delete('/:id', experienceController.deleteExperience);

module.exports = router;