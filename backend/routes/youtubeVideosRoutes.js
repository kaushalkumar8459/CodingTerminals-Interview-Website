const express = require('express');
const router = express.Router();
const youtubeVideoController = require('../controllers/youtubeVideoController');
const interviewQuestionController = require('../controllers/interviewQuestionController');

/**
 * New Optimized YouTube API Routes
 * Uses separate collections for videos and questions
 * RESTful design with pagination and search
 */

// ============================================
// VIDEO ROUTES
// ============================================

// Get all videos (with pagination, filtering, search)
// Example: GET /api/videos?page=1&limit=10&status=published&search=angular
router.get('/videos', youtubeVideoController.getAllVideos);

// Get video statistics
router.get('/videos/stats', youtubeVideoController.getStatistics);

// Get upcoming videos
router.get('/videos/upcoming', youtubeVideoController.getUpcomingVideos);

// Get video by day number
router.get('/videos/day/:day', youtubeVideoController.getVideoByDay);

// Get single video by videoId
router.get('/videos/:videoId', youtubeVideoController.getVideoById);

// Create new video
router.post('/videos', youtubeVideoController.createVideo);

// Update video
router.put('/videos/:videoId', youtubeVideoController.updateVideo);

// Delete video
router.delete('/videos/:videoId', youtubeVideoController.deleteVideo);

// Bulk update videos
router.post('/videos/bulk-update', youtubeVideoController.bulkUpdate);

// ============================================
// QUESTION ROUTES
// ============================================

// Search questions across all videos
// Example: GET /api/questions/search?q=component&difficulty=medium
router.get('/questions/search', interviewQuestionController.searchQuestions);

// Get questions by difficulty
router.get('/questions/difficulty/:level', interviewQuestionController.getQuestionsByDifficulty);

// Get single question by ID
router.get('/questions/:id', interviewQuestionController.getQuestionById);

// Update question
router.put('/questions/:id', interviewQuestionController.updateQuestion);

// Delete question
router.delete('/questions/:id', interviewQuestionController.deleteQuestion);

// Get all questions for a specific video
router.get('/videos/:videoId/questions', interviewQuestionController.getQuestionsByVideo);

// Create new question for a video
router.post('/videos/:videoId/questions', interviewQuestionController.createQuestion);

// Bulk create questions
router.post('/videos/:videoId/questions/bulk', interviewQuestionController.bulkCreateQuestions);

// Reorder questions
router.put('/videos/:videoId/questions/reorder', interviewQuestionController.reorderQuestions);

// Delete all questions for a video
router.delete('/videos/:videoId/questions', interviewQuestionController.deleteAllQuestionsForVideo);

module.exports = router;
