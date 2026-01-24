// File: backend/models/Test.js
const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    academicYear: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    duration: {
        type: Number,
        required: true,
        min: 1, // minutes
        max: 300
    },
    totalQuestions: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    }],
    difficultyDistribution: {
        easy: { type: Number, default: 0, min: 0 },
        intermediate: { type: Number, default: 0, min: 0 },
        advanced: { type: Number, default: 0, min: 0 },
        expert: { type: Number, default: 0, min: 0 }
    },
    topics: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    metadata: {
        templateUsed: String,
        generationMethod: {
            type: String,
            default: 'manual'
        },
        publishDate: Date
    }
}, { 
    timestamps: true,
    collection: 'codingTerminalsTests'
});

// Indexes for better query performance
testSchema.index({ subject: 1, academicYear: 1 });
testSchema.index({ isActive: 1 });
testSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Test', testSchema);