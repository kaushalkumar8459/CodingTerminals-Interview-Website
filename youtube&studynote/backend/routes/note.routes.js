const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

/**
 * Note Routes
 * RESTful API routes for individual study note documents
 * Base path: /api/notes
 */

// Get all notes
router.get('/', noteController.getAllNotes);

// Search notes
router.get('/search', noteController.searchNotes);

// Get notes by category
router.get('/category/:category', noteController.getNotesByCategory);

// Get note by noteId
router.get('/note/:noteId', noteController.getNoteByNoteId);

// Get note by MongoDB ID
router.get('/:id', noteController.getNoteById);

// Create new note
router.post('/', noteController.createNote);

// Bulk upsert notes
router.post('/bulk', noteController.bulkUpsertNotes);

// Update note
router.put('/:id', noteController.updateNote);

// Delete note
router.delete('/:id', noteController.deleteNote);

module.exports = router;
