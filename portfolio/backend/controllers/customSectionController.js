const CustomSection = require('../models/CustomSection');

/**
 * Get all custom sections
 */
exports.getAllSections = async (req, res) => {
  try {
    const sections = await CustomSection.find().sort({ 'settings.order': 1 });
    res.json({
      success: true,
      data: sections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching custom sections',
      error: error.message
    });
  }
};

/**
 * Get single custom section by name or ID
 */
exports.getSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await CustomSection.findOne({
      $or: [{ _id: id }, { name: id }]
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    res.json({
      success: true,
      data: section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching section',
      error: error.message
    });
  }
};

/**
 * Create new custom section
 */
exports.createSection = async (req, res) => {
  try {
    const section = new CustomSection(req.body);
    await section.save();

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: section
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating section',
      error: error.message
    });
  }
};

/**
 * Update custom section
 */
exports.updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await CustomSection.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    res.json({
      success: true,
      message: 'Section updated successfully',
      data: section
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating section',
      error: error.message
    });
  }
};

/**
 * Delete custom section
 */
exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await CustomSection.findByIdAndDelete(id);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    res.json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting section',
      error: error.message
    });
  }
};

/**
 * Add item to custom section
 */
exports.addItem = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await CustomSection.findById(id);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    section.items.push({
      data: req.body,
      order: section.items.length
    });

    await section.save();

    res.status(201).json({
      success: true,
      message: 'Item added successfully',
      data: section
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error adding item',
      error: error.message
    });
  }
};

/**
 * Update item in custom section
 */
exports.updateItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const section = await CustomSection.findById(id);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    const item = section.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    item.data = req.body;
    await section.save();

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: section
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating item',
      error: error.message
    });
  }
};

/**
 * Delete item from custom section
 */
exports.deleteItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const section = await CustomSection.findById(id);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    section.items.pull(itemId);
    await section.save();

    res.json({
      success: true,
      message: 'Item deleted successfully',
      data: section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting item',
      error: error.message
    });
  }
};

/**
 * Update section design/styling
 */
exports.updateDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await CustomSection.findByIdAndUpdate(
      id,
      { $set: { design: req.body } },
      { new: true, runValidators: true }
    );

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    res.json({
      success: true,
      message: 'Design updated successfully',
      data: section
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating design',
      error: error.message
    });
  }
};
