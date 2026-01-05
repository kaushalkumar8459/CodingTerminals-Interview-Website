const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Study notes management API endpoints
 */

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Get all notes
 *     tags: [Notes]
 *     description: Retrieve all study notes from the database
 *     responses:
 *       200:
 *         description: List of all notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 *       500:
 *         description: Server error
 */
router.get('/', noteController.getAllNotes);

/**
 * @swagger
 * /api/notes/search:
 *   get:
 *     summary: Search notes
 *     tags: [Notes]
 *     description: Search notes by keyword, title, or content
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 *       500:
 *         description: Server error
 */
router.get('/search', noteController.searchNotes);

/**
 * @swagger
 * /api/notes/category/{category}:
 *   get:
 *     summary: Get notes by category
 *     tags: [Notes]
 *     description: Retrieve notes filtered by category
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Note category
 *     responses:
 *       200:
 *         description: Notes in category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 *       500:
 *         description: Server error
 */
router.get('/category/:category', noteController.getNotesByCategory);

/**
 * @swagger
 * /api/notes/note/{noteId}:
 *   get:
 *     summary: Get note by noteId
 *     tags: [Notes]
 *     description: Retrieve a specific note by its noteId
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
router.get('/note/:noteId', noteController.getNoteByNoteId);

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Get note by MongoDB ID
 *     tags: [Notes]
 *     description: Retrieve a note by its MongoDB ObjectId
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId
 *     responses:
 *       200:
 *         description: Note found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
router.get('/:id', noteController.getNoteById);

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Create new note
 *     tags: [Notes]
 *     description: Create a new study note document
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Note'
 *     responses:
 *       201:
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', noteController.createNote);

/**
 * @swagger
 * /api/notes/bulk:
 *   post:
 *     summary: Bulk upsert notes
 *     tags: [Notes]
 *     description: Create or update multiple notes in one request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Note'
 *     responses:
 *       201:
 *         description: Notes upserted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inserted:
 *                   type: number
 *                 updated:
 *                   type: number
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/bulk', noteController.bulkUpsertNotes);

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: Update note
 *     tags: [Notes]
 *     description: Update an existing note by MongoDB ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Note'
 *     responses:
 *       200:
 *         description: Note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
router.put('/:id', noteController.updateNote);

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Delete note
 *     tags: [Notes]
 *     description: Delete a note by MongoDB ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', noteController.deleteNote);

module.exports = router;
