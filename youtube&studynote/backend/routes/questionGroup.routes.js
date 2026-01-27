// File: backend/routes/questionGroup.routes.js
const express = require('express');
const router = express.Router();
const questionGroupController = require('../controllers/questionGroupController');

// GET - Get all groups
router.get('/', questionGroupController.getAllGroups);

// POST - Create new group
router.post('/', questionGroupController.createGroup);

// POST - Assign questions to group
router.post('/assign', questionGroupController.assignToGroup);

// GET - Get group by ID
router.get('/:id', questionGroupController.getGroupById);

// PUT - Update group
router.put('/:id', questionGroupController.updateGroup);

// DELETE - Delete group
router.delete('/:id', questionGroupController.deleteGroup);

module.exports = router;