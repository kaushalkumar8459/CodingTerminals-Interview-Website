const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

/**
 * Video Routes (NEW)
 * RESTful API routes for individual video documents
 * Base path: /api/videos
 */

// Get all videos
router.get('/', videoController.getAllVideos);

// Get only upcoming videos
router.get('/upcoming', videoController.getUpcomingVideos);

// Get video by MongoDB ID
router.get('/:id', videoController.getVideoById);

// Get video by YouTube video ID
router.get('/youtube/:videoId', videoController.getVideoByYouTubeId);

// Create new video
router.post('/', videoController.createVideo);

// Update video
router.put('/:id', videoController.updateVideo);

// Delete video
router.delete('/:id', videoController.deleteVideo);

// Bulk upsert videos
router.post('/bulk', videoController.bulkUpsertVideos);

// Save complete YouTube roadmap (for admin panel compatibility)
router.post('/roadmap', videoController.saveYouTubeRoadmap);

module.exports = router;
