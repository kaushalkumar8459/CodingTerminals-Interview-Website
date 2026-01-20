// File: backend/models/UserProgress.js
const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
        index: true
    },
    answerGiven: {
        type: Number,
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    timeTaken: {
        type: Number, // seconds
        default: 0
    },
    attemptDate: {
        type: Date,
        default: Date.now,
        index: true
    },
    sessionType: {
        type: String,
        enum: ['practice', 'mock-test', 'revision'],
        default: 'practice'
    },
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test'
    }
}, { 
    timestamps: true,
    collection: 'codingTerminalsUserProgress'
});

// Indexes for better query performance
userProgressSchema.index({ userId: 1, questionId: 1 });
userProgressSchema.index({ userId: 1, sessionType: 1 });
userProgressSchema.index({ userId: 1, isCorrect: 1 });

module.exports = mongoose.model('UserProgress', userProgressSchema);