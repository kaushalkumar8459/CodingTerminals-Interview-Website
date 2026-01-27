/**
 * Models Index
 * Central export point for all database models
 */

const Video = require('./Video');
const InterviewQuestion = require('./InterviewQuestion');
const Note = require('./Note');
// Import the new TestSeries models
const Question = require('./Question');
const Test = require('./Test');
const QuestionGroup = require('./QuestionGroup');
const UserProgress = require('./UserProgress');

module.exports = {
    Video,
    InterviewQuestion,
    Note,
    // TestSeries models
    Question,
    Test,
    QuestionGroup,
    UserProgress
};
