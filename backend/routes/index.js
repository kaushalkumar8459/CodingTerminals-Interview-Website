/**
 * Routes Index
 * Central export point for all routes
 * ONLY NEW OPTIMIZED ROUTES
 */

const studyNotesRoutes = require('./studyNotes.routes');
const authRoutes = require('./auth.routes');
const youtubeVideosRoutes = require('./youtubeVideosRoutes');

module.exports = {
    studyNotesRoutes,
    authRoutes,
    youtubeVideosRoutes
};
