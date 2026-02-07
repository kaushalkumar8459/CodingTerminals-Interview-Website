// File: backend/controllers/userProgressController.js
const UserProgress = require('../models/UserProgress');
const Question = require('../models/Question');
const Test = require('../models/Test');

class UserProgressController {

    /**
     * Save test results - batch save all question attempts from a test session
     * POST /api/user-progress/submit-test
     */
    async submitTestResults(req, res) {
        try {
            const {
                testId,
                userId,
                sessionType = 'practice',
                results // Array of { questionId, answerGiven, isCorrect, timeTaken }
            } = req.body;

            if (!results || !Array.isArray(results) || results.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Results array is required'
                });
            }

            // Generate a default userId if not provided (anonymous user)
            const finalUserId = userId || '000000000000000000000000';

            // Prepare bulk insert data
            const progressRecords = results.map(result => ({
                userId: finalUserId,
                questionId: result.questionId,
                answerGiven: result.answerGiven,
                isCorrect: result.isCorrect,
                timeTaken: result.timeTaken || 0,
                sessionType: sessionType,
                testId: testId || null,
                attemptDate: new Date()
            }));

            // Insert all records
            const savedRecords = await UserProgress.insertMany(progressRecords);

            // Calculate summary stats
            const totalQuestions = results.length;
            const correctAnswers = results.filter(r => r.isCorrect).length;
            const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

            res.status(201).json({
                success: true,
                message: 'Test results saved successfully',
                data: {
                    recordsSaved: savedRecords.length,
                    summary: {
                        totalQuestions,
                        correctAnswers,
                        accuracy
                    }
                }
            });
        } catch (error) {
            console.error('❌ Error saving test results:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get user's progress statistics
     * GET /api/user-progress/stats/:userId
     */
    async getUserStats(req, res) {
        try {
            const { userId } = req.params;
            const finalUserId = userId || '000000000000000000000000';

            // Aggregate stats
            const stats = await UserProgress.aggregate([
                { $match: { userId: finalUserId } },
                {
                    $group: {
                        _id: null,
                        totalAttempts: { $sum: 1 },
                        correctAnswers: { $sum: { $cond: ['$isCorrect', 1, 0] } },
                        totalTimeTaken: { $sum: '$timeTaken' },
                        uniqueQuestions: { $addToSet: '$questionId' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalAttempts: 1,
                        correctAnswers: 1,
                        totalTimeTaken: 1,
                        uniqueQuestionsCount: { $size: '$uniqueQuestions' },
                        accuracy: {
                            $cond: [
                                { $gt: ['$totalAttempts', 0] },
                                { $multiply: [{ $divide: ['$correctAnswers', '$totalAttempts'] }, 100] },
                                0
                            ]
                        }
                    }
                }
            ]);

            // Get subject-wise breakdown
            const subjectStats = await UserProgress.aggregate([
                { $match: { userId: finalUserId } },
                {
                    $lookup: {
                        from: 'codingTerminalsQuestions',
                        localField: 'questionId',
                        foreignField: '_id',
                        as: 'question'
                    }
                },
                { $unwind: '$question' },
                {
                    $group: {
                        _id: '$question.subject',
                        attempts: { $sum: 1 },
                        correct: { $sum: { $cond: ['$isCorrect', 1, 0] } }
                    }
                },
                {
                    $project: {
                        subject: '$_id',
                        _id: 0,
                        attempts: 1,
                        correct: 1,
                        accuracy: {
                            $cond: [
                                { $gt: ['$attempts', 0] },
                                { $round: [{ $multiply: [{ $divide: ['$correct', '$attempts'] }, 100] }, 1] },
                                0
                            ]
                        }
                    }
                },
                { $sort: { attempts: -1 } }
            ]);

            // Get recent activity
            const recentActivity = await UserProgress.find({ userId: finalUserId })
                .sort({ attemptDate: -1 })
                .limit(10)
                .populate('questionId', 'question subject difficulty')
                .lean();

            res.json({
                success: true,
                data: {
                    overall: stats[0] || {
                        totalAttempts: 0,
                        correctAnswers: 0,
                        totalTimeTaken: 0,
                        uniqueQuestionsCount: 0,
                        accuracy: 0
                    },
                    bySubject: subjectStats,
                    recentActivity
                }
            });
        } catch (error) {
            console.error('❌ Error fetching user stats:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get user's history for a specific test
     * GET /api/user-progress/test-history/:testId
     */
    async getTestHistory(req, res) {
        try {
            const { testId } = req.params;
            const { userId } = req.query;
            const finalUserId = userId || '000000000000000000000000';

            const history = await UserProgress.find({
                userId: finalUserId,
                testId: testId
            })
                .sort({ attemptDate: -1 })
                .populate('questionId', 'question subject difficulty correctAnswer')
                .lean();

            // Group by attempt session (by attemptDate rounded to minute)
            const sessions = {};
            history.forEach(record => {
                const sessionKey = new Date(record.attemptDate).toISOString().slice(0, 16);
                if (!sessions[sessionKey]) {
                    sessions[sessionKey] = {
                        attemptDate: record.attemptDate,
                        questions: [],
                        correct: 0,
                        total: 0
                    };
                }
                sessions[sessionKey].questions.push(record);
                sessions[sessionKey].total++;
                if (record.isCorrect) sessions[sessionKey].correct++;
            });

            const sessionList = Object.values(sessions).map(session => ({
                ...session,
                accuracy: session.total > 0 ? Math.round((session.correct / session.total) * 100) : 0
            }));

            res.json({
                success: true,
                data: {
                    testId,
                    totalAttempts: sessionList.length,
                    sessions: sessionList
                }
            });
        } catch (error) {
            console.error('❌ Error fetching test history:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get questions the user got wrong (for review)
     * GET /api/user-progress/weak-areas/:userId
     */
    async getWeakAreas(req, res) {
        try {
            const { userId } = req.params;
            const { limit = 20 } = req.query;
            const finalUserId = userId || '000000000000000000000000';

            // Find questions where user has more wrong answers than correct
            const weakQuestions = await UserProgress.aggregate([
                { $match: { userId: finalUserId } },
                {
                    $group: {
                        _id: '$questionId',
                        totalAttempts: { $sum: 1 },
                        wrongAttempts: { $sum: { $cond: ['$isCorrect', 0, 1] } },
                        lastAttempt: { $max: '$attemptDate' }
                    }
                },
                {
                    $match: {
                        wrongAttempts: { $gt: 0 }
                    }
                },
                {
                    $project: {
                        questionId: '$_id',
                        _id: 0,
                        totalAttempts: 1,
                        wrongAttempts: 1,
                        lastAttempt: 1,
                        wrongRatio: { $divide: ['$wrongAttempts', '$totalAttempts'] }
                    }
                },
                { $sort: { wrongRatio: -1, wrongAttempts: -1 } },
                { $limit: parseInt(limit) }
            ]);

            // Populate question details
            const questionIds = weakQuestions.map(w => w.questionId);
            const questions = await Question.find({ _id: { $in: questionIds } })
                .select('question subject difficulty topic options correctAnswer')
                .lean();

            const questionMap = {};
            questions.forEach(q => {
                questionMap[q._id.toString()] = q;
            });

            const result = weakQuestions.map(w => ({
                ...w,
                question: questionMap[w.questionId.toString()] || null
            }));

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('❌ Error fetching weak areas:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Clear user's progress (for testing/reset)
     * DELETE /api/user-progress/:userId
     */
    async clearUserProgress(req, res) {
        try {
            const { userId } = req.params;
            const finalUserId = userId || '000000000000000000000000';

            const result = await UserProgress.deleteMany({ userId: finalUserId });

            res.json({
                success: true,
                message: `Deleted ${result.deletedCount} progress records`,
                data: { deletedCount: result.deletedCount }
            });
        } catch (error) {
            console.error('❌ Error clearing user progress:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new UserProgressController();
