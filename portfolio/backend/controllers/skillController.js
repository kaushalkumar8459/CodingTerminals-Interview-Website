const Skill = require('../models/Skill');

/**
 * Skill Controller
 * Manages skills with proficiency tracking
 */
class SkillController {
    
    // GET all skills
    async getAllSkills(req, res) {
        try {
            const { category } = req.query;
            const filter = category ? { category } : {};
            const skills = await Skill.find(filter).sort({ order: 1, proficiency: -1 });
            res.json({ success: true, count: skills.length, data: skills });
        } catch (error) {
            console.error('❌ Error fetching skills:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // GET skill by ID
    async getSkillById(req, res) {
        try {
            const skill = await Skill.findById(req.params.id);
            if (!skill) {
                return res.status(404).json({ success: false, error: 'Skill not found' });
            }
            res.json({ success: true, data: skill });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // CREATE skill (ADMIN)
    async createSkill(req, res) {
        try {
            const skill = new Skill(req.body);
            await skill.save();
            console.log('✅ Skill created:', skill.skillId);
            res.status(201).json({ success: true, message: 'Skill created successfully', data: skill });
        } catch (error) {
            console.error('❌ Error creating skill:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // UPDATE skill (ADMIN)
    async updateSkill(req, res) {
        try {
            const skill = await Skill.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!skill) {
                return res.status(404).json({ success: false, error: 'Skill not found' });
            }
            console.log('✅ Skill updated:', skill.skillId);
            res.json({ success: true, message: 'Skill updated successfully', data: skill });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // DELETE skill (ADMIN)
    async deleteSkill(req, res) {
        try {
            const skill = await Skill.findByIdAndDelete(req.params.id);
            if (!skill) {
                return res.status(404).json({ success: false, error: 'Skill not found' });
            }
            console.log('✅ Skill deleted:', skill.skillId);
            res.json({ success: true, message: 'Skill deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new SkillController();