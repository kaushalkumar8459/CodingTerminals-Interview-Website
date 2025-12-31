const mongoose = require('mongoose');

/**
 * Interview Question Schema (Simplified)
 * Stores interview questions separately (one document per question)
 */
const interviewQuestionSchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: true,
        ref: 'YouTubeVideo'
    },
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        default: ''
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
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
interviewQuestionSchema.index({ question: 'text', answer: 'text' }); // Text search

const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);

module.exports = InterviewQuestion;
