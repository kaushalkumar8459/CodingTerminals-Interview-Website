// File: backend/models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: function(options) {
                return options && options.length >= 2;
            },
            message: 'Question must have at least 2 options'
        }
    },
    correctAnswer: {
        type: Number,
        required: true,
        min: 0
    },
    explanation: {
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
    examType: {
        type: String,
        required: true,
        enum: ['Board Exam', 'University Exam', 'Competitive Exam', 'Mid-Term', 'Final Exam', 'Mock Test', 'Practice Paper'],
        default: 'Practice Paper'
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Intermediate'
    },
    topic: {
        type: String,
        trim: true,
        default: ''
    },
    marks: {
        type: Number,
        default: 1,
        min: 1
    },
    group: {
        type: String,
        trim: true,
        default: ''
    },
    duplicateOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    metadata: {
        sourceFile: String,
        importDate: Date,
        ocrProcessed: Boolean,
        validationStatus: {
            type: String,
            enum: ['pending', 'validated', 'rejected'],
            default: 'pending'
        }
    }
}, { 
    timestamps: true,
    collection: 'codingTerminalsQuestions'
});

// Indexes for better query performance
questionSchema.index({ subject: 1, academicYear: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ topic: 1 });
questionSchema.index({ group: 1 });
questionSchema.index({ isActive: 1 });

// Text index for search functionality
questionSchema.index({ 
    question: 'text', 
    subject: 'text', 
    topic: 'text',
    explanation: 'text' 
});

// Virtual for checking if answer is correct
questionSchema.virtual('isCorrectAnswer').get(function(answerIndex) {
    return answerIndex === this.correctAnswer;
});

// Pre-save middleware to validate correct answer
questionSchema.pre('save', function(next) {
    if (this.correctAnswer >= this.options.length) {
        return next(new Error('Correct answer index must be less than number of options'));
    }
    next();
});

module.exports = mongoose.model('Question', questionSchema);