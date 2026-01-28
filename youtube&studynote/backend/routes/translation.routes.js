// File: backend/routes/translation.routes.js
const express = require('express');
const router = express.Router();
const { translateText, translateBatch } = require('../controllers/translationController');

// Translate single text
router.post('/translate', translateText);

// Translate multiple texts
router.post('/translate/batch', translateBatch);

module.exports = router;