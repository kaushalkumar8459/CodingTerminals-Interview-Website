const mongoose = require('mongoose');
const { YouTubeVideo, InterviewQuestion } = require('../models');

/**
 * YouTube Video Controller (New Optimized Version)
 * Uses separate collections for videos and questions
 * Scalable architecture for 10,000+ videos
 */

class YouTubeVideoController {
    
    /**
     * Get all videos with pagination
     * GET /api/videos?page=1&limit=10&status=published&sortBy=day&order=asc
     */
    async getAllVideos(req, res) {
        try {
            const { 
                page = 1, 
                limit = 50, 
                status = 'published',
                sortBy = 'day',
                order = 'asc',
                search = ''
            } = req.query;

            const query = {};
            
            // Filter by status
            if (status && status !== 'all') {
                query.status = status;
            }

            // Search in title
            if (search) {
                query.$text = { $search: search };
            }

            // Calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const sortOrder = order === 'desc' ? -1 : 1;

            // Execute query
            const videos = await YouTubeVideo.find(query)
                .sort({ [sortBy]: sortOrder })
                .limit(parseInt(limit))
                .skip(skip)
                .lean();

            const total = await YouTubeVideo.countDocuments(query);

            res.json({
                success: true,
                data: videos,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            });
        } catch (error) {
            console.error('❌ Error fetching videos:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get single video by videoId
     * GET /api/videos/:videoId
     */
    async getVideoById(req, res) {
        try {
            const { videoId } = req.params;

            const video = await YouTubeVideo.findOne({ videoId }).lean();

            if (!video) {
                return res.status(404).json({
                    success: false,
                    error: 'Video not found'
                });
            }

            res.json({
                success: true,
                data: video
            });
        } catch (error) {
            console.error('❌ Error fetching video:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get video by day number
     * GET /api/videos/day/:day
     */
    async getVideoByDay(req, res) {
        try {
            const { day } = req.params;

            const video = await YouTubeVideo.findOne({ day: parseInt(day) }).lean();

            if (!video) {
                return res.status(404).json({
                    success: false,
                    error: `Video for day ${day} not found`
                });
            }

            res.json({
                success: true,
                data: video
            });
        } catch (error) {
            console.error('❌ Error fetching video by day:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Create new video
     * POST /api/videos
     */
    async createVideo(req, res) {
        try {
            const videoData = req.body;

            // Check if video already exists
            const existing = await YouTubeVideo.findOne({ videoId: videoData.videoId });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    error: 'Video with this ID already exists'
                });
            }

            const video = await YouTubeVideo.create(videoData);

            console.log(`✅ Video created: ${video.title} (Day ${video.day})`);

            res.status(201).json({
                success: true,
                message: 'Video created successfully',
                data: video
            });
        } catch (error) {
            console.error('❌ Error creating video:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Update video
     * PUT /api/videos/:videoId
     */
    async updateVideo(req, res) {
        try {
            const { videoId } = req.params;
            const updateData = req.body;

            const video = await YouTubeVideo.findOneAndUpdate(
                { videoId },
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!video) {
                return res.status(404).json({
                    success: false,
                    error: 'Video not found'
                });
            }

            console.log(`✅ Video updated: ${video.title}`);

            res.json({
                success: true,
                message: 'Video updated successfully',
                data: video
            });
        } catch (error) {
            console.error('❌ Error updating video:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Delete video
     * DELETE /api/videos/:videoId
     */
    async deleteVideo(req, res) {
        try {
            const { videoId } = req.params;

            const video = await YouTubeVideo.findOneAndDelete({ videoId });

            if (!video) {
                return res.status(404).json({
                    success: false,
                    error: 'Video not found'
                });
            }

            // Also delete all questions for this video
            await InterviewQuestion.deleteMany({ videoId });

            console.log(`🗑️ Video deleted: ${video.title} (and its questions)`);

            res.json({
                success: true,
                message: 'Video and associated questions deleted successfully'
            });
        } catch (error) {
            console.error('❌ Error deleting video:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get upcoming videos
     * GET /api/videos/upcoming
     */
    async getUpcomingVideos(req, res) {
        try {
            const videos = await YouTubeVideo.find({ 
                status: 'upcoming',
                isUpcoming: true 
            })
            .sort({ estimatedDate: 1 })
            .lean();

            res.json({
                success: true,
                data: videos,
                count: videos.length
            });
        } catch (error) {
            console.error('❌ Error fetching upcoming videos:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get video statistics
     * GET /api/videos/stats
     */
    async getStatistics(req, res) {
        try {
            const stats = await YouTubeVideo.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const totalVideos = await YouTubeVideo.countDocuments();
            const totalQuestions = await InterviewQuestion.countDocuments();

            const statusCount = {};
            stats.forEach(stat => {
                statusCount[stat._id] = stat.count;
            });

            res.json({
                success: true,
                data: {
                    totalVideos,
                    totalQuestions,
                    byStatus: statusCount
                }
            });
        } catch (error) {
            console.error('❌ Error fetching statistics:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Bulk update videos
     * POST /api/videos/bulk-update
     */
    async bulkUpdate(req, res) {
        try {
            const { updates } = req.body; // Array of { videoId, data }

            if (!Array.isArray(updates)) {
                return res.status(400).json({
                    success: false,
                    error: 'Updates must be an array'
                });
            }

            const results = [];

            for (const update of updates) {
                try {
                    const video = await YouTubeVideo.findOneAndUpdate(
                        { videoId: update.videoId },
                        { $set: update.data },
                        { new: true }
                    );
                    results.push({ videoId: update.videoId, success: true, video });
                } catch (error) {
                    results.push({ videoId: update.videoId, success: false, error: error.message });
                }
            }

            res.json({
                success: true,
                message: 'Bulk update completed',
                results
            });
        } catch (error) {
            console.error('❌ Error in bulk update:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new YouTubeVideoController();
