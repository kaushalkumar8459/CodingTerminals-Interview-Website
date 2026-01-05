const Profile = require('../models/Profile');

/**
 * Profile Controller
 * Manages personal profile and resume information
 */
class ProfileController {
    
    /**
     * Get profile (there's only one main profile)
     * GET /api/profile
     */
    async getProfile(req, res) {
        try {
            let profile = await Profile.findOne({ profileId: 'profile_main' });
            
            // Create default profile if doesn't exist
            if (!profile) {
                profile = new Profile({
                    profileId: 'profile_main',
                    fullName: 'Your Name',
                    email: 'your.email@example.com',
                    title: 'Full Stack Developer'
                });
                await profile.save();
            }
            
            res.json({
                success: true,
                data: profile
            });
        } catch (error) {
            console.error('❌ Error fetching profile:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Update profile
     * PUT /api/profile
     * ADMIN ONLY
     */
    async updateProfile(req, res) {
        try {
            const updateData = req.body;
            
            let profile = await Profile.findOneAndUpdate(
                { profileId: 'profile_main' },
                updateData,
                { new: true, upsert: true, runValidators: true }
            );
            
            console.log('✅ Profile updated');
            
            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: profile
            });
        } catch (error) {
            console.error('❌ Error updating profile:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new ProfileController();