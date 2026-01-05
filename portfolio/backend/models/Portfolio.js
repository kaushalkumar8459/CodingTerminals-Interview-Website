const mongoose = require('mongoose');

/**
 * Portfolio Item Schema
 * Represents a single portfolio project/item
 */
const portfolioSchema = new mongoose.Schema({
    portfolioId: {
        type: String,
        required: true,
        unique: true,
        default: () => 'portfolio_' + Date.now()
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    category: {
        type: String,
        enum: ['Web Development', 'Mobile App', 'UI/UX Design', 'Data Science', 'Other'],
        default: 'Web Development'
    },
    technologies: [{
        type: String,
        trim: true
    }],
    imageUrl: {
        type: String,
        default: 'https://via.placeholder.com/400x300'
    },
    projectUrl: {
        type: String,
        trim: true
    },
    githubUrl: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['completed', 'in-progress', 'planned'],
        default: 'completed'
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    featured: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for faster queries
portfolioSchema.index({ portfolioId: 1 });
portfolioSchema.index({ category: 1 });
portfolioSchema.index({ featured: 1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);