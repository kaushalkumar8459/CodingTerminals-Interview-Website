/**
 * Admin API Service
 * Handles MongoDB API calls for YouTube Roadmap Admin
 * Simplified - only includes methods actually used by the admin panel
 */

const adminAPI = {
    baseURL: APP_CONFIG.API.BASE_URL,
    videosEndpoint: '/api/videos',

    /**
     * Health check - verify API is accessible
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/api/health`);
            return response.ok;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    },

    /**
     * Get complete roadmap data from MongoDB
     * Fetches videos from youtubeVideos collection and questions from interviewQuestions collection
     * Separates regular videos (isUpcoming: false) and upcoming videos (isUpcoming: true)
     * Returns merged data ready for frontend
     */
    async getCompleteRoadmap() {
        try {
            console.log('📡 Fetching all videos from MongoDB...');
            const response = await fetch(`${this.baseURL}${this.videosEndpoint}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            const allVideos = result.data || [];
            
            console.log(`✅ Fetched ${allVideos.length} total videos from MongoDB`);
            
            // Separate regular videos and upcoming videos using isUpcoming flag
            const regularVideos = allVideos.filter(v => !v.isUpcoming);
            const upcomingVideos = allVideos.filter(v => v.isUpcoming);
            
            console.log(`📹 Regular videos: ${regularVideos.length}`);
            console.log(`🔔 Upcoming videos: ${upcomingVideos.length}`);
            
            // Fetch interview questions for each video
            const videosWithQuestions = await Promise.all(
                regularVideos.map(async (video) => {
                    const questions = await this._getQuestionsByVideoId(video.videoId);
                    return {
                        _id: video._id,
                        videoId: video.videoId,
                        title: video.title,
                        subtopics: video.subtopics || [],
                        interviewQuestions: questions
                    };
                })
            );
            
            // Fetch questions for all upcoming videos
            const upcomingTopicsData = await Promise.all(
                upcomingVideos.map(async (upcomingVideo) => {
                    const upcomingQuestions = await this._getQuestionsByVideoId(upcomingVideo.videoId);
                    return {
                        _id: upcomingVideo._id,
                        title: upcomingVideo.title,
                        description: upcomingVideo.description || '',
                        subtopics: upcomingVideo.subtopics || [],
                        interviewQuestions: upcomingQuestions,
                        estimatedDate: upcomingVideo.estimatedDate || new Date().toISOString()
                    };
                })
            );
            
            // Convert to roadmap format for frontend
            const roadmapData = {
                channelName: 'Coding Terminals',
                channelLogo: './../../assets/CT logo.jpg',
                videoPlaylist: videosWithQuestions,
                upcomingTopics: upcomingTopicsData, // Changed from upcomingTopic to upcomingTopics array
                // Keep backward compatibility
                upcomingTopic: upcomingTopicsData.length > 0 ? upcomingTopicsData[0] : null
            };
            
            console.log('✅ Roadmap data prepared for caching');
            return roadmapData;
        } catch (error) {
            console.error('❌ Error fetching complete roadmap:', error);
            throw error;
        }
    },

    /**
     * Private helper: Get interview questions for a specific video
     * Fetches from separate interviewQuestions collection
     */
    async _getQuestionsByVideoId(videoId) {
        try {
            const response = await fetch(`${this.baseURL}/api/interview-questions/video/${videoId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    return []; // No questions found - return empty array
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            const questions = result.data || [];
            
            // Format questions for frontend
            return questions.map(q => ({
                _id: q._id,
                question: q.question,
                answer: q.answer || '',
                difficulty: q.difficulty || 'medium'
            }));
        } catch (error) {
            console.error(`❌ Error fetching questions for video ${videoId}:`, error);
            return []; // Return empty array on error
        }
    }
};

// Initialize on load
console.log('✅ Admin API Service initialized');
console.log('📡 API Endpoint: /api/videos (youtubeVideos collection)');
console.log('📡 API Endpoint: /api/interview-questions (interviewQuestions collection)');
console.log('📊 Architecture: MongoDB (2 collections) → Backend (joins data) → IndexedDB (1 document)');
