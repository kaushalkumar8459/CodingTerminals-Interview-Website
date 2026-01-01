const express = require('express');
const router = express.Router();
const interviewQuestionController = require('../controllers/interviewQuestionController');

/**
 * Interview Question Routes
 * /api/interview-questions
 */

// GET - Get all questions for a specific video
router.get('/video/:videoId', interviewQuestionController.getQuestionsByVideoId);

// POST - Create new question
router.post('/', interviewQuestionController.createQuestion);

// PUT - Update question
router.put('/:id', interviewQuestionController.updateQuestion);

// DELETE - Delete question
router.delete('/:id', interviewQuestionController.deleteQuestion);

// POST - Bulk upsert questions for a video
router.post('/bulk', interviewQuestionController.bulkUpsertQuestions);

module.exports = router;
