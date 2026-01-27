/**
 * Routes Index
 * Central export point for all routes
 */

const authRoutes = require('./auth.routes');
const videoRoutes = require('./video.routes');
const noteRoutes = require('./note.routes');
const backupRoutes = require('./backup.routes');
const interviewQuestionRoutes = require('./interviewQuestion.routes');
const questionRoutes = require('./question.routes');
const testRoutes = require('./test.routes');
const questionGroupRoutes = require('./questionGroup.routes');

module.exports = {
    authRoutes,
    videoRoutes,
    noteRoutes,
    backupRoutes,
    interviewQuestionRoutes,
    questionRoutes,
    testRoutes,
    questionGroupRoutes,
};
