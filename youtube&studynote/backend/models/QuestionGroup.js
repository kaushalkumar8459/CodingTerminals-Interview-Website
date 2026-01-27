// File: backend/models/QuestionGroup.js
const mongoose = require('mongoose');

const questionGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        default: ''
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    subject: {
        type: String,
        trim: true,
        index: true
    },
    academicYear: {
        type: String,
        trim: true,
        index: true
    },
    difficulty: {
        type: String,
    },
    tags: [{
        type: String,
        trim: true
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { 
    timestamps: true,
    collection: 'codingTerminalsQuestionGroups'
});

// Indexes for better query performance
questionGroupSchema.index({ subject: 1 });
questionGroupSchema.index({ academicYear: 1 });
questionGroupSchema.index({ isPublic: 1 });

module.exports = mongoose.model('QuestionGroup', questionGroupSchema);