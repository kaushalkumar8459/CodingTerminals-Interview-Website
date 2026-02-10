// File: backend/routes/userProgress.routes.js
const express = require('express');
const router = express.Router();
const userProgressController = require('../controllers/userProgressController');

/**
 * @swagger
 * tags:
 *   name: UserProgress
 *   description: Track and manage user's test progress and statistics
 */

/**
 * @swagger
 * /api/user-progress/submit-test:
 *   post:
 *     summary: Submit test results (batch save)
 *     tags: [UserProgress]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               testId:
 *                 type: string
 *                 description: ID of the test (optional for practice mode)
 *               userId:
 *                 type: string
 *                 description: User ID (optional, defaults to anonymous)
 *               sessionType:
 *                 type: string
 *                 enum: [practice, test, quiz]
 *                 default: practice
 *               results:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                       required: true
 *                     answerGiven:
 *                       type: number
 *                       required: true
 *                     isCorrect:
 *                       type: boolean
 *                       required: true
 *                     timeTaken:
 *                       type: number
 *                       description: Time in seconds
 *     responses:
 *       201:
 *         description: Results saved successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/submit-test', userProgressController.submitTestResults);

/**
 * @swagger
 * /api/user-progress/stats/{userId}:
 *   get:
 *     summary: Get user's overall statistics
 *     tags: [UserProgress]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: User ID (defaults to anonymous)
 *     responses:
 *       200:
 *         description: User statistics
 *       500:
 *         description: Server error
 */
router.get('/stats/:userId?', userProgressController.getUserStats);

/**
 * @swagger
 * /api/user-progress/test-history/{testId}:
 *   get:
 *     summary: Get user's attempt history for a specific test
 *     tags: [UserProgress]
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *         description: Test ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID (defaults to anonymous)
 *     responses:
 *       200:
 *         description: Test attempt history
 *       500:
 *         description: Server error
 */
router.get('/test-history/:testId', userProgressController.getTestHistory);

/**
 * @swagger
 * /api/user-progress/weak-areas/{userId}:
 *   get:
 *     summary: Get questions user frequently gets wrong
 *     tags: [UserProgress]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of weak questions to return
 *     responses:
 *       200:
 *         description: List of weak areas
 *       500:
 *         description: Server error
 */
router.get('/weak-areas/:userId?', userProgressController.getWeakAreas);

/**
 * @swagger
 * /api/user-progress/{userId}:
 *   delete:
 *     summary: Clear user's progress (for testing/reset)
 *     tags: [UserProgress]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Progress cleared
 *       500:
 *         description: Server error
 */
router.delete('/:userId?', userProgressController.clearUserProgress);

module.exports = router;
