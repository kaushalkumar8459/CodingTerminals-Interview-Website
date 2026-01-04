const Experience = require('../models/Experience');

/**
 * Experience Controller
 * Manages work experience entries
 */
class ExperienceController {
    
    // GET all experiences
    async getAllExperiences(req, res) {
        try {
            const experiences = await Experience.find().sort({ order: 1, startDate: -1 });
            res.json({ success: true, count: experiences.length, data: experiences });
        } catch (error) {
            console.error('❌ Error fetching experiences:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // GET experience by ID
    async getExperienceById(req, res) {
        try {
            const experience = await Experience.findById(req.params.id);
            if (!experience) {
                return res.status(404).json({ success: false, error: 'Experience not found' });
            }
            res.json({ success: true, data: experience });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // CREATE experience (ADMIN)
    async createExperience(req, res) {
        try {
            const experience = new Experience(req.body);
            await experience.save();
            console.log('✅ Experience created:', experience.experienceId);
            res.status(201).json({ success: true, message: 'Experience created successfully', data: experience });
        } catch (error) {
            console.error('❌ Error creating experience:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // UPDATE experience (ADMIN)
    async updateExperience(req, res) {
        try {
            const experience = await Experience.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!experience) {
                return res.status(404).json({ success: false, error: 'Experience not found' });
            }
            console.log('✅ Experience updated:', experience.experienceId);
            res.json({ success: true, message: 'Experience updated successfully', data: experience });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // DELETE experience (ADMIN)
    async deleteExperience(req, res) {
        try {
            const experience = await Experience.findByIdAndDelete(req.params.id);
            if (!experience) {
                return res.status(404).json({ success: false, error: 'Experience not found' });
            }
            console.log('✅ Experience deleted:', experience.experienceId);
            res.json({ success: true, message: 'Experience deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new ExperienceController();