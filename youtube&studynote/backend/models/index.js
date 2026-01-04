/**
 * Models Index
 * Central export point for all database models
 */

const Video = require('./Video');
const InterviewQuestion = require('./InterviewQuestion');
const Note = require('./Note');

module.exports = {
    Video,
    InterviewQuestion,
    Note
};
