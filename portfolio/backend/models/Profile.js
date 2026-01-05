const mongoose = require('mongoose');

/**
 * Profile Schema
 * Personal information and resume details
 */
const profileSchema = new mongoose.Schema({
    profileId: {
        type: String,
        required: true,
        unique: true,
        default: 'profile_main'
    },
    
    // Resume Type/Template Selection
    resumeType: {
        type: String,
        enum: ['modern', 'classic', 'creative', 'minimal', 'professional'],
        default: 'modern',
        description: 'Choose resume template style'
    },
    
    // Basic Info
    fullName: {
        type: String,
        required: true,
        default: 'Kaushal Kumar'
    },
    title: {
        type: String,
        required: true,
        default: 'Full Stack Developer | Angular Expert | Content Creator'
    },
    bio: {
        type: String,
        default: 'Passionate developer and educator creating content on Coding Terminals YouTube channel'
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    location: {
        type: String,
        default: 'India'
    },
    profileImage: {
        type: String,
        default: 'https://via.placeholder.com/300'
    },
    resumePdfUrl: {
        type: String
    },
    
    // Social Links
    socialLinks: {
        youtube: {
            type: String,
            default: 'https://www.youtube.com/@codingterminals'
        },
        linkedin: {
            type: String,
            default: 'https://linkedin.com/in/yourprofile'
        },
        github: {
            type: String,
            default: 'https://github.com/yourusername'
        },
        twitter: {
            type: String
        },
        instagram: {
            type: String
        },
        portfolio: {
            type: String
        }
    },
    
    // Professional Summary
    summary: {
        type: String,
        default: 'Experienced developer with expertise in modern web technologies'
    },
    
    // Years of Experience
    yearsOfExperience: {
        type: Number,
        default: 5
    },
    
    // Availability Status
    availableForWork: {
        type: Boolean,
        default: true
    },
    
    // Theme Preferences
    theme: {
        primaryColor: {
            type: String,
            default: '#667eea'
        },
        secondaryColor: {
            type: String,
            default: '#764ba2'
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);