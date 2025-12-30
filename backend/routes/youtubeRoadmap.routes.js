const express = require('express');
const router = express.Router();
const youtubeRoadmapController = require('../controllers/youtubeRoadmapController');

/**
 * YouTube Roadmap Routes
 * /api/youtube-roadmap
 */

// GET - Retrieve YouTube roadmap data
router.get('/', youtubeRoadmapController.getRoadmap);

// POST - Save YouTube roadmap data
router.post('/', youtubeRoadmapController.saveRoadmap);

// ==================== BACKUP COLLECTION ROUTES ====================

// GET - Get roadmap from specific collection (active/temp/final)
router.get('/collection/:collectionType', youtubeRoadmapController.getRoadmapFromCollection);

// POST - Copy data between collections
router.post('/backup/copy', youtubeRoadmapController.copyToCollection);

// GET - Get backup status for all collections
router.get('/backup/status', youtubeRoadmapController.getBackupStatus);

// GET - Export roadmap with Base64 images
router.get('/export', youtubeRoadmapController.exportWithImages);

// POST - Import roadmap with Base64 images
router.post('/import', youtubeRoadmapController.importWithImages);

// DELETE - Clear a specific collection
router.delete('/collection/:collectionType', youtubeRoadmapController.clearCollection);

module.exports = router;
