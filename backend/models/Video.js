const mongoose = require('mongoose');

/**
 * Video Model
 * Collection: youtubeVideos
 * Matches existing MongoDB schema
 */

const videoSchema = new mongoose.Schema({
    videoId: {
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
    day: {
        type: Number,
        required: true
    },
    subtopics: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        default: 'Angular',
        trim: true
    },
    status: {
        type: String,
        enum: ['published', 'draft', 'archived'],
        default: 'published'
    },
    isUpcoming: {
        type: Boolean,
        default: false
    },
    estimatedDate: {
        type: Date,
        default: null
    },
    
    // Additional YouTube metadata (optional)
    videoUrl: String,
    thumbnail: String,
    description: String,
    date: String,
    viewCount: Number,
    likeCount: Number,
    commentCount: Number,
    position: Number
    
}, { 
    timestamps: true,
    collection: 'youtubeVideos'
});

// Indexes for better query performance
videoSchema.index({ day: 1 });
// videoId index removed - already defined as unique in schema
videoSchema.index({ status: 1 });
videoSchema.index({ title: 'text', 'subtopics': 'text' });

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
