/**
 * Routes Index
 * Central export point for all routes
 */

const authRoutes = require('./auth.routes');
const videoRoutes = require('./video.routes');
const noteRoutes = require('./note.routes');
const backupRoutes = require('./backup.routes');

module.exports = {
    authRoutes,
    videoRoutes,
    noteRoutes,
    backupRoutes
};
