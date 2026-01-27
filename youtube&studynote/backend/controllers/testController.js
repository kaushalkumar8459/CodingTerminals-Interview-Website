// File: backend/controllers/testController.js
const Test = require('../models/Test');
const Question = require('../models/Question');

class TestController {
    
    // GET - Get all tests
    async getAllTests(req, res) {
        try {
            const { 
                subject, 
                academicYear, 
                isActive = true,
                isPublished = true,
                page = 1, 
                limit = 20
            } = req.query;

            let query = { 
                isActive: isActive === 'true',
                isPublished: isPublished === 'true'
            };

            // Apply filters
            if (subject && subject !== 'all') {
                query.subject = subject;
            }
            
            if (academicYear && academicYear !== 'all') {
                query.academicYear = academicYear;
            }

            const skip = (page - 1) * limit;
            
            const tests = await Test.find(query)
                .populate('questions', 'question subject difficulty')
                .populate('createdBy', 'username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            const total = await Test.countDocuments(query);

            res.json({
                success: true,
                data: tests,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('❌ Error fetching tests:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // POST - Create new test
    async createTest(req, res) {
        try {
            const testData = {
                ...req.body,
                createdBy: req.user._id
            };

            const test = new Test(testData);
            await test.save();

            // Populate references
            await test.populate('questions', 'question subject difficulty');
            await test.populate('createdBy', 'username email');

            res.status(201).json({
                success: true,
                data: test,
                message: 'Test created successfully'
            });
        } catch (error) {
            console.error('❌ Error creating test:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // POST - Generate automatic test
    async generateTest(req, res) {
        try {
            const { 
                subject, 
                academicYear, 
                totalQuestions = 20,
                difficultyDistribution = {},
                topics = [],
                duration = 60
            } = req.body;

            // Validate inputs
            if (!subject || !academicYear) {
                return res.status(400).json({
                    success: false,
                    error: 'Subject and academic year are required'
                });
            }

            // Build query for questions
            let questionQuery = {
                subject: subject,
                academicYear: academicYear,
                isActive: true
            };

            if (topics && topics.length > 0 && !topics.includes('all')) {
                questionQuery.topic = { $in: topics };
            }

            // Get all matching questions
            let availableQuestions = await Question.find(questionQuery);

            // If not enough questions, relax topic constraint
            if (availableQuestions.length < totalQuestions) {
                delete questionQuery.topic;
                availableQuestions = await Question.find(questionQuery);
            }

            if (availableQuestions.length < totalQuestions) {
                return res.status(400).json({
                    success: false,
                    error: `Not enough questions available. Found ${availableQuestions.length}, need ${totalQuestions}`
                });
            }

            // Distribute questions by difficulty
            const questions = [];
            const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
            
            for (const difficulty of difficulties) {
                const count = difficultyDistribution[difficulty.toLowerCase()] || 0;
                if (count > 0) {
                    const difficultyQuestions = availableQuestions
                        .filter(q => q.difficulty === difficulty)
                        .sort(() => 0.5 - Math.random())
                        .slice(0, count);
                    
                    questions.push(...difficultyQuestions);
                }
            }

            // Fill remaining slots randomly if needed
            const remainingSlots = totalQuestions - questions.length;
            if (remainingSlots > 0) {
                const remainingQuestions = availableQuestions
                    .filter(q => !questions.includes(q))
                    .sort(() => 0.5 - Math.random())
                    .slice(0, remainingSlots);
                
                questions.push(...remainingQuestions);
            }

            // Create test
            const testData = {
                title: `${subject} ${academicYear} Mock Test`,
                subject: subject,
                academicYear: academicYear,
                duration: duration,
                totalQuestions: questions.length,
                questions: questions.map(q => q._id),
                difficultyDistribution: difficultyDistribution,
                topics: topics,
                isPublished: true,
                createdBy: req.user._id,
                metadata: {
                    generationMethod: 'auto'
                }
            };

            const test = new Test(testData);
            await test.save();

            // Populate references
            await test.populate('questions', 'question subject difficulty topic');
            await test.populate('createdBy', 'username email');

            res.status(201).json({
                success: true,
                data: test,
                message: 'Test generated successfully'
            });
        } catch (error) {
            console.error('❌ Error generating test:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET - Get test by ID
    async getTestById(req, res) {
        try {
            const { id } = req.params;
            
            const test = await Test.findById(id)
                .populate('questions')
                .populate('createdBy', 'username email')
                .lean();

            if (!test) {
                return res.status(404).json({
                    success: false,
                    error: 'Test not found'
                });
            }

            res.json({
                success: true,
                data: test
            });
        } catch (error) {
            console.error('❌ Error fetching test:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // PUT - Update test
    async updateTest(req, res) {
        try {
            const { id } = req.params;
            
            const test = await Test.findByIdAndUpdate(
                id,
                { ...req.body, updatedAt: Date.now() },
                { new: true, runValidators: true }
            )
            .populate('questions')
            .populate('createdBy', 'username email');

            if (!test) {
                return res.status(404).json({
                    success: false,
                    error: 'Test not found'
                });
            }

            res.json({
                success: true,
                data: test,
                message: 'Test updated successfully'
            });
        } catch (error) {
            console.error('❌ Error updating test:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // DELETE - Delete test
    async deleteTest(req, res) {
        try {
            const { id } = req.params;
            
            const test = await Test.findByIdAndUpdate(
                id,
                { isActive: false, updatedAt: Date.now() },
                { new: true }
            );

            if (!test) {
                return res.status(404).json({
                    success: false,
                    error: 'Test not found'
                });
            }

            res.json({
                success: true,
                message: 'Test deleted successfully'
            });
        } catch (error) {
            console.error('❌ Error deleting test:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // PUT - Publish test
    async publishTest(req, res) {
        try {
            const { id } = req.params;
            
            const test = await Test.findByIdAndUpdate(
                id,
                { 
                    isPublished: true, 
                    'metadata.publishDate': Date.now(),
                    updatedAt: Date.now()
                },
                { new: true }
            )
            .populate('questions')
            .populate('createdBy', 'username email');

            if (!test) {
                return res.status(404).json({
                    success: false,
                    error: 'Test not found'
                });
            }

            res.json({
                success: true,
                data: test,
                message: 'Test published successfully'
            });
        } catch (error) {
            console.error('❌ Error publishing test:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new TestController();