const mongoose = require('mongoose');

/**
 * Skills Schema
 * Technical and soft skills with proficiency levels
 */
const skillSchema = new mongoose.Schema({
    skillId: {
        type: String,
        required: true,
        unique: true,
        default: () => 'skill_' + Date.now()
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools', 'Soft Skills', 'Other'],
        default: 'Other'
    },
    proficiency: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
        description: 'Skill level in percentage (0-100)'
    },
    yearsOfExperience: {
        type: Number,
        default: 0
    },
    icon: {
        type: String,
        description: 'Icon URL or class name'
    },
    color: {
        type: String,
        default: '#667eea'
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

skillSchema.index({ skillId: 1 });
skillSchema.index({ category: 1 });

module.exports = mongoose.model('Skill', skillSchema);