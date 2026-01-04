const express = require('express');
const router = express.Router();
const customSectionController = require('../controllers/customSectionController');

// Get all custom sections
router.get('/', customSectionController.getAllSections);

// Get single custom section
router.get('/:id', customSectionController.getSection);

// Create new custom section
router.post('/', customSectionController.createSection);

// Update custom section
router.put('/:id', customSectionController.updateSection);

// Delete custom section
router.delete('/:id', customSectionController.deleteSection);

// Add item to custom section
router.post('/:id/items', customSectionController.addItem);

// Update item in custom section
router.put('/:id/items/:itemId', customSectionController.updateItem);

// Delete item from custom section
router.delete('/:id/items/:itemId', customSectionController.deleteItem);

// Update section design
router.put('/:id/design', customSectionController.updateDesign);

module.exports = router;
