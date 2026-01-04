const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');

/**
 * Skill Routes
 * Base URL: /api/skills
 */

// Public routes
router.get('/', skillController.getAllSkills);
router.get('/:id', skillController.getSkillById);

// Admin routes
router.post('/', skillController.createSkill);
router.put('/:id', skillController.updateSkill);
router.delete('/:id', skillController.deleteSkill);

module.exports = router;