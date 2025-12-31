/**
 * Models Index
 * Central export point for all database models
 */

const YouTubeRoadmap = require('./YouTubeRoadmap');
const StudyNotes = require('./StudyNotes');

// New optimized models (simplified - no channel model needed)
const YouTubeVideo = require('./YouTubeVideo');
const InterviewQuestion = require('./InterviewQuestion');

module.exports = {
    // Old models (keep for backward compatibility during migration)
    YouTubeRoadmap,
    StudyNotes,
    
    // New optimized models
    YouTubeVideo,
    InterviewQuestion
};
