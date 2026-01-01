const { InterviewQuestion } = require('../models');

/**
 * Interview Question Controller
 * Handles CRUD operations for interview questions
 */

class InterviewQuestionController {
    
    /**
     * Get all interview questions for a specific video
     * GET /api/interview-questions/video/:videoId
     */
    async getQuestionsByVideoId(req, res) {
        try {
            const { videoId } = req.params;
            
            const questions = await InterviewQuestion
                .find({ videoId })
                .sort({ orderIndex: 1 })
                .lean();
            
            res.json({
                success: true,
                count: questions.length,
                data: questions
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
     * Create new interview question
     * POST /api/interview-questions
     */
    async createQuestion(req, res) {
        try {
            const questionData = req.body;
            
            // Get the highest orderIndex for this video
            const lastQuestion = await InterviewQuestion
                .findOne({ videoId: questionData.videoId })
                .sort({ orderIndex: -1 });
            
            questionData.orderIndex = lastQuestion ? lastQuestion.orderIndex + 1 : 0;
            
            const question = new InterviewQuestion(questionData);
            await question.save();
            
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
     * Update interview question
     * PUT /api/interview-questions/:id
     */
    async updateQuestion(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            const question = await InterviewQuestion.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!question) {
                return res.status(404).json({
                    success: false,
                    error: 'Question not found'
                });
            }
            
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
     * Delete interview question
     * DELETE /api/interview-questions/:id
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
     * Bulk upsert questions for a video
     * POST /api/interview-questions/bulk
     */
    async bulkUpsertQuestions(req, res) {
        try {
            const { videoId, questions } = req.body;
            
            if (!videoId || !Array.isArray(questions)) {
                return res.status(400).json({
                    success: false,
                    error: 'videoId and questions array are required'
                });
            }
            
            // Delete existing questions for this video
            await InterviewQuestion.deleteMany({ videoId });
            
            // Create new questions with proper orderIndex
            const questionsToInsert = questions.map((q, index) => ({
                videoId,
                question: q.question,
                answer: q.answer || '',
                difficulty: q.difficulty || '',
                orderIndex: index
            }));
            
            const insertedQuestions = await InterviewQuestion.insertMany(questionsToInsert);
            
            res.json({
                success: true,
                message: `${insertedQuestions.length} questions saved successfully`,
                count: insertedQuestions.length,
                data: insertedQuestions
            });
        } catch (error) {
            console.error('❌ Error in bulk upsert:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new InterviewQuestionController();
