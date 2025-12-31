// ==================== INDEXEDDB SERVICE FOR YOUTUBE ROADMAP ====================
// This service implements offline-first architecture:
// 1. FETCH FLOW: IndexedDB → UI → MongoDB (background) → Update IndexedDB → Refresh UI
// 2. SAVE FLOW (for admin): UI → IndexedDB → MongoDB → Sync Status

class YouTubeIndexedDBService {
    constructor() {
        this.dbName = 'CodingTerminalsYouTubeDB';
        this.dbVersion = 3; // Increment version for new sync fields
        this.db = null;
        this.stores = {
            videos: 'videos',
            questions: 'questions',
            metadata: 'metadata'
        };
    }

    // ==================== INITIALIZE DATABASE ====================
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('❌ IndexedDB initialization failed:', request.error);
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
                    const videoStore = db.createObjectStore(this.stores.videos, { keyPath: 'videoId' });
                    videoStore.createIndex('day', 'day', { unique: false });
                    videoStore.createIndex('status', 'status', { unique: false });
                    videoStore.createIndex('syncStatus', 'syncStatus', { unique: false });
                    console.log('📦 Created videos object store');
                } else if (event.oldVersion < 3) {
                    // Add syncStatus index if upgrading from older version
                    const transaction = event.target.transaction;
                    const videoStore = transaction.objectStore(this.stores.videos);
                    if (!videoStore.indexNames.contains('syncStatus')) {
                        videoStore.createIndex('syncStatus', 'syncStatus', { unique: false });
                    }
                }

                // Create questions store
                if (!db.objectStoreNames.contains(this.stores.questions)) {
                    const questionStore = db.createObjectStore(this.stores.questions, { keyPath: 'id', autoIncrement: true });
                    questionStore.createIndex('videoId', 'videoId', { unique: false });
                    questionStore.createIndex('syncStatus', 'syncStatus', { unique: false });
                    console.log('📦 Created questions object store');
                } else if (event.oldVersion < 3) {
                    const transaction = event.target.transaction;
                    const questionStore = transaction.objectStore(this.stores.questions);
                    if (!questionStore.indexNames.contains('syncStatus')) {
                        questionStore.createIndex('syncStatus', 'syncStatus', { unique: false });
                    }
                }

                // Create metadata store (for sync tracking)
                if (!db.objectStoreNames.contains(this.stores.metadata)) {
                    db.createObjectStore(this.stores.metadata, { keyPath: 'key' });
                    console.log('📦 Created metadata object store');
                }
            };
        });
    }

    // ==================== VIDEO OPERATIONS (OFFLINE-FIRST) ====================
    
    // STEP 1: Get videos from IndexedDB (cache-first)
    async getAllVideos() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.videos], 'readonly');
            const store = transaction.objectStore(this.stores.videos);
            const request = store.getAll();

            request.onsuccess = () => {
                const videos = request.result;
                console.log(`📂 Loaded ${videos.length} videos from IndexedDB (cache)`);
                resolve(videos);
            };

            request.onerror = () => {
                console.error('❌ Error reading videos from IndexedDB:', request.error);
                reject(request.error);
            };
        });
    }

    // STEP 2: Save/update videos from API to IndexedDB (background sync)
    async saveAllVideos(videos) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.videos], 'readwrite');
            const store = transaction.objectStore(this.stores.videos);

            // Clear existing data first
            const clearRequest = store.clear();

            clearRequest.onsuccess = () => {
                // Add all videos with sync metadata
                videos.forEach(video => {
                    const videoWithMeta = {
                        ...video,
                        lastSyncedAt: new Date().toISOString(),
                        syncStatus: 'synced' // 'synced', 'pending', 'error'
                    };
                    store.put(videoWithMeta);
                });
            };

            transaction.oncomplete = () => {
                console.log(`💾 Saved ${videos.length} videos to IndexedDB (synced with MongoDB)`);
                this.updateLastSyncTime();
                resolve(true);
            };

            transaction.onerror = () => {
                console.error('❌ Error saving videos to IndexedDB:', transaction.error);
                reject(transaction.error);
            };
        });
    }

    // Save single video (for optimistic updates)
    async saveVideo(video) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.videos], 'readwrite');
            const store = transaction.objectStore(this.stores.videos);
            
            const videoWithMeta = {
                ...video,
                lastSyncedAt: new Date().toISOString(),
                syncStatus: video.syncStatus || 'pending'
            };

            const request = store.put(videoWithMeta);

            request.onsuccess = () => {
                console.log(`💾 Saved video ${video.videoId} to IndexedDB`);
                resolve(true);
            };

            request.onerror = () => {
                console.error('❌ Error saving video to IndexedDB:', request.error);
                reject(request.error);
            };
        });
    }

    // ==================== QUESTION OPERATIONS (OFFLINE-FIRST) ====================
    
    // Get questions for a specific video
    async getQuestionsByVideoId(videoId) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.questions], 'readonly');
            const store = transaction.objectStore(this.stores.questions);
            const index = store.index('videoId');
            const request = index.getAll(videoId);

            request.onsuccess = () => {
                console.log(`📂 Loaded ${request.result.length} questions for video ${videoId} from IndexedDB`);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('❌ Error reading questions from IndexedDB:', request.error);
                reject(request.error);
            };
        });
    }

    // Save questions for videos (background sync)
    async saveQuestions(questions) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.questions], 'readwrite');
            const store = transaction.objectStore(this.stores.questions);

            // Clear existing questions
            const clearRequest = store.clear();

            clearRequest.onsuccess = () => {
                // Add all questions with sync metadata
                questions.forEach(question => {
                    const questionWithMeta = {
                        ...question,
                        lastSyncedAt: new Date().toISOString(),
                        syncStatus: 'synced'
                    };
                    store.put(questionWithMeta);
                });
            };

            transaction.oncomplete = () => {
                console.log(`💾 Saved ${questions.length} questions to IndexedDB (synced with MongoDB)`);
                resolve(true);
            };

            transaction.onerror = () => {
                console.error('❌ Error saving questions to IndexedDB:', transaction.error);
                reject(transaction.error);
            };
        });
    }

    // ==================== METADATA OPERATIONS ====================
    
    // Update last sync time
    async updateLastSyncTime() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.metadata], 'readwrite');
            const store = transaction.objectStore(this.stores.metadata);
            
            const metadata = {
                key: 'lastSync',
                timestamp: new Date().toISOString()
            };

            const request = store.put(metadata);

            request.onsuccess = () => {
                console.log('⏰ Updated last sync time:', metadata.timestamp);
                resolve(metadata.timestamp);
            };

            request.onerror = () => reject(request.error);
        });
    }

    // Get last sync time
    async getLastSyncTime() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.metadata], 'readonly');
            const store = transaction.objectStore(this.stores.metadata);
            const request = store.get('lastSync');

            request.onsuccess = () => {
                resolve(request.result ? request.result.timestamp : null);
            };

            request.onerror = () => reject(request.error);
        });
    }

    // Check if data is stale (older than 5 minutes)
    async isDataStale() {
        const lastSync = await this.getLastSyncTime();
        if (!lastSync) return true;

        const lastSyncTime = new Date(lastSync).getTime();
        const now = new Date().getTime();
        const fiveMinutes = 5 * 60 * 1000;

        const isStale = (now - lastSyncTime) > fiveMinutes;
        console.log(`🕐 Data ${isStale ? 'is STALE' : 'is FRESH'} (last sync: ${new Date(lastSync).toLocaleTimeString()})`);
        return isStale;
    }

    // Check if IndexedDB has any data
    async hasData() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.videos], 'readonly');
            const store = transaction.objectStore(this.stores.videos);
            const request = store.count();

            request.onsuccess = () => {
                const hasData = request.result > 0;
                console.log(`📊 IndexedDB has ${request.result} videos`);
                resolve(hasData);
            };

            request.onerror = () => reject(request.error);
        });
    }

    // ==================== CLEAR DATA ====================
    async clearAllData() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.videos, this.stores.questions, this.stores.metadata], 'readwrite');
            
            transaction.objectStore(this.stores.videos).clear();
            transaction.objectStore(this.stores.questions).clear();
            transaction.objectStore(this.stores.metadata).clear();

            transaction.oncomplete = () => {
                console.log('🗑️ Cleared all IndexedDB data');
                resolve(true);
            };

            transaction.onerror = () => {
                console.error('❌ Error clearing IndexedDB:', transaction.error);
                reject(transaction.error);
            };
        });
    }
}

// Create singleton instance
const youtubeIndexedDB = new YouTubeIndexedDBService();
