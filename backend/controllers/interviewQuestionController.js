const mongoose = require('mongoose');
const { InterviewQuestion, YouTubeVideo } = require('../models');

/**
 * Interview Questions Controller (New Optimized Version)
 * Manages questions separately from videos
 * Fast queries and unlimited scalability
 */

class InterviewQuestionController {
    
    /**
     * Get all questions for a specific video
     * GET /api/videos/:videoId/questions
     */
    async getQuestionsByVideo(req, res) {
        try {
            const { videoId } = req.params;

            // Verify video exists
            const video = await YouTubeVideo.findOne({ videoId });
            if (!video) {
                return res.status(404).json({
                    success: false,
                    error: 'Video not found'
                });
            }

            const questions = await InterviewQuestion.find({ videoId })
                .sort({ orderIndex: 1 })
                .lean();

            res.json({
                success: true,
                data: questions,
                count: questions.length,
                videoTitle: video.title
            });
        } catch (error) {
            console.error('❌ Error fetching questions:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get single question by ID
     * GET /api/questions/:id
     */
    async getQuestionById(req, res) {
        try {
            const { id } = req.params;

            const question = await InterviewQuestion.findById(id).lean();

            if (!question) {
                return res.status(404).json({
                    success: false,
                    error: 'Question not found'
                });
            }

            res.json({
                success: true,
                data: question
            });
        } catch (error) {
            console.error('❌ Error fetching question:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Create new question for a video
     * POST /api/videos/:videoId/questions
     */
    async createQuestion(req, res) {
        try {
            const { videoId } = req.params;
            const questionData = req.body;

            // Verify video exists
            const video = await YouTubeVideo.findOne({ videoId });
            if (!video) {
                return res.status(404).json({
                    success: false,
                    error: 'Video not found'
                });
            }

            // Get next order index
            const lastQuestion = await InterviewQuestion.findOne({ videoId })
                .sort({ orderIndex: -1 });
            
            const nextIndex = lastQuestion ? lastQuestion.orderIndex + 1 : 0;

            const question = await InterviewQuestion.create({
                videoId,
                ...questionData,
                orderIndex: questionData.orderIndex !== undefined ? questionData.orderIndex : nextIndex
            });

            console.log(`✅ Question created for video: ${video.title}`);

            res.status(201).json({
                success: true,
                message: 'Question created successfully',
                data: question
            });
        } catch (error) {
            console.error('❌ Error creating question:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Update question
     * PUT /api/questions/:id
     */
    async updateQuestion(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const question = await InterviewQuestion.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!question) {
                return res.status(404).json({
                    success: false,
                    error: 'Question not found'
                });
            }

            console.log(`✅ Question updated: ${question.question.substring(0, 50)}...`);

            res.json({
                success: true,
                message: 'Question updated successfully',
                data: question
            });
        } catch (error) {
            console.error('❌ Error updating question:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Delete question
     * DELETE /api/questions/:id
     */
    async deleteQuestion(req, res) {
        try {
            const { id } = req.params;

            const question = await InterviewQuestion.findByIdAndDelete(id);

            if (!question) {
                return res.status(404).json({
                    success: false,
                    error: 'Question not found'
                });
            }

            console.log(`🗑️ Question deleted`);

            res.json({
                success: true,
                message: 'Question deleted successfully'
            });
        } catch (error) {
            console.error('❌ Error deleting question:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Bulk create questions for a video
     * POST /api/videos/:videoId/questions/bulk
     */
    async bulkCreateQuestions(req, res) {
        try {
            const { videoId } = req.params;
            const { questions } = req.body;

            if (!Array.isArray(questions)) {
                return res.status(400).json({
                    success: false,
                    error: 'Questions must be an array'
                });
            }

            // Verify video exists
            const video = await YouTubeVideo.findOne({ videoId });
            if (!video) {
                return res.status(404).json({
                    success: false,
                    error: 'Video not found'
                });
            }

            // Add videoId and orderIndex to each question
            const questionsToCreate = questions.map((q, index) => ({
                videoId,
                question: q.question,
                answer: q.answer,
                difficulty: q.difficulty || 'medium',
                orderIndex: q.orderIndex !== undefined ? q.orderIndex : index
            }));

            const created = await InterviewQuestion.insertMany(questionsToCreate);

            console.log(`✅ ${created.length} questions created for video: ${video.title}`);

            res.status(201).json({
                success: true,
                message: `${created.length} questions created successfully`,
                data: created
            });
        } catch (error) {
            console.error('❌ Error bulk creating questions:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Reorder questions for a video
     * PUT /api/videos/:videoId/questions/reorder
     */
    async reorderQuestions(req, res) {
        try {
            const { videoId } = req.params;
            const { questionIds } = req.body; // Array of question IDs in new order

            if (!Array.isArray(questionIds)) {
                return res.status(400).json({
                    success: false,
                    error: 'questionIds must be an array'
                });
            }

            const updates = questionIds.map((id, index) => ({
                updateOne: {
                    filter: { _id: id, videoId },
                    update: { $set: { orderIndex: index } }
                }
            }));

            const result = await InterviewQuestion.bulkWrite(updates);

            res.json({
                success: true,
                message: 'Questions reordered successfully',
                modified: result.modifiedCount
            });
        } catch (error) {
            console.error('❌ Error reordering questions:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Search questions across all videos
     * GET /api/questions/search?q=angular&difficulty=medium
     */
    async searchQuestions(req, res) {
        try {
            const { q = '', difficulty, page = 1, limit = 20 } = req.query;

            const query = {};

            // Text search
            if (q) {
                query.$text = { $search: q };
            }

            // Filter by difficulty
            if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
                query.difficulty = difficulty;
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const questions = await InterviewQuestion.find(query)
                .sort({ score: { $meta: 'textScore' } })
                .limit(parseInt(limit))
                .skip(skip)
                .lean();

            const total = await InterviewQuestion.countDocuments(query);

            res.json({
                success: true,
                data: questions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            });
        } catch (error) {
            console.error('❌ Error searching questions:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get questions by difficulty
     * GET /api/questions/difficulty/:level
     */
    async getQuestionsByDifficulty(req, res) {
        try {
            const { level } = req.params;

            if (!['easy', 'medium', 'hard'].includes(level)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid difficulty level. Use: easy, medium, or hard'
                });
            }

            const questions = await InterviewQuestion.find({ difficulty: level })
                .sort({ createdAt: -1 })
                .lean();

            res.json({
                success: true,
                data: questions,
                count: questions.length
            });
        } catch (error) {
            console.error('❌ Error fetching questions by difficulty:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Delete all questions for a video
     * DELETE /api/videos/:videoId/questions
     */
    async deleteAllQuestionsForVideo(req, res) {
        try {
            const { videoId } = req.params;

            const result = await InterviewQuestion.deleteMany({ videoId });

            console.log(`🗑️ Deleted ${result.deletedCount} questions for video: ${videoId}`);

            res.json({
                success: true,
                message: `${result.deletedCount} questions deleted successfully`
            });
        } catch (error) {
            console.error('❌ Error deleting questions:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new InterviewQuestionController();
