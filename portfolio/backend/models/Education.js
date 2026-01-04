const mongoose = require('mongoose');

/**
 * Education Schema
 * Educational background and certifications
 */
const educationSchema = new mongoose.Schema({
    educationId: {
        type: String,
        required: true,
        unique: true,
        default: () => 'edu_' + Date.now()
    },
    institution: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    fieldOfStudy: {
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
    grade: {
        type: String
    },
    description: {
        type: String
    },
    achievements: [{
        type: String
    }],
    institutionLogo: {
        type: String
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

educationSchema.index({ educationId: 1 });

module.exports = mongoose.model('Education', educationSchema);