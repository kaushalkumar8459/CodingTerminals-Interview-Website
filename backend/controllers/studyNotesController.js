const mongoose = require('mongoose');
const { StudyNotes } = require('../models');

/**
 * Study Notes Controller
 * Handles all business logic for Study Notes endpoints
 * Storage: MongoDB (primary) + IndexedDB (browser cache)
 */

class StudyNotesController {
    
    /**
     * Get Study Notes Data
     * Priority: MongoDB → Default
     */
    async getNotes(req, res) {
        try {
            let data = null;

            // Try MongoDB first
            if (mongoose.connection.readyState === 1) {
                const mongoData = await StudyNotes.findById('study_notes_collection');
                if (mongoData) {
                    console.log('📦 Loading Study Notes from MongoDB');
                    data = mongoData.toObject();
                }
            }

            // Default data if nothing found
            if (!data) {
                console.log('⚠️  No data found in MongoDB, returning default structure');
                data = {
                    _id: "study_notes_collection",
                    version: "1.0",
                    notes: [],
                    categories: [],
                    tags: []
                };
            }

            res.json(data);
        } catch (error) {
            console.error('❌ Error reading study notes:', error);
            res.status(500).json({ 
                error: error.message,
                message: 'Failed to load Study Notes'
            });
        }
    }

    /**
     * Save Study Notes Data
     * Saves to MongoDB only (IndexedDB is handled by frontend)
     */
    async saveNotes(req, res) {
        try {
            const data = req.body;
            const savedLocations = [];
            const errors = [];

            // Save to MongoDB
            if (mongoose.connection.readyState === 1) {
                try {
                    await StudyNotes.findByIdAndUpdate(
                        'study_notes_collection',
                        data,
                        { upsert: true, new: true }
                    );
                    console.log('✅ Study Notes saved to MongoDB');
                    savedLocations.push('MongoDB');
                } catch (mongoError) {
                    console.error('⚠️  MongoDB save failed:', mongoError.message);
                    errors.push({ location: 'MongoDB', error: mongoError.message });
                }
            } else {
                const error = 'MongoDB not connected';
                console.error('❌', error);
                errors.push({ location: 'MongoDB', error });
            }

            // Check if save was successful
            if (savedLocations.length === 0) {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to save to MongoDB',
                    message: 'MongoDB connection issue. Please check your database connection.',
                    errors
                });
            }

            res.json({ 
                success: true,
                message: 'Study Notes saved successfully!',
                savedTo: savedLocations,
                note: 'Data is also cached in IndexedDB by your browser',
                errors: errors.length > 0 ? errors : undefined
            });
        } catch (error) {
            console.error('❌ Error saving study notes:', error);
            res.status(500).json({ 
                success: false,
                error: error.message,
                message: 'Failed to save Study Notes'
            });
        }
    }
}

module.exports = new StudyNotesController();
