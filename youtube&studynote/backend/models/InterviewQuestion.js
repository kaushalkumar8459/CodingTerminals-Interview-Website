const mongoose = require('mongoose');

/**
 * Interview Question Model
 * Collection: interviewQuestions
 * Matches existing MongoDB schema - separate from videos
 */

const interviewQuestionSchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: true,
        trim: true,
        ref: 'Video'
    },
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        default: '',
        trim: true
    },
    difficulty: {
        type: String,
        default: ''
    },
    orderIndex: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true,
    collection: 'interviewQuestions'
});

// Indexes for better query performance
interviewQuestionSchema.index({ videoId: 1, orderIndex: 1 });
interviewQuestionSchema.index({ difficulty: 1 });
interviewQuestionSchema.index({ question: 'text', answer: 'text' });

const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);

module.exports = InterviewQuestion;
