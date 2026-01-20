// File: backend/controllers/questionController.js
const Question = require('../models/Question');
const UserProgress = require('../models/UserProgress');

class QuestionController {
    
    // GET - Get all questions
    async getAllQuestions(req, res) {
        try {
            const { 
                subject, 
                academicYear, 
                difficulty, 
                topic, 
                isActive = true,
                page = 1, 
                limit = 50,
                search 
            } = req.query;

            let query = { isActive: isActive === 'true' };

            // Apply filters
            if (subject && subject !== 'all') {
                query.subject = subject;
            }
            
            if (academicYear && academicYear !== 'all') {
                query.academicYear = academicYear;
            }
            
            if (difficulty && difficulty !== 'all') {
                query.difficulty = difficulty;
            }
            
            if (topic && topic !== 'all') {
                query.topic = topic;
            }
            
            // Apply search
            if (search) {
                query.$text = { $search: search };
            }

            const skip = (page - 1) * limit;
            
            const questions = await Question.find(query)
                .populate('createdBy', 'username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            const total = await Question.countDocuments(query);

            res.json({
                success: true,
                data: questions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('❌ Error fetching questions:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET - Get question by ID
    async getQuestionById(req, res) {
        try {
            const { id } = req.params;
            
            const question = await Question.findById(id)
                .populate('createdBy', 'username email')
                .lean();

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

    // POST - Create new question
    async createQuestion(req, res) {
        try {
            const questionData = {
                ...req.body,
                createdBy: req.user._id // Assuming authentication middleware sets req.user
            };

            const question = new Question(questionData);
            await question.save();

            res.status(201).json({
                success: true,
                data: question,
                message: 'Question created successfully'
            });
        } catch (error) {
            console.error('❌ Error creating question:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // PUT - Update question
    async updateQuestion(req, res) {
        try {
            const { id } = req.params;
            
            const question = await Question.findByIdAndUpdate(
                id,
                { ...req.body, updatedAt: Date.now() },
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
                data: question,
                message: 'Question updated successfully'
            });
        } catch (error) {
            console.error('❌ Error updating question:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // DELETE - Delete question
    async deleteQuestion(req, res) {
        try {
            const { id } = req.params;
            
            const question = await Question.findByIdAndUpdate(
                id,
                { isActive: false, updatedAt: Date.now() },
                { new: true }
            );

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

    // POST - Bulk delete questions
    async bulkDeleteQuestions(req, res) {
        try {
            const { questionIds } = req.body;
            
            if (!Array.isArray(questionIds) || questionIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Question IDs array is required'
                });
            }

            const result = await Question.updateMany(
                { _id: { $in: questionIds } },
                { isActive: false, updatedAt: Date.now() }
            );

            res.json({
                success: true,
                deleted: result.modifiedCount,
                message: `${result.modifiedCount} questions deleted successfully`
            });
        } catch (error) {
            console.error('❌ Error bulk deleting questions:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET - Find duplicate questions
    async findDuplicates(req, res) {
        try {
            // Find questions with similar content using text search
            const questions = await Question.aggregate([
                {
                    $match: {
                        isActive: true
                    }
                },
                {
                    $group: {
                        _id: {
                            subject: "$subject",
                            academicYear: "$academicYear",
                            difficulty: "$difficulty"
                        },
                        questions: { $push: "$$ROOT" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        count: { $gt: 1 }
                    }
                }
            ]);

            const duplicates = [];
            questions.forEach(group => {
                if (group.questions.length > 1) {
                    // Compare questions in the same group
                    for (let i = 0; i < group.questions.length - 1; i++) {
                        for (let j = i + 1; j < group.questions.length; j++) {
                            const q1 = group.questions[i];
                            const q2 = group.questions[j];
                            
                            // Simple similarity check - in real implementation, use more sophisticated comparison
                            if (q1.question.toLowerCase().includes(q2.question.toLowerCase().substring(0, 20))) {
                                duplicates.push({
                                    question1: q1._id,
                                    question2: q2._id,
                                    similarity: 'high'
                                });
                            }
                        }
                    }
                }
            });

            res.json({
                success: true,
                data: duplicates,
                count: duplicates.length
            });
        } catch (error) {
            console.error('❌ Error finding duplicates:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET - Get questions by subject
    async getQuestionsBySubject(req, res) {
        try {
            const { subject } = req.params;
            
            const questions = await Question.find({
                subject: subject,
                isActive: true
            })
            .populate('createdBy', 'username email')
            .sort({ createdAt: -1 })
            .lean();

            res.json({
                success: true,
                data: questions,
                count: questions.length
            });
        } catch (error) {
            console.error('❌ Error fetching questions by subject:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET - Get questions by year
    async getQuestionsByYear(req, res) {
        try {
            const { year } = req.params;
            
            const questions = await Question.find({
                academicYear: year,
                isActive: true
            })
            .populate('createdBy', 'username email')
            .sort({ createdAt: -1 })
            .lean();

            res.json({
                success: true,
                data: questions,
                count: questions.length
            });
        } catch (error) {
            console.error('❌ Error fetching questions by year:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // POST - Save user answer
    async saveUserAnswer(req, res) {
        try {
            const { questionId, answerIndex, sessionType = 'practice', testId } = req.body;
            
            const question = await Question.findById(questionId);
            if (!question) {
                return res.status(404).json({
                    success: false,
                    error: 'Question not found'
                });
            }

            const isCorrect = answerIndex === question.correctAnswer;

            const userProgress = new UserProgress({
                userId: req.user._id,
                questionId: questionId,
                answerGiven: answerIndex,
                isCorrect: isCorrect,
                sessionType: sessionType,
                testId: testId
            });

            await userProgress.save();

            res.json({
                success: true,
                data: userProgress,
                isCorrect: isCorrect,
                message: 'Answer saved successfully'
            });
        } catch (error) {
            console.error('❌ Error saving user answer:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET - Get user progress
    async getUserProgress(req, res) {
        try {
            const userId = req.user._id;
            
            const progress = await UserProgress.aggregate([
                {
                    $match: { userId: userId }
                },
                {
                    $group: {
                        _id: null,
                        questionsAttempted: { $sum: 1 },
                        questionsCorrect: { $sum: { $cond: [{ $eq: ["$isCorrect", true] }, 1, 0] } },
                        totalTimeSpent: { $sum: "$timeTaken" }
                    }
                }
            ]);

            // Get weak areas
            const incorrectAnswers = await UserProgress.aggregate([
                {
                    $match: {
                        userId: userId,
                        isCorrect: false
                    }
                },
                {
                    $lookup: {
                        from: 'codingterminalsquestions',
                        localField: 'questionId',
                        foreignField: '_id',
                        as: 'question'
                    }
                },
                {
                    $unwind: '$question'
                },
                {
                    $group: {
                        _id: '$question.subject',
                        count: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        count: { $gte: 3 } // Subjects with 3 or more incorrect answers
                    }
                }
            ]);

            const weakAreas = incorrectAnswers.map(item => item._id);

            const result = progress[0] || {
                questionsAttempted: 0,
                questionsCorrect: 0,
                totalTimeSpent: 0
            };

            res.json({
                success: true,
                data: {
                    questionsAttempted: result.questionsAttempted,
                    questionsCorrect: result.questionsCorrect,
                    totalTimeSpent: result.totalTimeSpent,
                    weakAreas: weakAreas
                }
            });
        } catch (error) {
            console.error('❌ Error fetching user progress:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new QuestionController();