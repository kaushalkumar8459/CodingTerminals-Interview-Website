const express = require('express');
const router = express.Router();
const studyNotesController = require('../controllers/studyNotesController');

/**
 * Study Notes Routes
 * /api/studynotes
 */

// GET - Retrieve study notes data
router.get('/', studyNotesController.getNotes);

// POST - Save study notes data
router.post('/', studyNotesController.saveNotes);

module.exports = router;
