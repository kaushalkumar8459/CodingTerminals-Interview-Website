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
                isActive = 'true',
                isPublished = 'true',
                page = 1, 
                limit = 20
            } = req.query;

            let query = {};
            
            // Handle isActive filter (support 'all' to get both)
            if (isActive !== 'all') {
                query.isActive = isActive === 'true';
            }
            
            // Handle isPublished filter (support 'all' to get both published and draft)
            if (isPublished !== 'all') {
                query.isPublished = isPublished === 'true';
            }

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
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            // Add default createdBy info since User model doesn't exist
            const testsWithCreator = tests.map(test => ({
                ...test,
                createdBy: { username: 'Admin', email: 'admin@codingterminals.com' }
            }));

            const total = await Test.countDocuments(query);

            res.json({
                success: true,
                data: testsWithCreator,
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
            // Use req.user._id if authenticated, otherwise use createdBy from body or default
            const createdBy = req.user?._id || req.body.createdBy || '507f1f77bcf86cd799439011';
            
            const testData = {
                ...req.body,
                createdBy: createdBy
            };

            const test = new Test(testData);
            await test.save();

            // Populate references
            await test.populate('questions', 'question subject difficulty');

            // Add default createdBy info
            const testResponse = test.toObject();
            testResponse.createdBy = { username: 'Admin', email: 'admin@codingterminals.com' };

            res.status(201).json({
                success: true,
                data: testResponse,
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

            // Validate inputs - only subject is required
            if (!subject) {
                return res.status(400).json({
                    success: false,
                    error: 'Subject is required'
                });
            }

            // Build query for questions - more flexible matching
            let questionQuery = {
                isActive: true
            };

            // Add subject filter (case-insensitive)
            if (subject && subject !== 'all') {
                questionQuery.subject = { $regex: new RegExp(`^${subject}$`, 'i') };
            }

            // Add academicYear filter only if provided and not 'all'
            if (academicYear && academicYear !== 'all' && academicYear.trim() !== '') {
                questionQuery.academicYear = academicYear;
            }

            if (topics && topics.length > 0 && !topics.includes('all')) {
                questionQuery.topic = { $in: topics };
            }

            console.log('Question query:', JSON.stringify(questionQuery));

            // Get all matching questions
            let availableQuestions = await Question.find(questionQuery);
            console.log(`Found ${availableQuestions.length} questions with strict filters`);

            // If not enough questions, relax topic constraint
            if (availableQuestions.length < totalQuestions && questionQuery.topic) {
                delete questionQuery.topic;
                availableQuestions = await Question.find(questionQuery);
                console.log(`Found ${availableQuestions.length} questions after removing topic filter`);
            }

            // If still not enough, relax academicYear constraint
            if (availableQuestions.length < totalQuestions && questionQuery.academicYear) {
                delete questionQuery.academicYear;
                availableQuestions = await Question.find(questionQuery);
                console.log(`Found ${availableQuestions.length} questions after removing year filter`);
            }

            if (availableQuestions.length < totalQuestions) {
                return res.status(400).json({
                    success: false,
                    error: `Not enough questions available. Found ${availableQuestions.length}, need ${totalQuestions}. Try reducing the number of questions or selecting a different subject.`
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
            const testTitle = academicYear && academicYear !== 'all' 
                ? `${subject} ${academicYear} Mock Test`
                : `${subject} Mock Test`;
            
            const testData = {
                title: testTitle,
                subject: subject,
                academicYear: academicYear || 'All Years',
                duration: duration,
                totalQuestions: questions.length,
                questions: questions.map(q => q._id),
                difficultyDistribution: difficultyDistribution,
                topics: topics,
                isPublished: true,
                createdBy: req.user?._id || req.body.createdBy || '507f1f77bcf86cd799439011',
                metadata: {
                    generationMethod: 'auto'
                }
            };

            const test = new Test(testData);
            await test.save();

            // Populate references
            await test.populate('questions', 'question subject difficulty topic');

            // Add default createdBy info
            const testResponse = test.toObject();
            testResponse.createdBy = { username: 'Admin', email: 'admin@codingterminals.com' };

            res.status(201).json({
                success: true,
                data: testResponse,
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
                .lean();

            if (!test) {
                return res.status(404).json({
                    success: false,
                    error: 'Test not found'
                });
            }

            // Add default createdBy info
            test.createdBy = { username: 'Admin', email: 'admin@codingterminals.com' };

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
            .populate('questions');

            if (!test) {
                return res.status(404).json({
                    success: false,
                    error: 'Test not found'
                });
            }

            // Add default createdBy info
            const testResponse = test.toObject();
            testResponse.createdBy = { username: 'Admin', email: 'admin@codingterminals.com' };

            res.json({
                success: true,
                data: testResponse,
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
            .populate('questions');

            if (!test) {
                return res.status(404).json({
                    success: false,
                    error: 'Test not found'
                });
            }

            // Add default createdBy info
            const testResponse = test.toObject();
            testResponse.createdBy = { username: 'Admin', email: 'admin@codingterminals.com' };

            res.json({
                success: true,
                data: testResponse,
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

    // PUT - Unpublish test (move back to draft)
    async unpublishTest(req, res) {
        try {
            const { id } = req.params;
            
            const test = await Test.findByIdAndUpdate(
                id,
                { 
                    isPublished: false,
                    updatedAt: Date.now()
                },
                { new: true }
            )
            .populate('questions');

            if (!test) {
                return res.status(404).json({
                    success: false,
                    error: 'Test not found'
                });
            }

            // Add default createdBy info
            const testResponse = test.toObject();
            testResponse.createdBy = { username: 'Admin', email: 'admin@codingterminals.com' };

            res.json({
                success: true,
                data: testResponse,
                message: 'Test moved to draft successfully'
            });
        } catch (error) {
            console.error('❌ Error unpublishing test:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new TestController();