/**
 * Admin API Service
 * Handles all API communication for the admin panel
 * Uses NEW OPTIMIZED API with MongoDB collections:
 * - youtubeVideos
 * - interviewQuestions
 */

class AdminAPIService {
    constructor() {
        this.baseURL = APP_CONFIG.API.BASE_URL;
    }

    /**
     * Generic fetch wrapper with error handling
     */
    async fetch(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // ==================== VIDEO OPERATIONS ====================

    /**
     * Get all videos from database
     * @param {Object} options - Query options (limit, sortBy, order)
     * @returns {Promise<Array>} Array of videos
     */
    async getAllVideos(options = {}) {
        const params = new URLSearchParams({
            limit: options.limit || 100,
            status: 'all',
            sortBy: options.sortBy || 'day',
            order: options.order || 'asc'
        });

        const result = await this.fetch(`${this.baseURL}/api/videos?${params}`);
        return result.data || result.videos || [];
    }

    /**
     * Get single video by ID
     * @param {String} videoId - Video ID
     * @returns {Promise<Object>} Video object
     */
    async getVideoById(videoId) {
        const result = await this.fetch(`${this.baseURL}/api/videos/${videoId}`);
        return result.data || result.video;
    }

    /**
     * Get video by day number
     * @param {Number} day - Day number
     * @returns {Promise<Object>} Video object
     */
    async getVideoByDay(day) {
        const result = await this.fetch(`${this.baseURL}/api/videos/day/${day}`);
        return result.data;
    }

    /**
     * Create new video
     * @param {Object} videoData - Video data
     * @returns {Promise<Object>} Created video
     */
    async createVideo(videoData) {
        const result = await this.fetch(`${this.baseURL}/api/videos`, {
            method: 'POST',
            body: JSON.stringify(videoData)
        });
        return result.data || result.video;
    }

    /**
     * Update existing video
     * @param {String} videoId - Video ID
     * @param {Object} updates - Updated fields
     * @returns {Promise<Object>} Updated video
     */
    async updateVideo(videoId, updates) {
        const result = await this.fetch(`${this.baseURL}/api/videos/${videoId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        return result.data || result.video;
    }

    /**
     * Create or update video (upsert by videoId)
     * @param {Object} videoData - Video data with videoId
     * @returns {Promise<Object>} Created or updated video
     */
    async createOrUpdateVideo(videoData) {
        // Try to find existing video by videoId first
        const existingVideos = await this.getAllVideos();
        const existing = existingVideos.find(v => v.videoId === videoData.videoId);
        
        if (existing && existing._id) {
            // Update existing video
            return await this.updateVideo(existing._id, videoData);
        } else {
            // Create new video
            return await this.createVideo(videoData);
        }
    }

    /**
     * Delete video
     * @param {String} videoId - Video ID
     * @returns {Promise<Boolean>} Success status
     */
    async deleteVideo(videoId) {
        await this.fetch(`${this.baseURL}/api/videos/${videoId}`, {
            method: 'DELETE'
        });
        return true;
    }

    /**
     * Bulk update multiple videos
     * @param {Array} videos - Array of video updates
     * @returns {Promise<Object>} Bulk update result
     */
    async bulkUpdateVideos(videos) {
        const result = await this.fetch(`${this.baseURL}/api/videos/bulk`, {
            method: 'PUT',
            body: JSON.stringify({ videos })
        });
        return result;
    }

    // ==================== QUESTION OPERATIONS ====================

    /**
     * Get questions for a video
     * @param {String} videoId - Video ID
     * @returns {Promise<Array>} Array of questions
     */
    async getQuestionsByVideo(videoId) {
        const result = await this.fetch(`${this.baseURL}/api/videos/${videoId}/questions`);
        return result.data || result.questions || [];
    }

    /**
     * Add question to video
     * @param {String} videoId - Video ID
     * @param {Object} questionData - Question data
     * @returns {Promise<Object>} Created question
     */
    async addQuestion(videoId, questionData) {
        const result = await this.fetch(`${this.baseURL}/api/videos/${videoId}/questions`, {
            method: 'POST',
            body: JSON.stringify(questionData)
        });
        return result.data || result.question;
    }

    /**
     * Update question
     * @param {String} videoId - Video ID
     * @param {String} questionId - Question ID
     * @param {Object} updates - Updated fields
     * @returns {Promise<Object>} Updated question
     */
    async updateQuestion(videoId, questionId, updates) {
        const result = await this.fetch(`${this.baseURL}/api/videos/${videoId}/questions/${questionId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        return result.data || result.question;
    }

    /**
     * Delete question
     * @param {String} videoId - Video ID
     * @param {String} questionId - Question ID
     * @returns {Promise<Boolean>} Success status
     */
    async deleteQuestion(videoId, questionId) {
        await this.fetch(`${this.baseURL}/api/videos/${videoId}/questions/${questionId}`, {
            method: 'DELETE'
        });
        return true;
    }

    /**
     * Bulk add questions to video
     * @param {String} videoId - Video ID
     * @param {Array} questions - Array of questions
     * @returns {Promise<Object>} Bulk add result
     */
    async bulkAddQuestions(videoId, questions) {
        const result = await this.fetch(`${this.baseURL}/api/videos/${videoId}/questions/bulk`, {
            method: 'POST',
            body: JSON.stringify({ questions })
        });
        return result;
    }

    // ==================== SEARCH OPERATIONS ====================

    /**
     * Search questions across all videos
     * @param {String} query - Search query
     * @param {String} difficulty - Question difficulty filter
     * @returns {Promise<Array>} Array of questions
     */
    async searchQuestions(query, difficulty = null) {
        const params = new URLSearchParams({ q: query });
        if (difficulty) {
            params.append('difficulty', difficulty);
        }

        const result = await this.fetch(`${this.baseURL}/api/questions/search?${params}`);
        return result.data || [];
    }

    // ==================== STATISTICS OPERATIONS ====================

    /**
     * Get roadmap statistics
     * @returns {Promise<Object>} Statistics
     */
    async getStatistics() {
        const result = await this.fetch(`${this.baseURL}/api/videos/stats`);
        return result.data || {};
    }

    /**
     * Get upcoming videos
     * @returns {Promise<Array>} Array of upcoming videos
     */
    async getUpcomingVideos() {
        const result = await this.fetch(`${this.baseURL}/api/videos/upcoming`);
        return result.data || [];
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Sync with YouTube API
     * @param {String} playlistId - YouTube playlist ID
     * @returns {Promise<Object>} Sync result
     */
    async syncWithYouTube(playlistId) {
        const result = await this.fetch(`${this.baseURL}/api/sync/youtube/${playlistId}`, {
            method: 'POST'
        });
        return result;
    }

    /**
     * Health check
     * @returns {Promise<Boolean>} API health status
     */
    async healthCheck() {
        try {
            await this.fetch(`${this.baseURL}/api/health`);
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Create global instance
const adminAPI = new AdminAPIService();

// Log initialization
console.log('✅ Admin API Service initialized');
console.log('📡 Using NEW optimized MongoDB API (youtubeVideos & interviewQuestions)');
