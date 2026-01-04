/**
 * Backup Routes
 * Routes for backup operations on MongoDB collections
 */

const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');

// Get all documents from a backup collection
router.get('/:collectionName', backupController.getBackupCollection);

// Save/Replace documents in a backup collection
router.post('/:collectionName', backupController.saveBackupCollection);

// Clear all documents from a backup collection
router.delete('/:collectionName', backupController.clearBackupCollection);

// Copy data between collections
router.post('/copy', backupController.copyCollection);

// Get collection statistics
router.get('/stats/:collectionName', backupController.getCollectionStats);

module.exports = router;
