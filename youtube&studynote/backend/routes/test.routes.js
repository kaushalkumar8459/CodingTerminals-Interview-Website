// File: backend/routes/test.routes.js
const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

// GET - Get all tests
router.get('/', testController.getAllTests);

// POST - Create new test
router.post('/', testController.createTest);

// POST - Generate automatic test
router.post('/generate', testController.generateTest);

// GET - Get test by ID
router.get('/:id', testController.getTestById);

// PUT - Update test
router.put('/:id', testController.updateTest);

// DELETE - Delete test
router.delete('/:id', testController.deleteTest);

// PUT - Publish test
router.put('/:id/publish', testController.publishTest);

module.exports = router;