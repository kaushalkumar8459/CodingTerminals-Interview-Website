/**
 * YouTube Roadmap API Service
 * Uses NEW OPTIMIZED API with MongoDB collections:
 * - youtubeVideos
 * - interviewQuestions
 */

class YouTubeRoadmapAPI {
    constructor() {
        this.baseUrl = APP_CONFIG.API.BASE_URL;
    }

    /**
     * Fetch all videos with optional pagination
     * @param {Object} options - { page, limit, status, sortBy, order, search }
     * @returns {Promise<Object>} { videos, pagination, success }
     */
    async getAllVideos(options = {}) {
        try {
            const queryParams = new URLSearchParams({
                page: options.page || 1,
                limit: options.limit || 100,
                status: options.status || 'all',
                sortBy: options.sortBy || 'day',
                order: options.order || 'asc'
            });

            if (options.search) {
                queryParams.append('search', options.search);
            }

            const response = await fetch(`${this.baseUrl}/api/videos?${queryParams}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch videos');
            }

            const result = await response.json();
            return {
                videos: result.data || [],
                pagination: result.pagination,
                success: true
            };
        } catch (error) {
            console.error('Error fetching videos:', error);
            throw error;
        }
    }

    /**
     * Get video by day number
     * @param {Number} day - Day number
     * @returns {Promise<Object>} Video object
     */
    async getVideoByDay(day) {
        try {
            const response = await fetch(`${this.baseUrl}/api/videos/day/${day}`);
            
            if (!response.ok) {
                throw new Error(`Video for day ${day} not found`);
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error(`Error fetching video for day ${day}:`, error);
            throw error;
        }
    }

    /**
     * Get video by videoId
     * @param {String} videoId - YouTube video ID
     * @returns {Promise<Object>} Video object
     */
    async getVideoById(videoId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/videos/${videoId}`);
            
            if (!response.ok) {
                throw new Error(`Video ${videoId} not found`);
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error(`Error fetching video ${videoId}:`, error);
            throw error;
        }
    }

    /**
     * Get statistics
     * @returns {Promise<Object>} Statistics
     */
    async getStatistics() {
        try {
            const response = await fetch(`${this.baseUrl}/api/videos/stats`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch statistics');
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching statistics:', error);
            return {};
        }
    }

    /**
     * Get upcoming videos
     * @returns {Promise<Array>} Array of upcoming videos
     */
    async getUpcomingVideos() {
        try {
            const response = await fetch(`${this.baseUrl}/api/videos/upcoming`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch upcoming videos');
            }

            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching upcoming videos:', error);
            return [];
        }
    }

    /**
     * Search questions across all videos
     * @param {String} query - Search query
     * @param {String} difficulty - Question difficulty (easy/medium/hard)
     * @returns {Promise<Array>} Array of questions
     */
    async searchQuestions(query, difficulty = null) {
        try {
            const queryParams = new URLSearchParams({ q: query });
            if (difficulty) {
                queryParams.append('difficulty', difficulty);
            }

            const response = await fetch(`${this.baseUrl}/api/questions/search?${queryParams}`);
            
            if (!response.ok) {
                throw new Error('Failed to search questions');
            }

            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error searching questions:', error);
            return [];
        }
    }

    /**
     * Get questions for a specific video
     * @param {String} videoId - YouTube video ID
     * @returns {Promise<Array>} Array of questions
     */
    async getQuestionsByVideo(videoId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/videos/${videoId}/questions`);
            
            if (!response.ok) {
                throw new Error(`Questions for video ${videoId} not found`);
            }

            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error(`Error fetching questions for video ${videoId}:`, error);
            return [];
        }
    }
}

// Create global instance
const youtubeAPI = new YouTubeRoadmapAPI();
