const mongoose = require('mongoose');

/**
 * YouTube Roadmap Model
 * Schema for storing YouTube video roadmap data
 * Collection: codingTerminalsYouTubeRoadmap (matches JSON filename)
 */

const youtubeRoadmapSchema = new mongoose.Schema({
    channelName: {
        type: String,
        required: true,
        default: 'Coding Terminals',
        trim: true
    },
    channelLogo: {
        type: String,
        default: './assets/CT logo.jpg'
    },
    videoPlaylist: [{
        title: {
            type: String,
            required: true
        },
        subtopics: [String],
        interviewQuestions: [{
            question: {
                type: String,
                required: true
            },
            answer: String
        }]
    }],
    upcomingTopic: {
        title: String,
        description: String,
        subtopics: [String],
        interviewQuestions: [{
            question: String,
            answer: String
        }],
        estimatedDate: String
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true,
    collection: 'codingTerminalsYouTubeRoadmap'  // ✅ Matches your JSON filename
});

// Indexes for better query performance
youtubeRoadmapSchema.index({ createdAt: -1 });
youtubeRoadmapSchema.index({ 'videoPlaylist.title': 'text' });

const YouTubeRoadmap = mongoose.model('YouTubeRoadmap', youtubeRoadmapSchema);

module.exports = YouTubeRoadmap;
