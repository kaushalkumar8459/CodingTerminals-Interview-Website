const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: Video management API endpoints
 */

/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: Get all videos
 *     tags: [Videos]
 *     description: Retrieve all videos from the database
 *     responses:
 *       200:
 *         description: List of all videos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Video'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', videoController.getAllVideos);

/**
 * @swagger
 * /api/videos/upcoming:
 *   get:
 *     summary: Get upcoming videos
 *     tags: [Videos]
 *     description: Retrieve only upcoming videos (not yet published)
 *     responses:
 *       200:
 *         description: List of upcoming videos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Video'
 *       500:
 *         description: Server error
 */
router.get('/upcoming', videoController.getUpcomingVideos);

/**
 * @swagger
 * /api/videos/{id}:
 *   get:
 *     summary: Get video by MongoDB ID
 *     tags: [Videos]
 *     description: Retrieve a specific video by its MongoDB ObjectId
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the video
 *     responses:
 *       200:
 *         description: Video found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       404:
 *         description: Video not found
 *       500:
 *         description: Server error
 */
router.get('/:id', videoController.getVideoById);

/**
 * @swagger
 * /api/videos/youtube/{videoId}:
 *   get:
 *     summary: Get video by YouTube video ID
 *     tags: [Videos]
 *     description: Retrieve a video by its YouTube video ID
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: YouTube video ID
 *     responses:
 *       200:
 *         description: Video found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       404:
 *         description: Video not found
 *       500:
 *         description: Server error
 */
router.get('/youtube/:videoId', videoController.getVideoByYouTubeId);

/**
 * @swagger
 * /api/videos:
 *   post:
 *     summary: Create new video
 *     tags: [Videos]
 *     description: Create a new video document
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Video'
 *     responses:
 *       201:
 *         description: Video created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', videoController.createVideo);

/**
 * @swagger
 * /api/videos/{id}:
 *   put:
 *     summary: Update video
 *     tags: [Videos]
 *     description: Update an existing video by MongoDB ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the video
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Video'
 *     responses:
 *       200:
 *         description: Video updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       404:
 *         description: Video not found
 *       500:
 *         description: Server error
 */
router.put('/:id', videoController.updateVideo);

/**
 * @swagger
 * /api/videos/{id}:
 *   delete:
 *     summary: Delete video
 *     tags: [Videos]
 *     description: Delete a video by MongoDB ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the video
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       404:
 *         description: Video not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', videoController.deleteVideo);

/**
 * @swagger
 * /api/videos/bulk:
 *   post:
 *     summary: Bulk upsert videos
 *     tags: [Videos]
 *     description: Create or update multiple videos in one request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Video'
 *     responses:
 *       201:
 *         description: Videos upserted successfully
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
router.post('/bulk', videoController.bulkUpsertVideos);

/**
 * @swagger
 * /api/videos/roadmap:
 *   post:
 *     summary: Save complete YouTube roadmap
 *     tags: [Videos]
 *     description: Save the complete YouTube roadmap (admin panel compatibility)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               videos:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Video'
 *     responses:
 *       201:
 *         description: Roadmap saved successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/roadmap', videoController.saveYouTubeRoadmap);

module.exports = router;
