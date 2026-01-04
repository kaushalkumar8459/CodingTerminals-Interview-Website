const Education = require('../models/Education');

/**
 * Education Controller
 * Manages education entries
 */
class EducationController {
    
    // GET all education entries
    async getAllEducation(req, res) {
        try {
            const education = await Education.find().sort({ order: 1, startDate: -1 });
            res.json({ success: true, count: education.length, data: education });
        } catch (error) {
            console.error('❌ Error fetching education:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // GET education by ID
    async getEducationById(req, res) {
        try {
            const education = await Education.findById(req.params.id);
            if (!education) {
                return res.status(404).json({ success: false, error: 'Education not found' });
            }
            res.json({ success: true, data: education });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // CREATE education (ADMIN)
    async createEducation(req, res) {
        try {
            const education = new Education(req.body);
            await education.save();
            console.log('✅ Education created:', education.educationId);
            res.status(201).json({ success: true, message: 'Education created successfully', data: education });
        } catch (error) {
            console.error('❌ Error creating education:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // UPDATE education (ADMIN)
    async updateEducation(req, res) {
        try {
            const education = await Education.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!education) {
                return res.status(404).json({ success: false, error: 'Education not found' });
            }
            console.log('✅ Education updated:', education.educationId);
            res.json({ success: true, message: 'Education updated successfully', data: education });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // DELETE education (ADMIN)
    async deleteEducation(req, res) {
        try {
            const education = await Education.findByIdAndDelete(req.params.id);
            if (!education) {
                return res.status(404).json({ success: false, error: 'Education not found' });
            }
            console.log('✅ Education deleted:', education.educationId);
            res.json({ success: true, message: 'Education deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new EducationController();