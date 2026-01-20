// File: backend/routes/question.routes.js
const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// GET - Get all questions
router.get('/', questionController.getAllQuestions);

// GET - Get question by ID
router.get('/:id', questionController.getQuestionById);

// POST - Create new question
router.post('/', questionController.createQuestion);

// PUT - Update question
router.put('/:id', questionController.updateQuestion);

// DELETE - Delete question
router.delete('/:id', questionController.deleteQuestion);

// POST - Bulk delete questions
router.post('/bulk-delete', questionController.bulkDeleteQuestions);

// GET - Find duplicate questions
router.get('/duplicates/find', questionController.findDuplicates);

// GET - Get questions by subject
router.get('/subject/:subject', questionController.getQuestionsBySubject);

// GET - Get questions by year
router.get('/year/:year', questionController.getQuestionsByYear);

// POST - Save user answer
router.post('/answers/save', questionController.saveUserAnswer);

// GET - Get user progress
router.get('/progress/user', questionController.getUserProgress);

module.exports = router;