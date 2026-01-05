const mongoose = require('mongoose');

/**
 * Experience Schema
 * Work experience and professional history
 */
const experienceSchema = new mongoose.Schema({
    experienceId: {
        type: String,
        required: true,
        unique: true,
        default: () => 'exp_' + Date.now()
    },
    company: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    location: {
        type: String
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    current: {
        type: Boolean,
        default: false
    },
    description: {
        type: String
    },
    responsibilities: [{
        type: String
    }],
    technologies: [{
        type: String
    }],
    companyLogo: {
        type: String
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

experienceSchema.index({ experienceId: 1 });

module.exports = mongoose.model('Experience', experienceSchema);