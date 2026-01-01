/**
 * Routes Index
 * Central export point for all routes
 */

const authRoutes = require('./auth.routes');
const videoRoutes = require('./video.routes');
const noteRoutes = require('./note.routes');

module.exports = {
    authRoutes,
    videoRoutes,
    noteRoutes
};
