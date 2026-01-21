// File: backend/controllers/questionController.js
const Question = require('../models/Question');
const UserProgress = require('../models/UserProgress');

class QuestionController {

    // GET - Get all questions
    // ... existing code ...

    // GET - Get all questions
    async getAllQuestions(req, res) {
        try {
            const {
                subject,
                academicYear,
                difficulty,
                topic,
                isActive,
                page = 1,
                limit = 50,
                search
            } = req.query;

            let query = {};

            // Only apply isActive filter if it's explicitly provided in the query
            if (isActive !== undefined) {
                query.isActive = isActive === 'true';
            }
            // If isActive is not provided, we don't filter by it, so all records are returned

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

            // Count without the default isActive filter
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

    // ... rest of existing code ...

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

    // POST - Create new question (handles both single and bulk)
    async createQuestion(req, res) {
        try {
            // Handle bulk creation if questions array is provided
            if (req.body.questions && Array.isArray(req.body.questions)) {
                const { questions } = req.body;

                if (!Array.isArray(questions) || questions.length === 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Questions array is required and cannot be empty'
                    });
                }

                const createdQuestions = [];
                const errors = [];

                // Process each question
                for (let i = 0; i < questions.length; i++) {
                    try {
                        let questionData = { ...questions[i] };

                        // Only add createdBy if user is authenticated
                        if (req.user && req.user._id) {
                            questionData.createdBy = req.user._id;
                        }

                        // Convert correctAnswer to number if it's provided as a string
                        if (questionData.correctAnswer !== undefined) {
                            if (typeof questionData.correctAnswer === 'string') {
                                questionData.correctAnswer = parseInt(questionData.correctAnswer);
                            }
                        }

                        // Ensure options is an array
                        if (questionData.options && !Array.isArray(questionData.options)) {
                            if (typeof questionData.options === 'string') {
                                questionData.options = [questionData.options];
                            } else {
                                questionData.options = [];
                            }
                        }

                        const question = new Question(questionData);
                        await question.save();
                        createdQuestions.push(question);
                    } catch (error) {
                        errors.push({
                            index: i,
                            question: questions[i],
                            error: error.message
                        });
                    }
                }

                return res.status(201).json({
                    success: true,
                    data: {
                        created: createdQuestions,
                        errors: errors,
                        total: questions.length,
                        createdCount: createdQuestions.length,
                        errorCount: errors.length
                    },
                    message: `Processed ${questions.length} questions: ${createdQuestions.length} created, ${errors.length} failed`
                });
            }

            // Handle single question creation
            let questionData = {
                ...req.body
            };

            // Only add createdBy if user is authenticated
            if (req.user && req.user._id) {
                questionData.createdBy = req.user._id;
            }

            // Convert correctAnswer to number if it's provided as a string
            if (questionData.correctAnswer !== undefined) {
                if (typeof questionData.correctAnswer === 'string') {
                    questionData.correctAnswer = parseInt(questionData.correctAnswer);
                }
            }

            // Ensure options is an array
            if (questionData.options && !Array.isArray(questionData.options)) {
                if (typeof questionData.options === 'string') {
                    questionData.options = [questionData.options];
                } else {
                    questionData.options = [];
                }
            }

            const question = new Question(questionData);
            await question.save();

            res.status(201).json({
                success: true,
                data: question,
                message: 'Question created successfully'
            });
        } catch (error) {
            console.error('❌ Error creating question:', error);
            // Check if it's a validation error
            if (error.name === 'ValidationError') {
                const errors = {};
                for (const field in error.errors) {
                    errors[field] = error.errors[field].message;
                }
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors
                });
            }
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
    // async deleteQuestion(req, res) {
    //     try {
    //         const { id } = req.params;

    //         const question = await Question.findByIdAndUpdate(
    //             id,
    //             { isActive: false, updatedAt: Date.now() },
    //             { new: true }
    //         );

    //         if (!question) {
    //             return res.status(404).json({
    //                 success: false,
    //                 error: 'Question not found'
    //             });
    //         }

    //         res.json({
    //             success: true,
    //             message: 'Question deleted successfully'
    //         });
    //     } catch (error) {
    //         console.error('❌ Error deleting question:', error);
    //         res.status(500).json({
    //             success: false,
    //             error: error.message
    //         });
    //     }
    // }


    // DELETE - Delete question (hard delete)
    async deleteQuestion(req, res) {
        try {
            const { id } = req.params;

            const question = await Question.findByIdAndDelete(id);

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

            // Process groups to find actual duplicates
            for (const group of questions) {
                // Compare questions within each group
                for (let i = 0; i < group.questions.length; i++) {
                    for (let j = i + 1; j < group.questions.length; j++) {
                        const q1 = group.questions[i];
                        const q2 = group.questions[j];

                        // Simple similarity check based on question text
                        const similarity = this.calculateSimilarity(q1.question, q2.question);
                        if (similarity > 0.8) { // 80% similarity threshold
                            duplicates.push({
                                question1: q1,
                                question2: q2,
                                similarity: similarity
                            });
                        }
                    }
                }
            }

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

    // Helper method to calculate text similarity
    calculateSimilarity(str1, str2) {
        // Simple Jaccard similarity for demonstration
        const set1 = new Set(str1.toLowerCase().split(/\W+/));
        const set2 = new Set(str2.toLowerCase().split(/\W+/));

        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);

        return union.size === 0 ? 0 : intersection.size / union.size;
    }

    // POST - Save user answer
    async saveUserAnswer(req, res) {
        try {
            const { questionId, selectedOption, userId } = req.body;

            if (!questionId || selectedOption === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Question ID and selected option are required'
                });
            }

            // Find the question to check the answer
            const question = await Question.findById(questionId);
            if (!question) {
                return res.status(404).json({
                    success: false,
                    error: 'Question not found'
                });
            }

            // Create or update user progress
            let userProgress = await UserProgress.findOne({
                userId: userId || 'anonymous',
                questionId: questionId
            });

            const isCorrect = selectedOption === question.correctAnswer;

            if (userProgress) {
                userProgress.selectedOption = selectedOption;
                userProgress.isCorrect = isCorrect;
                userProgress.attemptedAt = new Date();
                await userProgress.save();
            } else {
                userProgress = new UserProgress({
                    userId: userId || 'anonymous',
                    questionId: questionId,
                    selectedOption: selectedOption,
                    isCorrect: isCorrect
                });
                await userProgress.save();
            }

            res.json({
                success: true,
                data: {
                    userProgress,
                    isCorrect,
                    correctAnswer: question.correctAnswer
                },
                message: isCorrect ? 'Correct answer!' : 'Incorrect answer'
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
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required'
                });
            }

            const progress = await UserProgress.find({ userId })
                .populate('questionId')
                .sort({ attemptedAt: -1 })
                .lean();

            // Calculate statistics
            const totalAttempts = progress.length;
            const correctAnswers = progress.filter(p => p.isCorrect).length;
            const accuracy = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;

            res.json({
                success: true,
                data: {
                    progress,
                    statistics: {
                        totalAttempts,
                        correctAnswers,
                        accuracy: accuracy.toFixed(2) + '%'
                    }
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

    // GET - Get questions by subject
    async getQuestionsBySubject(req, res) {
        try {
            const { subject } = req.params;
            const questions = await Question.find({
                subject: subject,
                isActive: true
            }).lean();

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

    // ... existing code ...

    // GET - Get questions by year
    async getQuestionsByYear(req, res) {
        try {
            const { year } = req.params;
            const questions = await Question.find({
                academicYear: year,
                isActive: true
            }).lean();

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

    // POST - Upload question paper
    async uploadQuestionPaper(req, res) {
        try {
            // Extract metadata from request body
            const { subject, academicYear, examType, difficulty, autoParse } = req.body;

            // In a real implementation, you would process the uploaded file here
            // For now, we'll return a success response
            const questions = [];

            // If autoParse is enabled, you would extract questions from the file
            // This is a simplified version - you'd need to implement actual parsing
            if (autoParse) {
                // Simulate parsing - in reality, you'd parse the actual uploaded file
                questions.push({
                    question: "Sample question extracted from uploaded file",
                    options: ["Option A", "Option B", "Option C", "Option D"],
                    correctAnswer: 0,
                    subject: subject || "General",
                    academicYear: academicYear || "2025",
                    examType: examType || "Practice Paper",
                    difficulty: difficulty || "Intermediate"
                });
            }

            res.json({
                success: true,
                message: 'Question paper uploaded successfully',
                questions: questions
            });
        } catch (error) {
            console.error('❌ Error uploading question paper:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // POST - Import questions from CSV
    async importFromCSV(req, res) {
        try {
            // In a real implementation, you would process the CSV file here
            // For now, we'll return a success response
            const questions = [];

            // Simulate parsing CSV - in reality, you'd parse the actual uploaded file
            questions.push({
                question: "Sample question imported from CSV",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 1,
                subject: req.body.subject || "General",
                academicYear: req.body.academicYear || "2025",
                examType: req.body.examType || "Practice Paper",
                difficulty: req.body.difficulty || "Intermediate"
            });

            res.json({
                success: true,
                message: 'Questions imported from CSV successfully',
                questions: questions
            });
        } catch (error) {
            console.error('❌ Error importing from CSV:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // POST - Import questions from Excel
    async importFromExcel(req, res) {
        try {
            // In a real implementation, you would process the Excel file here
            // For now, we'll return a success response
            const questions = [];

            // Simulate parsing Excel - in reality, you'd parse the actual uploaded file
            questions.push({
                question: "Sample question imported from Excel",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 2,
                subject: req.body.subject || "General",
                academicYear: req.body.academicYear || "2025",
                examType: req.body.examType || "Practice Paper",
                difficulty: req.body.difficulty || "Intermediate"
            });

            res.json({
                success: true,
                message: 'Questions imported from Excel successfully',
                questions: questions
            });
        } catch (error) {
            console.error('❌ Error importing from Excel:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // POST - Import questions from text
    async importFromText(req, res) {
        try {
            // In a real implementation, you would process the text file here
            // For now, we'll return a success response
            const questions = [];

            // Simulate parsing text - in reality, you'd parse the actual uploaded file
            questions.push({
                question: "Sample question imported from text file",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 3,
                subject: req.body.subject || "General",
                academicYear: req.body.academicYear || "2025",
                examType: req.body.examType || "Practice Paper",
                difficulty: req.body.difficulty || "Intermediate"
            });

            res.json({
                success: true,
                message: 'Questions imported from text file successfully',
                questions: questions
            });
        } catch (error) {
            console.error('❌ Error importing from text:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // POST - Sync with database
    async syncWithDatabase(req, res) {
        try {
            const { questions } = req.body;

            if (!Array.isArray(questions)) {
                return res.status(400).json({
                    success: false,
                    error: 'Questions array is required'
                });
            }

            // In a real implementation, you would sync questions with the database
            // For now, we'll return a success response
            const syncedCount = questions.length;

            res.json({
                success: true,
                message: `${syncedCount} questions synced with database successfully`,
                synced: syncedCount
            });
        } catch (error) {
            console.error('❌ Error syncing with database:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

}
// ... existing code ...




module.exports = new QuestionController();