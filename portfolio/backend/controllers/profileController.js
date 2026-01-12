const Profile = require('../models/Profile');

/**
 * Profile Controller
 * Manages personal profile and resume information
 */
class ProfileController {
    
    /**
     * Get profile (there's only one main profile)
     * GET /api/profile
     * Returns the main profile with default values if not exists
     */
    async getProfile(req, res) {
        try {
            let profile = await Profile.findOne({ profileId: 'profile_main' });
            
            // Create default profile if doesn't exist
            if (!profile) {
                console.log('📝 Creating default profile');
                profile = new Profile({
                    profileId: 'profile_main',
                    fullName: 'Your Name',
                    email: 'your.email@example.com',
                    title: 'Full Stack Developer'
                });
                await profile.save();
                console.log('✅ Default profile created');
            }
            
            res.status(200).json({
                success: true,
                message: 'Profile fetched successfully',
                data: profile
            });
        } catch (error) {
            console.error('❌ Error fetching profile:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch profile',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Update profile
     * PUT /api/profile
     * ADMIN ONLY - Updates the main profile with validation
     */
    async updateProfile(req, res) {
        try {
            const updateData = req.body;
            
            // Validation: Ensure at least one field is provided
            if (!updateData || Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No update data provided'
                });
            }

            // Sanitize: Remove profileId from update (prevent modification)
            delete updateData.profileId;
            delete updateData._id;
            
            // Log the update attempt
            console.log('🔄 Updating profile with fields:', Object.keys(updateData));
            
            let profile = await Profile.findOneAndUpdate(
                { profileId: 'profile_main' },
                { $set: updateData },
                { 
                    new: true, 
                    upsert: true, 
                    runValidators: true,
                    setDefaultsOnInsert: true
                }
            );
            
            console.log('✅ Profile updated successfully');
            
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: profile
            });
        } catch (error) {
            console.error('❌ Error updating profile:', error.message);
            
            // Handle validation errors
            if (error.name === 'ValidationError') {
                const validationErrors = Object.keys(error.errors).reduce((acc, key) => {
                    acc[key] = error.errors[key].message;
                    return acc;
                }, {});
                
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: validationErrors
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Failed to update profile',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Get profile summary (lightweight version)
     * GET /api/profile/summary
     * Returns only essential profile information
     */
    async getProfileSummary(req, res) {
        try {
            const profile = await Profile.findOne(
                { profileId: 'profile_main' },
                'fullName title email profileImage availableForWork'
            );

            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Profile summary fetched successfully',
                data: profile
            });
        } catch (error) {
            console.error('❌ Error fetching profile summary:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch profile summary',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
}

module.exports = new ProfileController();