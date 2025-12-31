const mongoose = require('mongoose');

/**
 * Study Notes Model
 * Collection: codingTerminalsStudyNotes (matches JSON filename)
 */

const studyNotesSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: 'study_notes_collection'
    },
    version: {
        type: String,
        default: '1.0'
    },
    notes: [{
        _id: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true
        },
        tags: {
            type: [String],
            default: []
        },
        content: {
            type: String,
            default: ''
        },
        createdAt: String,
        updatedAt: String
    }],
    categories: [String],
    tags: [String],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true,
    collection: 'codingTerminalsStudyNotes'  // ✅ Matches your JSON filename
});

// Indexes for better search performance
studyNotesSchema.index({ 'notes.title': 'text', 'notes.content': 'text' });
studyNotesSchema.index({ 'notes.category': 1 });
studyNotesSchema.index({ 'notes.tags': 1 });

const StudyNotes = mongoose.model('StudyNotes', studyNotesSchema);

module.exports = StudyNotes;
