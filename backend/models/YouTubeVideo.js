const mongoose = require('mongoose');

/**
 * YouTube Video Schema (Simplified)
 * Stores only custom data (subtopics, questions)
 * YouTube API provides: title, videoId, views, likes, thumbnail, etc.
 */
const youtubeVideoSchema = new mongoose.Schema({
    // YouTube video identifier (from YouTube API)
    videoId: {
        type: String,
        required: true,
        unique: true,  // ✅ This creates index automatically, no need for schema.index()
        trim: true
    },
    
    // Custom data (not available from YouTube API)
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
    
    // Video status
    status: {
        type: String,
        enum: ['published', 'upcoming', 'draft'],
        default: 'published'
    },
    
    isUpcoming: {
        type: Boolean,
        default: false
    },
    
    estimatedDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    collection: 'youtubeVideos'
});

// Indexes for better query performance
// ❌ REMOVED: youtubeVideoSchema.index({ videoId: 1 }); // Duplicate - unique:true already creates index
youtubeVideoSchema.index({ day: 1 });
youtubeVideoSchema.index({ status: 1 });
youtubeVideoSchema.index({ title: 'text' }); // Text search

const YouTubeVideo = mongoose.model('YouTubeVideo', youtubeVideoSchema);

module.exports = YouTubeVideo;
