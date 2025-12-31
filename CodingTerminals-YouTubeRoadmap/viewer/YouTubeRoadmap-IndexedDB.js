/**
 * 🎯 IndexedDB Service for YouTube Roadmap Viewer
 * Implements Offline-First Architecture
 * 
 * Flow:
 * 1. Check IndexedDB first
 * 2. If data exists → render UI instantly
 * 3. Call MongoDB API in background
 * 4. Update IndexedDB
 * 5. Refresh UI silently
 */

class YouTubeRoadmapIndexedDB {
    constructor() {
        this.dbName = 'CodingTerminals_YouTubeRoadmap';
        this.dbVersion = 1;
        this.db = null;
        
        // Store names
        this.stores = {
            videos: 'videos',
            questions: 'questions',
            metadata: 'metadata'
        };
    }

    /**
     * Initialize IndexedDB
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('❌ IndexedDB failed to open:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create videos store
                if (!db.objectStoreNames.contains(this.stores.videos)) {
                    const videosStore = db.createObjectStore(this.stores.videos, { keyPath: 'videoId' });
                    videosStore.createIndex('day', 'day', { unique: false });
                    videosStore.createIndex('status', 'status', { unique: false });
                    videosStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                }

                // Create questions store
                if (!db.objectStoreNames.contains(this.stores.questions)) {
                    const questionsStore = db.createObjectStore(this.stores.questions, { keyPath: 'id', autoIncrement: true });
                    questionsStore.createIndex('videoId', 'videoId', { unique: false });
                    questionsStore.createIndex('difficulty', 'difficulty', { unique: false });
                }

                // Create metadata store (for sync info)
                if (!db.objectStoreNames.contains(this.stores.metadata)) {
                    db.createObjectStore(this.stores.metadata, { keyPath: 'key' });
                }

                console.log('✅ IndexedDB schema created/upgraded');
            };
        });
    }

    /**
     * 🎯 FETCH FLOW: IndexedDB → MongoDB → Update IndexedDB
     */
    async getAllVideos() {
        try {
            // Step 1: Check IndexedDB first
            console.log('📦 Step 1: Checking IndexedDB...');
            const cachedVideos = await this.getVideosFromIndexedDB();
            
            if (cachedVideos && cachedVideos.length > 0) {
                console.log(`✅ Found ${cachedVideos.length} videos in IndexedDB (rendering instantly)`);
                
                // Step 2: Fetch from MongoDB in background
                this.syncWithMongoDB().then(() => {
                    console.log('🔄 Background sync completed');
                }).catch(err => {
                    console.error('⚠️ Background sync failed:', err);
                });
                
                return cachedVideos;
            }

            // Step 3: No cached data, fetch from MongoDB
            console.log('📥 No cache found, fetching from MongoDB...');
            const videos = await this.fetchFromMongoDB();
            
            // Step 4: Save to IndexedDB
            if (videos && videos.length > 0) {
                await this.saveVideosToIndexedDB(videos);
                console.log('💾 Saved to IndexedDB');
            }
            
            return videos;

        } catch (error) {
            console.error('❌ Error in getAllVideos:', error);
            
            // Fallback: Try IndexedDB even if it failed initially
            const fallbackVideos = await this.getVideosFromIndexedDB();
            if (fallbackVideos && fallbackVideos.length > 0) {
                console.log('✅ Using fallback cache');
                return fallbackVideos;
            }
            
            throw error;
        }
    }

    /**
     * Get videos from IndexedDB
     */
    async getVideosFromIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('IndexedDB not initialized'));
                return;
            }

            const transaction = this.db.transaction([this.stores.videos], 'readonly');
            const store = transaction.objectStore(this.stores.videos);
            const request = store.getAll();

            request.onsuccess = () => {
                const videos = request.result || [];
                // Sort by day
                videos.sort((a, b) => (a.day || 0) - (b.day || 0));
                resolve(videos);
            };

            request.onerror = () => {
                console.error('Error reading from IndexedDB:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Fetch from MongoDB API
     */
    async fetchFromMongoDB() {
        try {
            const result = await youtubeAPI.getAllVideos({
                limit: 100,
                status: 'all',
                sortBy: 'day',
                order: 'asc'
            });

            if (result.success && result.videos) {
                // Transform to match our structure
                const videos = result.videos.map(video => ({
                    videoId: video.videoId,
                    day: video.day,
                    title: video.title,
                    videoUrl: video.videoUrl || `https://www.youtube.com/watch?v=${video.videoId}`,
                    description: video.description || '',
                    thumbnail: video.thumbnail || '',
                    subtopics: video.subtopics || [],
                    status: video.status,
                    isUpcoming: video.isUpcoming || video.status === 'upcoming',
                    updatedAt: new Date().toISOString(),
                    syncedAt: new Date().toISOString()
                }));

                return videos;
            }

            return [];
        } catch (error) {
            console.error('Error fetching from MongoDB:', error);
            throw error;
        }
    }

    /**
     * Save videos to IndexedDB
     */
    async saveVideosToIndexedDB(videos) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('IndexedDB not initialized'));
                return;
            }

            const transaction = this.db.transaction([this.stores.videos, this.stores.metadata], 'readwrite');
            const videosStore = transaction.objectStore(this.stores.videos);
            const metadataStore = transaction.objectStore(this.stores.metadata);

            // Clear existing videos
            videosStore.clear();

            // Add all videos
            videos.forEach(video => {
                videosStore.put(video);
            });

            // Update last sync timestamp
            metadataStore.put({
                key: 'lastSync',
                timestamp: new Date().toISOString(),
                count: videos.length
            });

            transaction.oncomplete = () => {
                console.log('✅ Videos saved to IndexedDB');
                resolve();
            };

            transaction.onerror = () => {
                console.error('Error saving to IndexedDB:', transaction.error);
                reject(transaction.error);
            };
        });
    }

    /**
     * Sync with MongoDB (background update)
     */
    async syncWithMongoDB() {
        try {
            const videos = await this.fetchFromMongoDB();
            
            if (videos && videos.length > 0) {
                await this.saveVideosToIndexedDB(videos);
                console.log('✅ IndexedDB updated from MongoDB');
                return { success: true, count: videos.length };
            }
            
            return { success: false, message: 'No videos to sync' };
        } catch (error) {
            console.error('❌ Sync failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get questions for a specific video
     */
    async getQuestionsByVideoId(videoId) {
        try {
            // Check IndexedDB first
            const cachedQuestions = await this.getQuestionsFromIndexedDB(videoId);
            
            if (cachedQuestions && cachedQuestions.length > 0) {
                console.log(`✅ Found ${cachedQuestions.length} questions in cache for ${videoId}`);
                return cachedQuestions;
            }

            // Fetch from MongoDB
            console.log(`📥 Fetching questions for ${videoId} from MongoDB...`);
            const result = await youtubeAPI.getQuestionsByVideo(videoId);
            
            if (result.success && result.questions) {
                const questions = result.questions.map(q => ({
                    videoId: videoId,
                    question: q.question,
                    answer: q.answer,
                    difficulty: q.difficulty,
                    updatedAt: new Date().toISOString()
                }));

                // Save to IndexedDB
                await this.saveQuestionsToIndexedDB(questions);
                
                return questions;
            }

            return [];
        } catch (error) {
            console.error(`Error getting questions for ${videoId}:`, error);
            return [];
        }
    }

    /**
     * Get questions from IndexedDB
     */
    async getQuestionsFromIndexedDB(videoId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('IndexedDB not initialized'));
                return;
            }

            const transaction = this.db.transaction([this.stores.questions], 'readonly');
            const store = transaction.objectStore(this.stores.questions);
            const index = store.index('videoId');
            const request = index.getAll(videoId);

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                console.error('Error reading questions from IndexedDB:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Save questions to IndexedDB
     */
    async saveQuestionsToIndexedDB(questions) {
        return new Promise((resolve, reject) => {
            if (!this.db || !questions || questions.length === 0) {
                resolve();
                return;
            }

            const transaction = this.db.transaction([this.stores.questions], 'readwrite');
            const store = transaction.objectStore(this.stores.questions);

            questions.forEach(question => {
                store.put(question);
            });

            transaction.oncomplete = () => {
                console.log(`✅ ${questions.length} questions saved to IndexedDB`);
                resolve();
            };

            transaction.onerror = () => {
                console.error('Error saving questions:', transaction.error);
                reject(transaction.error);
            };
        });
    }

    /**
     * Get last sync info
     */
    async getLastSyncInfo() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('IndexedDB not initialized'));
                return;
            }

            const transaction = this.db.transaction([this.stores.metadata], 'readonly');
            const store = transaction.objectStore(this.stores.metadata);
            const request = store.get('lastSync');

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Clear all cached data
     */
    async clearCache() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('IndexedDB not initialized'));
                return;
            }

            const transaction = this.db.transaction([this.stores.videos, this.stores.questions, this.stores.metadata], 'readwrite');
            
            transaction.objectStore(this.stores.videos).clear();
            transaction.objectStore(this.stores.questions).clear();
            transaction.objectStore(this.stores.metadata).clear();

            transaction.oncomplete = () => {
                console.log('✅ Cache cleared');
                resolve();
            };

            transaction.onerror = () => {
                console.error('Error clearing cache:', transaction.error);
                reject(transaction.error);
            };
        });
    }
}

// Create global instance
const youtubeRoadmapDB = new YouTubeRoadmapIndexedDB();
