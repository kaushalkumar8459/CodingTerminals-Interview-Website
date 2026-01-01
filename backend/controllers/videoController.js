const Video = require('../models/Video');
const InterviewQuestion = require('../models/InterviewQuestion');

/**
 * Video Controller
 * Works with TWO collections: youtubeVideos + interviewQuestions
 */

// @desc    Get all videos with their interview questions
// @route   GET /api/videos
// @access  Public
exports.getAllVideos = async (req, res) => {
    try {
        // Fetch all videos including upcoming ones
        const videos = await Video.find()
            .sort({ isUpcoming: 1, day: 1 }) // Published videos first, then upcoming
            .select('-__v');
        
        // Fetch interview questions for all videos
        const videosWithQuestions = await Promise.all(
            videos.map(async (video) => {
                const questions = await InterviewQuestion.find({ videoId: video.videoId })
                    .sort({ orderIndex: 1 })
                    .select('-__v');
                
                return {
                    ...video.toObject(),
                    interviewQuestions: questions
                };
            })
        );
        
        res.status(200).json({
            success: true,
            count: videosWithQuestions.length,
            data: videosWithQuestions
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while fetching videos'
        });
    }
};

// @desc    Get only upcoming videos
// @route   GET /api/videos/upcoming
// @access  Public
exports.getUpcomingVideos = async (req, res) => {
    try {
        const upcomingVideos = await Video.find({ isUpcoming: true })
            .sort({ day: 1 })
            .select('-__v');
        
        // Fetch interview questions for upcoming videos
        const videosWithQuestions = await Promise.all(
            upcomingVideos.map(async (video) => {
                const questions = await InterviewQuestion.find({ videoId: video.videoId })
                    .sort({ orderIndex: 1 })
                    .select('-__v');
                
                return {
                    ...video.toObject(),
                    interviewQuestions: questions
                };
            })
        );
        
        res.status(200).json({
            success: true,
            count: videosWithQuestions.length,
            data: videosWithQuestions
        });
    } catch (error) {
        console.error('Error fetching upcoming videos:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while fetching upcoming videos'
        });
    }
};

// @desc    Get single video by ID with questions
// @route   GET /api/videos/:id
// @access  Public
exports.getVideoById = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        
        if (!video) {
            return res.status(404).json({
                success: false,
                error: 'Video not found'
            });
        }
        
        // Fetch interview questions
        const questions = await InterviewQuestion.find({ videoId: video.videoId })
            .sort({ orderIndex: 1 })
            .select('-__v');
        
        res.status(200).json({
            success: true,
            data: {
                ...video.toObject(),
                interviewQuestions: questions
            }
        });
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while fetching video'
        });
    }
};

// @desc    Get video by YouTube video ID
// @route   GET /api/videos/youtube/:videoId
// @access  Public
exports.getVideoByYouTubeId = async (req, res) => {
    try {
        const video = await Video.findOne({ videoId: req.params.videoId });
        
        if (!video) {
            return res.status(404).json({
                success: false,
                error: 'Video not found'
            });
        }
        
        // Fetch interview questions
        const questions = await InterviewQuestion.find({ videoId: video.videoId })
            .sort({ orderIndex: 1 })
            .select('-__v');
        
        res.status(200).json({
            success: true,
            data: {
                ...video.toObject(),
                interviewQuestions: questions
            }
        });
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while fetching video'
        });
    }
};

// @desc    Create new video
// @route   POST /api/videos
// @access  Private (Admin)
exports.createVideo = async (req, res) => {
    try {
        const { videoId, title, day, subtopics, interviewQuestions, category, status, videoUrl, thumbnail, description, date } = req.body;
        
        // Check if video already exists
        const existingVideo = await Video.findOne({ videoId });
        if (existingVideo) {
            return res.status(400).json({
                success: false,
                error: 'Video with this videoId already exists'
            });
        }
        
        // Create video
        const video = await Video.create({
            videoId,
            title,
            day,
            subtopics: subtopics || [],
            category: category || 'Angular',
            status: status || 'published',
            videoUrl,
            thumbnail,
            description,
            date
        });
        
        // Create interview questions if provided
        let createdQuestions = [];
        if (interviewQuestions && interviewQuestions.length > 0) {
            const questionsData = interviewQuestions.map((q, index) => ({
                videoId: video.videoId,
                question: q.question,
                answer: q.answer || '',
                difficulty: q.difficulty || '',
                orderIndex: q.orderIndex !== undefined ? q.orderIndex : index
            }));
            
            createdQuestions = await InterviewQuestion.insertMany(questionsData);
        }
        
        res.status(201).json({
            success: true,
            data: {
                ...video.toObject(),
                interviewQuestions: createdQuestions
            }
        });
    } catch (error) {
        console.error('Error creating video:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while creating video'
        });
    }
};

// @desc    Update video
// @route   PUT /api/videos/:id
// @access  Private (Admin)
exports.updateVideo = async (req, res) => {
    try {
        const { subtopics, interviewQuestions, title, category, status } = req.body;
        
        const video = await Video.findById(req.params.id);
        
        if (!video) {
            return res.status(404).json({
                success: false,
                error: 'Video not found'
            });
        }
        
        // Update video fields
        if (title !== undefined) video.title = title;
        if (subtopics !== undefined) video.subtopics = subtopics;
        if (category !== undefined) video.category = category;
        if (status !== undefined) video.status = status;
        
        await video.save();
        
        // Update interview questions if provided
        if (interviewQuestions !== undefined) {
            // Delete existing questions for this video
            await InterviewQuestion.deleteMany({ videoId: video.videoId });
            
            // Create new questions
            if (interviewQuestions.length > 0) {
                const questionsData = interviewQuestions.map((q, index) => ({
                    videoId: video.videoId,
                    question: q.question,
                    answer: q.answer || '',
                    difficulty: q.difficulty || '',
                    orderIndex: q.orderIndex !== undefined ? q.orderIndex : index
                }));
                
                await InterviewQuestion.insertMany(questionsData);
            }
        }
        
        // Fetch updated questions
        const updatedQuestions = await InterviewQuestion.find({ videoId: video.videoId })
            .sort({ orderIndex: 1 });
        
        res.status(200).json({
            success: true,
            data: {
                ...video.toObject(),
                interviewQuestions: updatedQuestions
            }
        });
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while updating video'
        });
    }
};

// @desc    Delete video and its questions
// @route   DELETE /api/videos/:id
// @access  Private (Admin)
exports.deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        
        if (!video) {
            return res.status(404).json({
                success: false,
                error: 'Video not found'
            });
        }
        
        // Delete associated interview questions
        await InterviewQuestion.deleteMany({ videoId: video.videoId });
        
        // Delete video
        await video.deleteOne();
        
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while deleting video'
        });
    }
};

// @desc    Bulk create/update videos (for syncing from YouTube)
// @route   POST /api/videos/bulk
// @access  Private (Admin)
exports.bulkUpsertVideos = async (req, res) => {
    try {
        const { videos } = req.body;
        
        if (!Array.isArray(videos)) {
            return res.status(400).json({
                success: false,
                error: 'Videos must be an array'
            });
        }
        
        const results = await Promise.all(
            videos.map(async (videoData) => {
                const { videoId, interviewQuestions, ...updateData } = videoData;
                
                // Upsert video
                const video = await Video.findOneAndUpdate(
                    { videoId },
                    { 
                        ...updateData,
                        videoId
                    },
                    { 
                        upsert: true, 
                        new: true,
                        setDefaultsOnInsert: true
                    }
                );
                
                // Update interview questions if provided
                if (interviewQuestions && interviewQuestions.length > 0) {
                    // Delete existing questions
                    await InterviewQuestion.deleteMany({ videoId });
                    
                    // Insert new questions
                    const questionsData = interviewQuestions.map((q, index) => ({
                        videoId,
                        question: q.question,
                        answer: q.answer || '',
                        difficulty: q.difficulty || '',
                        orderIndex: q.orderIndex !== undefined ? q.orderIndex : index
                    }));
                    
                    await InterviewQuestion.insertMany(questionsData);
                }
                
                // Fetch updated questions
                const questions = await InterviewQuestion.find({ videoId })
                    .sort({ orderIndex: 1 });
                
                return {
                    ...video.toObject(),
                    interviewQuestions: questions
                };
            })
        );
        
        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error('Error bulk upserting videos:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while bulk upserting videos'
        });
    }
};

// @desc    Save complete YouTube roadmap (for admin panel compatibility)
// @route   POST /api/youtube-roadmap
// @access  Private (Admin)
exports.saveYouTubeRoadmap = async (req, res) => {
    try {
        const { videoPlaylist, upcomingTopic, channelName, channelLogo } = req.body;
        
        if (!Array.isArray(videoPlaylist)) {
            return res.status(400).json({
                success: false,
                error: 'videoPlaylist must be an array'
            });
        }
        
        console.log(`📝 Saving ${videoPlaylist.length} videos to database...`);
        
        // Save each video
        const results = await Promise.all(
            videoPlaylist.map(async (videoData, index) => {
                const { videoId, interviewQuestions, _id, ...updateData } = videoData;
                
                if (!videoId) {
                    console.warn(`⚠️ Skipping video at index ${index}: missing videoId`);
                    return null;
                }
                
                // Upsert video - mark as published
                const video = await Video.findOneAndUpdate(
                    { videoId },
                    { 
                        ...updateData,
                        videoId,
                        day: index + 1,
                        isUpcoming: false
                    },
                    { 
                        upsert: true, 
                        new: true,
                        setDefaultsOnInsert: true
                    }
                );
                
                // Update interview questions if provided
                if (interviewQuestions && interviewQuestions.length > 0) {
                    await InterviewQuestion.deleteMany({ videoId });
                    
                    const validQuestions = interviewQuestions.filter(q => {
                        const question = typeof q === 'object' ? q.question : q;
                        return question && question.trim() !== '';
                    });
                    
                    if (validQuestions.length > 0) {
                        const questionsData = validQuestions.map((q, qIndex) => ({
                            videoId,
                            question: typeof q === 'object' ? q.question : q,
                            answer: typeof q === 'object' ? (q.answer || '') : '',
                            difficulty: typeof q === 'object' ? (q.difficulty || '') : '',
                            orderIndex: qIndex
                        }));
                        
                        await InterviewQuestion.insertMany(questionsData);
                    }
                }
                
                return video;
            })
        );
        
        const savedCount = results.filter(r => r !== null).length;
        console.log(`✅ Successfully saved ${savedCount} videos`);
        
        // ==================== SAVE SINGLE UPCOMING TOPIC ====================
        console.log('🗑️ Clearing existing upcoming videos...');
        await Video.deleteMany({ isUpcoming: true });
        await InterviewQuestion.deleteMany({ videoId: { $regex: '^upcoming-' } });
        
        let upcomingCount = 0;
        if (upcomingTopic && upcomingTopic.title && upcomingTopic.title.trim() !== '') {
            console.log(`💾 Saving upcoming topic: ${upcomingTopic.title}`);
            
            const upcomingVideoId = 'upcoming-1';
            
            // Upsert upcoming topic
            await Video.findOneAndUpdate(
                { videoId: upcomingVideoId },
                {
                    videoId: upcomingVideoId,
                    title: upcomingTopic.title,
                    description: upcomingTopic.description || '',
                    subtopics: upcomingTopic.subtopics || [],
                    estimatedDate: upcomingTopic.estimatedDate || new Date().toISOString().split('T')[0],
                    isUpcoming: true,
                    status: 'upcoming',
                    day: 1
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            );
            
            // Save upcoming topic interview questions
            if (upcomingTopic.interviewQuestions && upcomingTopic.interviewQuestions.length > 0) {
                const validQuestions = upcomingTopic.interviewQuestions.filter(q => {
                    const question = typeof q === 'object' ? q.question : q;
                    return question && question.trim() !== '';
                });
                
                if (validQuestions.length > 0) {
                    const questionsData = validQuestions.map((q, qIndex) => ({
                        videoId: upcomingVideoId,
                        question: typeof q === 'object' ? q.question : q,
                        answer: typeof q === 'object' ? (q.answer || '') : '',
                        difficulty: typeof q === 'object' ? (q.difficulty || '') : '',
                        orderIndex: qIndex
                    }));
                    
                    await InterviewQuestion.insertMany(questionsData);
                }
            }
            
            upcomingCount = 1;
            console.log(`✅ Successfully saved upcoming topic`);
        } else {
            console.log('ℹ️ No upcoming topic to save');
        }
        
        res.status(200).json({
            success: true,
            message: `Successfully saved ${savedCount} videos${upcomingCount ? ' and 1 upcoming topic' : ''}`,
            count: savedCount,
            upcomingCount: upcomingCount
        });
    } catch (error) {
        console.error('❌ Error saving YouTube roadmap:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while saving roadmap: ' + error.message
        });
    }
};
