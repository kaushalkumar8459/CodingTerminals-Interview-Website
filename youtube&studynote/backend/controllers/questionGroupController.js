// File: backend/controllers/questionGroupController.js
const QuestionGroup = require('../models/QuestionGroup');
const Question = require('../models/Question');

class QuestionGroupController {
    
    // GET - Get all groups
    async getAllGroups(req, res) {
        try {
            const { 
                subject, 
                academicYear, 
                isPublic = true,
                page = 1, 
                limit = 20
            } = req.query;

            let query = { isPublic: isPublic === 'true' };

            // Apply filters
            if (subject && subject !== 'all') {
                query.subject = subject;
            }
            
            if (academicYear && academicYear !== 'all') {
                query.academicYear = academicYear;
            }

            const skip = (page - 1) * limit;
            
            const groups = await QuestionGroup.find(query)
                .populate('questions', 'question subject difficulty')
                .populate('createdBy', 'username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            const total = await QuestionGroup.countDocuments(query);

            res.json({
                success: true,
                data: groups,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('❌ Error fetching groups:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // POST - Create new group
    async createGroup(req, res) {
        try {
            const groupData = {
                ...req.body,
                createdBy: req.user._id
            };

            const group = new QuestionGroup(groupData);
            await group.save();

            // Populate references
            await group.populate('questions', 'question subject difficulty');
            await group.populate('createdBy', 'username email');

            res.status(201).json({
                success: true,
                data: group,
                message: 'Group created successfully'
            });
        } catch (error) {
            console.error('❌ Error creating group:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // POST - Assign questions to group
    async assignToGroup(req, res) {
        try {
            const { groupId, questionIds } = req.body;
            
            if (!Array.isArray(questionIds) || questionIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Question IDs array is required'
                });
            }

            const group = await QuestionGroup.findByIdAndUpdate(
                groupId,
                { 
                    $addToSet: { questions: { $each: questionIds } },
                    updatedAt: Date.now()
                },
                { new: true }
            )
            .populate('questions', 'question subject difficulty')
            .populate('createdBy', 'username email');

            if (!group) {
                return res.status(404).json({
                    success: false,
                    error: 'Group not found'
                });
            }

            res.json({
                success: true,
                data: group,
                message: 'Questions assigned to group successfully'
            });
        } catch (error) {
            console.error('❌ Error assigning questions to group:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET - Get group by ID
    async getGroupById(req, res) {
        try {
            const { id } = req.params;
            
            const group = await QuestionGroup.findById(id)
                .populate('questions')
                .populate('createdBy', 'username email')
                .lean();

            if (!group) {
                return res.status(404).json({
                    success: false,
                    error: 'Group not found'
                });
            }

            res.json({
                success: true,
                data: group
            });
        } catch (error) {
            console.error('❌ Error fetching group:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // PUT - Update group
    async updateGroup(req, res) {
        try {
            const { id } = req.params;
            
            const group = await QuestionGroup.findByIdAndUpdate(
                id,
                { ...req.body, updatedAt: Date.now() },
                { new: true, runValidators: true }
            )
            .populate('questions', 'question subject difficulty')
            .populate('createdBy', 'username email');

            if (!group) {
                return res.status(404).json({
                    success: false,
                    error: 'Group not found'
                });
            }

            res.json({
                success: true,
                data: group,
                message: 'Group updated successfully'
            });
        } catch (error) {
            console.error('❌ Error updating group:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // DELETE - Delete group
    async deleteGroup(req, res) {
        try {
            const { id } = req.params;
            
            const group = await QuestionGroup.findByIdAndDelete(id);

            if (!group) {
                return res.status(404).json({
                    success: false,
                    error: 'Group not found'
                });
            }

            res.json({
                success: true,
                message: 'Group deleted successfully'
            });
        } catch (error) {
            console.error('❌ Error deleting group:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new QuestionGroupController();