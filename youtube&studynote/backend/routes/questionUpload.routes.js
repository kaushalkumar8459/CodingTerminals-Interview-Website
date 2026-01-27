// File: backend/routes/questionUpload.routes.js
const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// POST - Upload question paper
router.post('/upload', questionController.uploadQuestionPaper);

// POST - Import questions from CSV
router.post('/import/csv', questionController.importFromCSV);

// POST - Import questions from Excel
router.post('/import/excel', questionController.importFromExcel);

// POST - Import questions from text
router.post('/import/text', questionController.importFromText);

// POST - Sync with database
router.post('/sync', questionController.syncWithDatabase);

module.exports = router;