const mongoose = require('mongoose');

const CustomSectionSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true,
    unique: true
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: '📋'
  },
  
  // Design & Styling
  design: {
    primaryColor: {
      type: String,
      default: '#667eea'
    },
    secondaryColor: {
      type: String,
      default: '#764ba2'
    },
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    textColor: {
      type: String,
      default: '#333333'
    },
    borderColor: {
      type: String,
      default: '#e0e0e0'
    },
    borderRadius: {
      type: String,
      default: '8px'
    },
    cardStyle: {
      type: String,
      enum: ['card', 'list', 'grid', 'timeline', 'accordion'],
      default: 'card'
    },
    layout: {
      type: String,
      enum: ['single-column', 'two-column', 'three-column', 'masonry'],
      default: 'single-column'
    }
  },
  
  // Field Configuration
  fields: [{
    name: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'textarea', 'number', 'date', 'url', 'email', 'file', 'array', 'boolean', 'color', 'select'],
      default: 'text'
    },
    required: {
      type: Boolean,
      default: false
    },
    placeholder: String,
    options: [String], // For select type
    order: {
      type: Number,
      default: 0
    }
  }],
  
  // Content Items
  items: [{
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    order: {
      type: Number,
      default: 0
    },
    visible: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Section Settings
  settings: {
    visible: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    },
    showInMenu: {
      type: Boolean,
      default: true
    },
    enableSearch: {
      type: Boolean,
      default: false
    },
    itemsPerPage: {
      type: Number,
      default: 10
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
CustomSectionSchema.index({ name: 1 });
CustomSectionSchema.index({ 'settings.order': 1 });

module.exports = mongoose.model('CustomSection', CustomSectionSchema);
