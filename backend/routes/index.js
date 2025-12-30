/**
 * Routes Index
 * Central export point for all routes
 */

const youtubeRoadmapRoutes = require('./youtubeRoadmap.routes');
const studyNotesRoutes = require('./studyNotes.routes');
const authRoutes = require('./auth.routes');

module.exports = {
    youtubeRoadmapRoutes,
    studyNotesRoutes,
    authRoutes
};
