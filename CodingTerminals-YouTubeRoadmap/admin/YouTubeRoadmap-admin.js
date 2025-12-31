// Load configuration
const API_URL = APP_CONFIG.API.BASE_URL + APP_CONFIG.API.ENDPOINTS.YOUTUBE_ROADMAP;
const YOUTUBE_API_KEY = APP_CONFIG.YOUTUBE.API_KEY;
const PLAYLIST_ID = APP_CONFIG.YOUTUBE.PLAYLIST_ID;

// IndexedDB Configuration - Use centralized config
const DB_NAME = APP_CONFIG.INDEXEDDB.DB_NAME;
const DB_VERSION = APP_CONFIG.INDEXEDDB.DB_VERSION;
const ROADMAP_STORE_NAME = APP_CONFIG.INDEXEDDB.STORES.YOUTUBE_ROADMAP;
let db = null; // IndexedDB instance

let videoPlaylistData = {
    channelName: APP_CONFIG.APP.CHANNEL_NAME,
    channelLogo: APP_CONFIG.ASSETS.LOGO,
    videoPlaylist: [],
    upcomingTopic: null
};

let currentEditingIndex = null;
let youtubeVideos = [];
let quillEditors = {}; // Store Quill editor instances

// ==================== INDEXEDDB SETUP ====================
/**
 * Initialize IndexedDB
 * Creates database and object stores if they don't exist
 */
function initializeIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // Handle database upgrade (first time or version change)
        request.onupgradeneeded = function(event) {
            db = event.target.result;
            
            console.log('🔄 Upgrading database to version', DB_VERSION);
            
            // Create roadmap object store if it doesn't exist
            if (!db.objectStoreNames.contains(ROADMAP_STORE_NAME)) {
                const objectStore = db.createObjectStore(ROADMAP_STORE_NAME, { keyPath: '_id' });
                
                // Create indexes for better query performance
                objectStore.createIndex('type', 'type', { unique: false });
                objectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                
                console.log('✅ IndexedDB roadmap store created:', ROADMAP_STORE_NAME);
            }
            
            // Study notes store removed - each module manages its own stores independently
        };

        // Handle success
        request.onsuccess = function(event) {
            db = event.target.result;
            
            // Check if the required object store exists
            if (!db.objectStoreNames.contains(ROADMAP_STORE_NAME)) {
                console.error('❌ Object store not found:', ROADMAP_STORE_NAME);
                console.log('Available stores:', Array.from(db.objectStoreNames));
                
                // Close and delete the database, then retry
                db.close();
                console.log('⚠️ Recreating database with correct object store...');
                
                const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
                deleteRequest.onsuccess = function() {
                    console.log('🗑️ Old database deleted, reinitializing...');
                    setTimeout(() => initializeIndexedDB(), 500);
                };
                deleteRequest.onerror = function() {
                    console.error('❌ Failed to delete database');
                };
                return;
            }
            
            console.log('✅ IndexedDB initialized successfully');
            console.log('Available stores:', Array.from(db.objectStoreNames));
            resolve(db);
        };

        // Handle error
        request.onerror = function(event) {
            console.error('❌ IndexedDB initialization failed:', event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Save roadmap data to IndexedDB
 * @param {Object} data - Roadmap data to save
 * @returns {Promise}
 */
function saveRoadmapToIndexedDB(data) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }

        const transaction = db.transaction([ROADMAP_STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(ROADMAP_STORE_NAME);
        
        const YoutubeRoadmapData = {
            _id: 'YoutubeRoadmap_main',
            type: 'YoutubeRoadmap',
            channelName: data.channelName,
            channelLogo: data.channelLogo,
            videoPlaylist: data.videoPlaylist,
            upcomingTopic: data.upcomingTopic,
            updatedAt: new Date().toISOString()
        };
        
        const request = objectStore.put(YoutubeRoadmapData);

        request.onsuccess = function() {
            console.log('✅ Roadmap saved to IndexedDB');
            resolve(request.result);
        };

        request.onerror = function() {
            console.error('❌ Error saving to IndexedDB:', request.error);
            reject(request.error);
        };
    });
}

/**
 * Load roadmap data from IndexedDB
 * @returns {Promise<Object|null>}
 */
function loadRoadmapFromIndexedDB() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }

        const transaction = db.transaction([ROADMAP_STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(ROADMAP_STORE_NAME);
        const request = objectStore.get('YoutubeRoadmap_main');

        request.onsuccess = function() {
            resolve(request.result || null);
        };

        request.onerror = function() {
            reject(request.error);
        };
    });
}

/**
 * Clear roadmap data from IndexedDB
 * @returns {Promise}
 */
function clearRoadmapFromIndexedDB() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }

        const transaction = db.transaction([ROADMAP_STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(ROADMAP_STORE_NAME);
        const request = objectStore.delete('YoutubeRoadmap_main');

        request.onsuccess = function() {
            resolve();
        };

        request.onerror = function() {
            reject(request.error);
        };
    });
}

// Fetch playlist videos from YouTube API
async function fetchPlaylistVideos() {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${YOUTUBE_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch playlist videos');
        }

        const data = await response.json();

        // Sort items by position in reverse order (newest first becomes Day 1)
        const sortedItems = data.items.sort((a, b) => b.snippet.position - a.snippet.position);

        const videos = sortedItems.map((item, index) => ({
            day: index + 1,
            position: item.snippet.position, // Store YouTube position
            date: item.snippet.publishedAt.split('T')[0],
            title: item.snippet.title,
            videoUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
            videoId: item.snippet.resourceId.videoId,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium.url
        }));

        // Fetch statistics (views, likes, comments) for all videos
        await fetchVideoStatistics(videos);

        return videos;
    } catch (error) {
        console.error('Error fetching YouTube playlist:', error);
        return [];
    }
}

// Fetch video statistics (views, likes, comment count) from YouTube API
async function fetchVideoStatistics(videos) {
    try {
        if (videos.length === 0) return;

        // Get all video IDs
        const videoIds = videos.map(v => v.videoId).join(',');

        // Fetch statistics for all videos in one API call
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch video statistics');
        }

        const data = await response.json();

        // Map statistics to videos
        data.items.forEach(item => {
            const video = videos.find(v => v.videoId === item.id);
            if (video) {
                video.viewCount = parseInt(item.statistics.viewCount || 0);
                video.likeCount = parseInt(item.statistics.likeCount || 0);
                video.commentCount = parseInt(item.statistics.commentCount || 0);
            }
        });

        console.log('✅ Fetched statistics for all videos');
    } catch (error) {
        console.error('Error fetching video statistics:', error);
    }
}

// Fetch latest comments for a specific video
async function fetchVideoComments(videoId, maxResults = 5) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxResults}&order=time&key=${YOUTUBE_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch comments');
        }

        const data = await response.json();

        return data.items.map(item => ({
            author: item.snippet.topLevelComment.snippet.authorDisplayName,
            authorProfileImage: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
            text: item.snippet.topLevelComment.snippet.textDisplay,
            likeCount: item.snippet.topLevelComment.snippet.likeCount,
            publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
            commentId: item.id
        }));
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
}

// Format number with K, M, B suffixes
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Format date to relative time
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffMs / 2592000000);
    const diffYears = Math.floor(diffMs / 31536000000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}

// Load existing data with OFFLINE-FIRST ARCHITECTURE
async function loadData() {
    try {
        console.log('🚀 Starting offline-first load for admin...');
        
        // Initialize IndexedDB first
        await initializeIndexedDB();
        
        // ==================== STEP 1: LOAD FROM INDEXEDDB (CACHE-FIRST) ====================
        let indexedDBData = null;
        try {
            indexedDBData = await loadRoadmapFromIndexedDB();
        } catch (dbError) {
            console.error('Error loading from IndexedDB:', dbError);
        }

        // Fetch YouTube videos first for merging
        youtubeVideos = await fetchPlaylistVideos();
        
        if (youtubeVideos.length > 0) {
            console.log(`📹 Loaded ${youtubeVideos.length} videos from YouTube API`);
        }

        // STEP 1A: If IndexedDB has data, display it INSTANTLY
        if (indexedDBData && indexedDBData.videoPlaylist && indexedDBData.videoPlaylist.length > 0) {
            console.log('📂 Loading from IndexedDB (INSTANT)...');
            
            videoPlaylistData.channelName = indexedDBData.channelName || APP_CONFIG.APP.CHANNEL_NAME;
            videoPlaylistData.channelLogo = indexedDBData.channelLogo || APP_CONFIG.ASSETS.LOGO;
            
            // Handle upcoming topic
            if (indexedDBData.upcomingTopic) {
                videoPlaylistData.upcomingTopic = {
                    ...indexedDBData.upcomingTopic,
                    interviewQuestions: (indexedDBData.upcomingTopic.interviewQuestions || []).map(q => {
                        if (typeof q === 'string') {
                            return { question: q, answer: '' };
                        }
                        return q;
                    })
                };
            }
            
            // Merge videoPlaylist with YouTube data
            videoPlaylistData.videoPlaylist = youtubeVideos.map((video, index) => {
                const savedVideo = indexedDBData.videoPlaylist[index] || {};
                
                const interviewQuestions = (savedVideo.interviewQuestions || []).map(q => {
                    if (typeof q === 'string') {
                        return { question: q, answer: '' };
                    }
                    return q;
                });
                
                return {
                    ...video,
                    _id: savedVideo._id,
                    subtopics: savedVideo.subtopics || [''],
                    interviewQuestions: interviewQuestions.length > 0 ? interviewQuestions : [{ question: '', answer: '' }]
                };
            });
            
            // Render UI INSTANTLY from cache
            renderVideoList();
            showToast('✅ Loaded from IndexedDB (INSTANT)', 'success');
        } else {
            console.log('📭 No cache found');
        }

        // ==================== STEP 2: FETCH FROM API (BACKGROUND SYNC) ====================
        console.log('🔄 Syncing with API in background...');
        
        // Check API health
        const apiHealthy = await adminAPI.healthCheck();
        if (apiHealthy) {
            console.log('✅ Connected to new optimized API');
        }
        
        // Try to fetch from new API first
        try {
            console.log('📡 Fetching from new API...');
            const apiVideos = await adminAPI.getAllVideos();
            
            if (apiVideos && apiVideos.length > 0) {
                console.log(`🌐 Fetched ${apiVideos.length} videos from API`);
                
                // Merge API data with YouTube data
                videoPlaylistData.videoPlaylist = youtubeVideos.map((video, index) => {
                    const apiVideo = apiVideos.find(v => v.videoId === video.videoId) || apiVideos[index] || {};
                    
                    const interviewQuestions = (apiVideo.interviewQuestions || []).map(q => {
                        if (typeof q === 'string') {
                            return { question: q, answer: '' };
                        }
                        return q;
                    });
                    
                    return {
                        ...video,
                        _id: apiVideo._id, // Store MongoDB ID for updates
                        subtopics: apiVideo.subtopics || [''],
                        interviewQuestions: interviewQuestions.length > 0 ? interviewQuestions : [{ question: '', answer: '' }]
                    };
                });
                
                // STEP 2A: Save to IndexedDB (background sync)
                await saveRoadmapToIndexedDB(videoPlaylistData);
                
                // STEP 2B: Update UI with fresh data (silent refresh)
                renderVideoList();
                showToast('✓ Synced with API', 'success');
            } else {
                throw new Error('No videos found in API');
            }
        } catch (apiError) {
            console.warn('⚠️ New API failed, trying old API:', apiError);
            
            // Fallback to old JSON API
            try {
                const response = await fetch(API_URL);
                
                if (response.ok) {
                    const jsonData = await response.json();
                    
                    // Merge JSON data with YouTube data
                    videoPlaylistData.channelName = jsonData.channelName || APP_CONFIG.APP.CHANNEL_NAME;
                    videoPlaylistData.channelLogo = jsonData.channelLogo || APP_CONFIG.ASSETS.LOGO;
                    
                    // Handle upcoming topic
                    if (jsonData.upcomingTopic) {
                        videoPlaylistData.upcomingTopic = {
                            ...jsonData.upcomingTopic,
                            interviewQuestions: (jsonData.upcomingTopic.interviewQuestions || []).map(q => {
                                if (typeof q === 'string') {
                                    return { question: q, answer: '' };
                                }
                                return q;
                            })
                        };
                    }
                    
                    // Merge videoPlaylist
                    videoPlaylistData.videoPlaylist = youtubeVideos.map((video, index) => {
                        const jsonVideo = jsonData.videoPlaylist[index] || {};
                        
                        const interviewQuestions = (jsonVideo.interviewQuestions || []).map(q => {
                            if (typeof q === 'string') {
                                return { question: q, answer: '' };
                            }
                            return q;
                        });
                        
                        return {
                            ...video,
                            subtopics: jsonVideo.subtopics || [''],
                            interviewQuestions: interviewQuestions.length > 0 ? interviewQuestions : [{ question: '', answer: '' }]
                        };
                    });
                    
                    // Save to IndexedDB for future use
                    await saveRoadmapToIndexedDB(videoPlaylistData);
                    renderVideoList();
                    
                    showToast('✓ Synced with old API', 'success');
                } else if (response.status === 404) {
                    // JSON file doesn't exist - use YouTube data only
                    console.log('No saved data found, using YouTube data only');
                    if (!indexedDBData) {
                        videoPlaylistData.videoPlaylist = youtubeVideos.map(video => ({
                            ...video,
                            subtopics: [''],
                            interviewQuestions: [{ question: '', answer: '' }]
                        }));
                        renderVideoList();
                    }
                    showToast('ℹ️ Using YouTube data only', 'info');
                } else {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
            } catch (fetchError) {
                // If we had cache, we already showed it
                if (indexedDBData) {
                    console.warn('⚠️ API sync failed, using cached data');
                    showToast('⚠ Using cached data (offline)', 'warning');
                } else {
                    // No cache and no API
                    console.error('❌ All data sources failed:', fetchError);
                    
                    // Fallback: use only YouTube data if available
                    if (youtubeVideos.length > 0) {
                        videoPlaylistData.videoPlaylist = youtubeVideos.map(video => ({
                            ...video,
                            subtopics: [''],
                            interviewQuestions: [{ question: '', answer: '' }]
                        }));
                        renderVideoList();
                        showToast('⚠️ Using YouTube data only (offline)', 'warning');
                    } else {
                        showToast('❌ Cannot load data: No connection', 'error');
                    }
                }
            }
        }
    } catch (error) {
        console.error('❌ Error in loadData:', error);
        showToast('❌ Error loading data: ' + error.message, 'error');
        
        // If we have any data at all, render it
        if (videoPlaylistData.videoPlaylist.length > 0) {
            renderVideoList();
        }
    }
}

// Render video list
function renderVideoList() {
    const container = document.getElementById('videoListContainer');
    
    if (videoPlaylistData.videoPlaylist.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">No videos added yet</p>';
        return;
    }

    container.innerHTML = videoPlaylistData.videoPlaylist.map((video, index) => `
        <div class="video-item ${currentEditingIndex === index ? 'active' : ''}" onclick="editVideo(${index})">
            <div class="day">Day ${index + 1}</div>
            <div class="title">${video.title || 'Untitled Video'}</div>
        </div>
    `).join('');

    // Add upcoming topic
    if (videoPlaylistData.upcomingTopic) {
        container.innerHTML += `
            <div class="video-item ${currentEditingIndex === 'upcoming' ? 'active' : ''}" onclick="editUpcomingTopic()" style="border-left-color: #ff9800;">
                <div class="day">🔔 Coming Soon</div>
                <div class="title">${videoPlaylistData.upcomingTopic.title || 'Upcoming Topic'}</div>
            </div>
        `;
    }
}

// ==================== INITIALIZATION ====================
// Initialize the application when DOM is loaded
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🎬 YouTube Roadmap Admin - Initializing...');
    
    // Load data using offline-first architecture
    await loadData();
    
    console.log('✅ YouTube Roadmap Admin - Initialized successfully!');
});

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// ==================== VIDEO EDITING ====================
function editVideo(index) {
    currentEditingIndex = index;
    renderVideoList();
    renderVideoEditor();
}

function editUpcomingTopic() {
    currentEditingIndex = 'upcoming';
    renderVideoList();
    renderUpcomingTopicEditor();
}

function renderVideoEditor() {
    const video = videoPlaylistData.videoPlaylist[currentEditingIndex];
    const editorPanel = document.getElementById('editorPanel');
    
    editorPanel.innerHTML = `
        <div class="video-editor">
            <h3>📝 Edit Video - Day ${currentEditingIndex + 1}</h3>
            
            <!-- Video Info (Read-only from YouTube) -->
            <div class="card mb-3">
                <div class="card-header bg-primary text-white">
                    <strong>📹 YouTube Video Information</strong>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label"><strong>Title:</strong></label>
                            <input type="text" class="form-control" value="${video.title}" readonly>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label"><strong>Video ID:</strong></label>
                            <input type="text" class="form-control" value="${video.videoId}" readonly>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label"><strong>Views:</strong></label>
                            <input type="text" class="form-control" value="${formatNumber(video.viewCount || 0)}" readonly>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label"><strong>Likes:</strong></label>
                            <input type="text" class="form-control" value="${formatNumber(video.likeCount || 0)}" readonly>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label"><strong>Comments:</strong></label>
                            <input type="text" class="form-control" value="${formatNumber(video.commentCount || 0)}" readonly>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><strong>Video URL:</strong></label>
                        <div class="input-group">
                            <input type="text" class="form-control" value="${video.videoUrl}" readonly>
                            <button class="btn btn-outline-primary" onclick="window.open('${video.videoUrl}', '_blank')">
                                🔗 Open
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Subtopics (Editable) -->
            <div class="card mb-3">
                <div class="card-header bg-success text-white">
                    <strong>📚 Subtopics Covered</strong>
                </div>
                <div class="card-body">
                    <div id="subtopicsContainer"></div>
                    <button class="btn btn-sm btn-success mt-2" onclick="addSubtopic()">
                        ➕ Add Subtopic
                    </button>
                </div>
            </div>

            <!-- Interview Questions (Editable with Rich Text) -->
            <div class="card mb-3">
                <div class="card-header bg-warning text-dark">
                    <strong>💼 Interview Questions</strong>
                </div>
                <div class="card-body">
                    <div id="questionsContainer"></div>
                    <button class="btn btn-sm btn-warning mt-2" onclick="addQuestion()">
                        ➕ Add Question
                    </button>
                </div>
            </div>

            <!-- Save Button -->
            <div class="d-grid gap-2">
                <button class="btn btn-primary btn-lg" onclick="saveCurrentVideo()">
                    💾 Save Changes
                </button>
            </div>
        </div>
    `;
    
    renderSubtopics();
    renderQuestions();
}

function renderUpcomingTopicEditor() {
    const editorPanel = document.getElementById('editorPanel');
    const topic = videoPlaylistData.upcomingTopic || { title: '', description: '', subtopics: [''], interviewQuestions: [] };
    
    editorPanel.innerHTML = `
        <div class="video-editor">
            <h3>🔔 Edit Upcoming Topic</h3>
            
            <div class="card mb-3">
                <div class="card-header bg-warning text-dark">
                    <strong>📌 Upcoming Topic Details</strong>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <label class="form-label"><strong>Title:</strong></label>
                        <input type="text" class="form-control" value="${topic.title || ''}" 
                               onchange="updateUpcomingTopic('title', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><strong>Description:</strong></label>
                        <textarea class="form-control" rows="3" 
                                  onchange="updateUpcomingTopic('description', this.value)">${topic.description || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><strong>Estimated Date:</strong></label>
                        <input type="date" class="form-control" value="${topic.estimatedDate || ''}" 
                               onchange="updateUpcomingTopic('estimatedDate', this.value)">
                    </div>
                </div>
            </div>

            <div class="card mb-3">
                <div class="card-header bg-success text-white">
                    <strong>📚 Planned Subtopics</strong>
                </div>
                <div class="card-body">
                    <div id="upcomingSubtopicsContainer"></div>
                    <button class="btn btn-sm btn-success mt-2" onclick="addUpcomingSubtopic()">
                        ➕ Add Subtopic
                    </button>
                </div>
            </div>

            <div class="d-grid gap-2">
                <button class="btn btn-primary btn-lg" onclick="saveUpcomingTopic()">
                    💾 Save Upcoming Topic
                </button>
            </div>
        </div>
    `;
    
    renderUpcomingSubtopics();
}

function renderSubtopics() {
    const video = videoPlaylistData.videoPlaylist[currentEditingIndex];
    const container = document.getElementById('subtopicsContainer');
    
    container.innerHTML = (video.subtopics || ['']).map((subtopic, index) => `
        <div class="input-group mb-2">
            <span class="input-group-text">${index + 1}.</span>
            <input type="text" class="form-control" value="${subtopic}" 
                   placeholder="Enter subtopic..."
                   onchange="updateSubtopic(${index}, this.value)">
            <button class="btn btn-outline-danger" onclick="removeSubtopic(${index})" title="Remove">
                <i>×</i>
            </button>
        </div>
    `).join('');
}

function renderQuestions() {
    const video = videoPlaylistData.videoPlaylist[currentEditingIndex];
    const container = document.getElementById('questionsContainer');
    
    container.innerHTML = (video.interviewQuestions || []).map((q, index) => `
        <div class="card mb-3 question-card" id="question-${index}">
            <div class="card-header d-flex justify-content-between align-items-center">
                <strong>Question ${index + 1}</strong>
                <button class="btn btn-sm btn-outline-danger" onclick="removeQuestion(${index})">
                    🗑️ Remove
                </button>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label"><strong>Question:</strong></label>
                    <input type="text" class="form-control" placeholder="Enter interview question..." 
                           value="${q.question || ''}" 
                           onchange="updateQuestion(${index}, 'question', this.value)">
                </div>
                <div class="mb-3">
                    <label class="form-label"><strong>Answer (Rich Text Editor):</strong></label>
                    <div id="quill-answer-${index}" class="quill-editor"></div>
                </div>
                <div class="mb-3">
                    <label class="form-label"><strong>Difficulty:</strong></label>
                    <select class="form-select" onchange="updateQuestion(${index}, 'difficulty', this.value)">
                        <option value="" ${!q.difficulty ? 'selected' : ''}>Select difficulty</option>
                        <option value="easy" ${q.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
                        <option value="medium" ${q.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="hard" ${q.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
                    </select>
                </div>
            </div>
        </div>
    `).join('');
    
    // Initialize Quill editors for each answer
    (video.interviewQuestions || []).forEach((q, index) => {
        const quillId = `#quill-answer-${index}`;
        
        // Destroy existing editor if it exists
        if (quillEditors[quillId]) {
            delete quillEditors[quillId];
        }
        
        // Create new Quill editor
        const quill = new Quill(quillId, {
            theme: 'snow',
            placeholder: 'Write the answer here...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'color': [] }, { 'background': [] }],
                    ['link', 'image'],
                    ['clean']
                ]
            }
        });
        
        // Set existing content
        if (q.answer) {
            quill.root.innerHTML = q.answer;
        }
        
        // Store editor instance
        quillEditors[quillId] = quill;
        
        // Update question on content change
        quill.on('text-change', () => {
            updateQuestion(index, 'answer', quill.root.innerHTML);
        });
    });
}

function renderUpcomingSubtopics() {
    const topic = videoPlaylistData.upcomingTopic || { subtopics: [''] };
    const container = document.getElementById('upcomingSubtopicsContainer');
    
    container.innerHTML = (topic.subtopics || ['']).map((subtopic, index) => `
        <div class="input-group mb-2">
            <span class="input-group-text">${index + 1}.</span>
            <input type="text" class="form-control" value="${subtopic}" 
                   placeholder="Enter subtopic..."
                   onchange="updateUpcomingSubtopic(${index}, this.value)">
            <button class="btn btn-outline-danger" onclick="removeUpcomingSubtopic(${index})">
                <i>×</i>
            </button>
        </div>
    `).join('');
}

function addSubtopic() {
    const video = videoPlaylistData.videoPlaylist[currentEditingIndex];
    if (!video.subtopics) video.subtopics = [];
    video.subtopics.push('');
    renderSubtopics();
}

function updateSubtopic(index, value) {
    const video = videoPlaylistData.videoPlaylist[currentEditingIndex];
    video.subtopics[index] = value;
}

function removeSubtopic(index) {
    const video = videoPlaylistData.videoPlaylist[currentEditingIndex];
    video.subtopics.splice(index, 1);
    if (video.subtopics.length === 0) {
        video.subtopics = [''];
    }
    renderSubtopics();
}

function addQuestion() {
    const video = videoPlaylistData.videoPlaylist[currentEditingIndex];
    if (!video.interviewQuestions) video.interviewQuestions = [];
    video.interviewQuestions.push({ question: '', answer: '', difficulty: '' });
    renderQuestions();
}

function updateQuestion(index, field, value) {
    const video = videoPlaylistData.videoPlaylist[currentEditingIndex];
    video.interviewQuestions[index][field] = value;
}

function removeQuestion(index) {
    if (confirm('Are you sure you want to remove this question?')) {
        const video = videoPlaylistData.videoPlaylist[currentEditingIndex];
        video.interviewQuestions.splice(index, 1);
        renderQuestions();
    }
}

function updateUpcomingTopic(field, value) {
    if (!videoPlaylistData.upcomingTopic) {
        videoPlaylistData.upcomingTopic = {};
    }
    videoPlaylistData.upcomingTopic[field] = value;
}

function addUpcomingSubtopic() {
    if (!videoPlaylistData.upcomingTopic) {
        videoPlaylistData.upcomingTopic = { subtopics: [] };
    }
    if (!videoPlaylistData.upcomingTopic.subtopics) {
        videoPlaylistData.upcomingTopic.subtopics = [];
    }
    videoPlaylistData.upcomingTopic.subtopics.push('');
    renderUpcomingSubtopics();
}

function updateUpcomingSubtopic(index, value) {
    videoPlaylistData.upcomingTopic.subtopics[index] = value;
}

function removeUpcomingSubtopic(index) {
    videoPlaylistData.upcomingTopic.subtopics.splice(index, 1);
    if (videoPlaylistData.upcomingTopic.subtopics.length === 0) {
        videoPlaylistData.upcomingTopic.subtopics = [''];
    }
    renderUpcomingSubtopics();
}

function saveCurrentVideo() {
    showToast('💾 Saving video...', 'info');
    
    // Save to IndexedDB
    saveRoadmapToIndexedDB(videoPlaylistData)
        .then(() => {
            showToast('✅ Video saved successfully!', 'success');
        })
        .catch(error => {
            console.error('Error saving video:', error);
            showToast('❌ Error saving video', 'error');
        });
}

function saveUpcomingTopic() {
    showToast('💾 Saving upcoming topic...', 'info');
    
    // Save to IndexedDB
    saveRoadmapToIndexedDB(videoPlaylistData)
        .then(() => {
            showToast('✅ Upcoming topic saved successfully!', 'success');
        })
        .catch(error => {
            console.error('Error saving upcoming topic:', error);
            showToast('❌ Error saving upcoming topic', 'error');
        });
}

function addNewVideo() {
    showToast('ℹ️ Videos are automatically loaded from YouTube playlist', 'info');
}

// ==================== SAVE OPERATIONS ====================
async function saveAllData() {
    try {
        showToast('Saving data...', 'info');
        
        // Save to IndexedDB first
        await saveRoadmapToIndexedDB(videoPlaylistData);
        
        // TODO: Save to MongoDB via API
        
        showToast('✅ Data saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving data:', error);
        showToast('❌ Error saving data', 'error');
    }
}

function downloadJSON() {
    const dataStr = JSON.stringify(videoPlaylistData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-roadmap-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 JSON downloaded!', 'success');
}

// ==================== LOGOUT ====================
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        window.location.href = '../../auth/login.html';
    }
}
