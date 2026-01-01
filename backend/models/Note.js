const mongoose = require('mongoose');

/**
 * Note Model (Individual Documents)
 * Collection: studyNotes
 * NEW Architecture - One document per note
 */

const noteSchema = new mongoose.Schema({
    noteId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'General',
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    type: {
        type: String,
        enum: ['rich', 'markdown', 'plain'],
        default: 'rich'
    },
    date: {
        type: String,
        default: () => new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        })
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isFavorite: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true,
    collection: 'studyNotes'
});

// Indexes for better query performance
// noteId index removed - already defined as unique in schema
noteSchema.index({ category: 1 });
noteSchema.index({ tags: 1 });
noteSchema.index({ isPinned: -1, createdAt: -1 });
noteSchema.index({ title: 'text', content: 'text' });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
