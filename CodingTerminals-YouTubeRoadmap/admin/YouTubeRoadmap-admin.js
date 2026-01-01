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
            
            // Create study notes store if it doesn't exist (for compatibility)
            const studyNotesStore = APP_CONFIG.INDEXEDDB.STORES.STUDY_NOTES;
            if (!db.objectStoreNames.contains(studyNotesStore)) {
                const notesStore = db.createObjectStore(studyNotesStore, { keyPath: '_id' });
                notesStore.createIndex('title', 'title', { unique: false });
                notesStore.createIndex('category', 'category', { unique: false });
                notesStore.createIndex('createdAt', 'createdAt', { unique: false });
                console.log('✅ IndexedDB study notes store created:', studyNotesStore);
            }
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

// ==================== OFFLINE-FIRST LOAD DATA ====================
/**
 * FETCH FLOW: UI → IndexedDB → MongoDB
 * 1. Check IndexedDB
 * 2. If data exists → render UI instantly
 * 3. Call MongoDB API in background
 * 4. Update IndexedDB
 * 5. Refresh UI silently
 */
async function loadData() {
    try {
        console.log('🚀 Starting offline-first load...');
        
        // Initialize IndexedDB first
        await initializeIndexedDB();
        
        // Fetch YouTube videos for merging
        youtubeVideos = await fetchPlaylistVideos();
        if (youtubeVideos.length > 0) {
            console.log(`📹 Loaded ${youtubeVideos.length} videos from YouTube API`);
        }

        // ==================== STEP 1: CHECK INDEXEDDB ====================
        let indexedDBData = null;
        try {
            indexedDBData = await loadRoadmapFromIndexedDB();
        } catch (dbError) {
            console.error('Error loading from IndexedDB:', dbError);
        }

        // ==================== STEP 2: IF DATA EXISTS → RENDER UI INSTANTLY ====================
        if (indexedDBData && indexedDBData.videoPlaylist && indexedDBData.videoPlaylist.length > 0) {
            console.log('📂 Found data in IndexedDB - Rendering instantly...');
            
            // Merge IndexedDB data with YouTube data
            videoPlaylistData.channelName = indexedDBData.channelName || APP_CONFIG.APP.CHANNEL_NAME;
            videoPlaylistData.channelLogo = indexedDBData.channelLogo || APP_CONFIG.ASSETS.LOGO;
            
            if (indexedDBData.upcomingTopic) {
                videoPlaylistData.upcomingTopic = {
                    ...indexedDBData.upcomingTopic,
                    interviewQuestions: (indexedDBData.upcomingTopic.interviewQuestions || []).map(q => {
                        if (typeof q === 'string') return { question: q, answer: '' };
                        return q;
                    })
                };
            }
            
            videoPlaylistData.videoPlaylist = youtubeVideos.map((video, index) => {
                const savedVideo = indexedDBData.videoPlaylist[index] || {};
                const interviewQuestions = (savedVideo.interviewQuestions || []).map(q => {
                    if (typeof q === 'string') return { question: q, answer: '' };
                    return q;
                });
                
                return {
                    ...video,
                    _id: savedVideo._id,
                    subtopics: savedVideo.subtopics || [''],
                    interviewQuestions: interviewQuestions.length > 0 ? interviewQuestions : [{ question: '', answer: '' }]
                };
            });
            
            // ✅ RENDER UI INSTANTLY
            renderVideoList();
            showToast('✅ Loaded instantly from cache', 'success');
        } else {
            console.log('📭 No cache found');
        }

        // ==================== STEP 3: CALL MONGODB API (BACKGROUND) ====================
        console.log('🔄 Syncing with MongoDB in background...');
        
        try {
            // Check if adminAPI is available
            if (typeof adminAPI !== 'undefined') {
                // Fetch complete roadmap including upcomingTopic
                const roadmapData = await adminAPI.getCompleteRoadmap();
                const apiVideos = roadmapData.videoPlaylist || [];
                
                if (apiVideos && apiVideos.length > 0) {
                    console.log(`🌐 Fetched ${apiVideos.length} videos from MongoDB`);
                    
                    // Merge MongoDB data with YouTube data
                    videoPlaylistData.videoPlaylist = youtubeVideos.map((video, index) => {
                        const apiVideo = apiVideos.find(v => v.videoId === video.videoId) || apiVideos[index] || {};
                        const interviewQuestions = (apiVideo.interviewQuestions || []).map(q => {
                            if (typeof q === 'string') return { question: q, answer: '' };
                            return q;
                        });
                        
                        return {
                            ...video,
                            _id: apiVideo._id,
                            subtopics: apiVideo.subtopics || [''],
                            interviewQuestions: interviewQuestions.length > 0 ? interviewQuestions : [{ question: '', answer: '' }]
                        };
                    });
                    
                    // Load upcomingTopic from MongoDB
                    if (roadmapData.upcomingTopic) {
                        console.log('🔔 Loading upcoming topic from MongoDB:', roadmapData.upcomingTopic.title);
                        videoPlaylistData.upcomingTopic = {
                            ...roadmapData.upcomingTopic,
                            interviewQuestions: (roadmapData.upcomingTopic.interviewQuestions || []).map(q => {
                                if (typeof q === 'string') return { question: q, answer: '' };
                                return q;
                            })
                        };
                    } else {
                        console.log('📭 No upcoming topic found in MongoDB');
                        videoPlaylistData.upcomingTopic = null;
                    }
                    
                    // ==================== STEP 4: UPDATE INDEXEDDB ====================
                    await saveRoadmapToIndexedDB(videoPlaylistData);
                    console.log('💾 IndexedDB updated with latest data');
                    
                    // ==================== STEP 5: REFRESH UI SILENTLY ====================
                    renderVideoList();
                    showToast('✓ Synced with MongoDB', 'success');
                } else {
                    throw new Error('No videos found in MongoDB');
                }
            } else {
                throw new Error('Admin API not loaded');
            }
        } catch (mongoError) {
            console.warn('⚠️ MongoDB sync failed:', mongoError.message);
            
            // If we had cache, we already showed it
            if (indexedDBData) {
                showToast('⚠ Using cached data (offline)', 'warning');
            } else {
                // No cache and no MongoDB - use YouTube data only
                if (youtubeVideos.length > 0) {
                    videoPlaylistData.videoPlaylist = youtubeVideos.map(video => ({
                        ...video,
                        subtopics: [''],
                        interviewQuestions: [{ question: '', answer: '' }]
                    }));
                    renderVideoList();
                    showToast('ℹ️ Using YouTube data only', 'info');
                } else {
                    showToast('❌ Cannot load data: No connection', 'error');
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
                <div class="title">${videoPlaylistData.upcomingTopic.title}</div>
            </div>
        `;
    }
}

// Add new video
function addNewVideo() {
    const newVideo = {
        title: '',
        subtopics: [''],
        interviewQuestions: ['']
    };
    videoPlaylistData.videoPlaylist.push(newVideo);
    currentEditingIndex = videoPlaylistData.videoPlaylist.length - 1;
    renderVideoList();
    editVideo(currentEditingIndex);
}

// Edit video
async function editVideo(index) {
    currentEditingIndex = index;
    const video = videoPlaylistData.videoPlaylist[index];
    renderVideoList();

    const editorPanel = document.getElementById('editorPanel');
    
    // Prepare subtopics HTML - handle both plain text and HTML content
    let subtopicsHTML = '';
    if (video.subtopics && video.subtopics.length > 0) {
        // Check if subtopics contain HTML or plain text
        const hasHTML = video.subtopics.some(topic => topic.includes('<') && topic.includes('>'));
        
        if (hasHTML) {
            // Join HTML content directly
            subtopicsHTML = video.subtopics.join('');
        } else {
            // Wrap plain text in list items
            subtopicsHTML = `<ul>${video.subtopics.map(topic => `<li>${topic}</li>`).join('')}</ul>`;
        }
    }

    // YouTube Statistics Section
    const statsHTML = `
        <div class="youtube-stats">
            <h3>📊 YouTube Statistics</h3>
            <div class="stats-grid">
                <div class="stat-card views">
                    <div class="stat-icon">👁️</div>
                    <div class="stat-info">
                        <div class="stat-value">${video.viewCount ? formatNumber(video.viewCount) : 'N/A'}</div>
                        <div class="stat-label">Views</div>
                    </div>
                </div>
                <div class="stat-card likes">
                    <div class="stat-icon">👍</div>
                    <div class="stat-info">
                        <div class="stat-value">${video.likeCount ? formatNumber(video.likeCount) : 'N/A'}</div>
                        <div class="stat-label">Likes</div>
                    </div>
                </div>
                <div class="stat-card comments">
                    <div class="stat-icon">💬</div>
                    <div class="stat-info">
                        <div class="stat-value">${video.commentCount ? formatNumber(video.commentCount) : 'N/A'}</div>
                        <div class="stat-label">Comments</div>
                    </div>
                </div>
            </div>
            <button class="btn-view-comments" onclick="toggleComments(${index})" id="btnComments${index}">
                📝 View Latest Comments
            </button>
            <div class="comments-section" id="commentsSection${index}" style="display: none;">
                <div class="comments-loading">Loading comments...</div>
            </div>
        </div>
    `;

    editorPanel.innerHTML = `
        <h2>✏️ Edit Video - Day ${index + 1}</h2>
        
        ${video.videoId ? statsHTML : ''}
        
        <div class="form-group">
            <label>Video Title</label>
            <input type="text" id="videoTitle" value="${video.title || ''}" placeholder="Enter video title">
        </div>

        <div class="list-section">
            <h3>📚 Topics Covered</h3>
            <div class="format-helper" style="margin-bottom: 10px;">
                💡 <strong>Tip:</strong> Use the bullet list or numbered list buttons in the toolbar to add multiple topics
            </div>
            <div id="subtopicsEditor" class="quill-editor-topics"></div>
        </div>

        <div class="list-section">
            <h3>💼 Interview Questions</h3>
            <div class="list-items" id="questionsList">
                ${(video.interviewQuestions && video.interviewQuestions.length > 0 ? video.interviewQuestions : [{ question: '', answer: '' }]).map((item, i) => {
                    const question = typeof item === 'object' ? item.question : item;
                    const answer = typeof item === 'object' ? (item.answer || '') : '';
                    
                    return `
                        <div class="qa-container">
                            <div class="qa-reorder-buttons">
                                <button class="btn-reorder" onclick="moveQuestion(${i}, -1)" ${i === 0 ? 'disabled' : ''}>⬆️</button>
                                <button class="btn-reorder" onclick="moveQuestion(${i}, 1)" ${i === (video.interviewQuestions?.length || 1) - 1 ? 'disabled' : ''}>⬇️</button>
                            </div>
                            <div class="qa-header">
                                <span class="qa-number">${i + 1}</span>
                                <span class="qa-label question">Question</span>
                            </div>
                            <div id="questionEditor${i}" class="quill-editor-small">${question}</div>
                            <div class="qa-header" style="margin-top: 10px;">
                                <span class="qa-label answer">Answer</span>
                            </div>
                            <div id="answerEditor${i}" class="quill-editor-answer">${answer}</div>
                            <button class="qa-delete-btn" onclick="removeQuestion(${i})">✕</button>
                        </div>
                    `;
                }).join('')}
            </div>
            <button class="btn-add" onclick="addQuestion()">➕ Add Question</button>
            <button class="btn-clear-all" onclick="clearAllQuestions()">🗑️ Clear All Questions</button>
            <div class="tooltip-wrapper">
                <button class="btn-bulk" onclick="toggleBulkAdd('questions')">📝 Bulk Add</button>
                <button class="btn-info-help" title="Click for help">?</button>
                <div class="tooltip-content">
                    <strong>💡 Bulk Add Format Options:</strong><br><br>
                    <strong>Option 1 - Questions only:</strong><br>
                    One question per line
                    <div class="example">What is JavaScript?
What is TypeScript?
What is React?</div>
                    <strong>Option 2 - With answers:</strong><br>
                    Use <code>Q:</code> and <code>A:</code> format
                    <div class="example">Q: What is JavaScript?
A: JavaScript is a programming language...

Q: What is TypeScript?
A: TypeScript adds static typing to JS...</div>
                </div>
            </div>
            <div class="bulk-add-container" id="bulkQuestions">
                <div id="bulkQuestionsEditor" class="quill-editor-bulk"></div>
                <div class="bulk-buttons-wrapper">
                    <button class="btn-add" onclick="applyBulkQuestions()">✅ Add All</button>
                    <button class="btn-remove" onclick="toggleBulkAdd('questions')">❌ Cancel</button>
                </div>
            </div>
        </div>

        <div class="action-buttons">
            <button class="btn btn-success" onclick="saveCurrentVideo()">💾 Save Changes</button>
            <button class="btn btn-danger" onclick="deleteVideo(${index})">🗑️ Delete Video</button>
        </div>
    `;

    // Add event listener for title
    document.getElementById('videoTitle').addEventListener('change', (e) => {
        videoPlaylistData.videoPlaylist[currentEditingIndex].title = e.target.value;
    });

    // Initialize single Quill editor for subtopics
    quillEditors = {};
    const subtopicsEditor = new Quill('#subtopicsEditor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                ['clean']
            ]
        }
    });
    
    // Set initial content - directly set the HTML content
    if (subtopicsHTML) {
        subtopicsEditor.root.innerHTML = subtopicsHTML;
    }
    
    // Save changes on text change
    subtopicsEditor.on('text-change', () => {
        const htmlContent = subtopicsEditor.root.innerHTML;
        // Extract list items from the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const listItems = tempDiv.querySelectorAll('li');
        videoPlaylistData.videoPlaylist[currentEditingIndex].subtopics = Array.from(listItems).map(li => li.innerHTML.trim()).filter(item => item !== '');
        
        // If no list items, save the entire content as a single item
        if (videoPlaylistData.videoPlaylist[currentEditingIndex].subtopics.length === 0) {
            const textContent = subtopicsEditor.getText().trim();
            if (textContent) {
                videoPlaylistData.videoPlaylist[currentEditingIndex].subtopics = [htmlContent];
            }
        }
    });
    
    quillEditors['subtopicsEditor'] = subtopicsEditor;

    // Initialize Quill editors for questions and answers
    (video.interviewQuestions || ['']).forEach((item, i) => {
        // Question editor
        const questionEditorId = `questionEditor${i}`;
        quillEditors[questionEditorId] = new Quill(`#${questionEditorId}`, {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'color': [] }, { 'background': [] }],
                    ['clean']
                ]
            }
        });
        
        quillEditors[questionEditorId].on('text-change', () => {
            updateQuestion(i, quillEditors[questionEditorId].root.innerHTML, 'question');
        });

        // Answer editor
        const answerEditorId = `answerEditor${i}`;
        quillEditors[answerEditorId] = new Quill(`#${answerEditorId}`, {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'header': [1, 2, 3, false] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'color': [] }, { 'background': [] }],
                    ['link', 'code-block'],
                    ['clean']
                ]
            }
        });
        
        quillEditors[answerEditorId].on('text-change', () => {
            updateQuestion(i, quillEditors[answerEditorId].root.innerHTML, 'answer');
        });
    });
}

// Edit upcoming topic
function editUpcomingTopic() {
    currentEditingIndex = 'upcoming';
    renderVideoList();

    if (!videoPlaylistData.upcomingTopic) {
        videoPlaylistData.upcomingTopic = {
            title: '',
            description: '',
            subtopics: [''],
            interviewQuestions: [{ question: '', answer: '' }],
            estimatedDate: new Date().toISOString().split('T')[0]
        };
    }

    const topic = videoPlaylistData.upcomingTopic;
    
    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Prepare subtopics HTML - handle both plain text and HTML content
    let subtopicsHTML = '';
    if (topic.subtopics && topic.subtopics.length > 0) {
        // Check if subtopics contain HTML or plain text
        const hasHTML = topic.subtopics.some(t => t.includes('<') && t.includes('>'));
        
        if (hasHTML) {
            // Join HTML content directly
            subtopicsHTML = topic.subtopics.join('');
        } else {
            // Wrap plain text in list items
            subtopicsHTML = `<ul>${topic.subtopics.map(t => `<li>${t}</li>`).join('')}</ul>`;
        }
    }
    
    const editorPanel = document.getElementById('editorPanel');
    editorPanel.innerHTML = `
        <h2>🔔 Edit Upcoming Topic</h2>
        
        <div class="form-group">
            <label>Topic Title</label>
            <input type="text" id="upcomingTitle" value="${topic.title || ''}" placeholder="Enter topic title">
        </div>

        <div class="form-group">
            <label>Estimated Date</label>
            <input type="date" id="upcomingDate" value="${currentDate}">
        </div>

        <div class="list-section">
            <h3>📝 Description</h3>
            <div class="format-helper" style="margin-bottom: 10px;">
                💡 <strong>Tip:</strong> Use the bullet list or numbered list buttons in the toolbar to add multiple topics
            </div>
            <div id="upcomingSubtopicsEditor" class="quill-editor-topics"></div>
        </div>

        <div class="list-section">
            <h3>💼 Interview Questions</h3>
            <div class="list-items" id="upcomingQuestions">
                ${(topic.interviewQuestions || [{ question: '', answer: '' }]).map((item, i) => {
                    const question = typeof item === 'object' ? item.question : item;
                    const answer = typeof item === 'object' ? item.answer : '';
                    
                    return `
                        <div class="qa-container">
                            <div class="qa-reorder-buttons">
                                <button class="btn-reorder" onclick="moveUpcomingQuestion(${i}, -1)" ${i === 0 ? 'disabled' : ''}>⬆️</button>
                                <button class="btn-reorder" onclick="moveUpcomingQuestion(${i}, 1)" ${i === topic.interviewQuestions.length - 1 ? 'disabled' : ''}>⬇️</button>
                            </div>
                            <div class="qa-header">
                                <span class="qa-number">${i + 1}</span>
                                <span class="qa-label question">Question</span>
                            </div>
                            <div id="upcomingQuestionEditor${i}" class="quill-editor-small">${question}</div>
                            <div class="qa-header" style="margin-top: 10px;">
                                <span class="qa-label answer">Answer</span>
                            </div>
                            <div id="upcomingAnswerEditor${i}" class="quill-editor-answer">${answer}</div>
                            <button class="qa-delete-btn" onclick="removeUpcomingQuestion(${i})">✕</button>
                        </div>
                    `;
                }).join('')}
            </div>
            <button class="btn-add" onclick="addUpcomingQuestion()">➕ Add Question</button>
            <button class="btn-clear-all" onclick="clearAllUpcomingQuestions()" style="margin-left: 10px;">🗑️ Clear All Questions</button>
            <div class="tooltip-wrapper">
                <button class="btn-bulk" onclick="toggleBulkAdd('upcomingQuestions')">📝 Bulk Add</button>
                <button class="btn-info-help" title="Click for help">?</button>
                <div class="tooltip-content">
                    <strong>💡 Bulk Add Format Options:</strong><br><br>
                    <strong>Option 1 - Questions only:</strong><br>
                    One question per line
                    <div class="example">What is JavaScript?
What is TypeScript?
What is React?</div>
                    <strong>Option 2 - With answers:</strong><br>
                    Use <code>Q:</code> and <code>A:</code> format
                    <div class="example">Q: What is JavaScript?
A: JavaScript is a programming language...

Q: What is TypeScript?
A: TypeScript adds static typing to JS...</div>
                </div>
            </div>
            <div class="bulk-add-container" id="bulkUpcomingQuestions">
                <div id="bulkUpcomingQuestionsEditor" class="quill-editor-bulk"></div>
                <div style="margin-top: 10px;">
                    <button class="btn-add" onclick="applyBulkUpcomingQuestions()">✅ Add All</button>
                    <button class="btn-remove" onclick="toggleBulkAdd('upcomingQuestions')">❌ Cancel</button>
                </div>
            </div>
        </div>

        <div class="action-buttons">
            <button class="btn btn-primary" onclick="copyUpcomingToLatestVideo()">📋 Copy to Latest Video</button>
            <button class="btn btn-success" onclick="saveAllData()">💾 Save Changes</button>
            <button class="btn btn-danger" onclick="deleteUpcomingTopic()">🗑️ Clear Values</button>
        </div>
    `;

    // Add event listeners
    document.getElementById('upcomingTitle').addEventListener('change', (e) => {
        videoPlaylistData.upcomingTopic.title = e.target.value;
    });

    document.getElementById('upcomingDate').addEventListener('change', (e) => {
        videoPlaylistData.upcomingTopic.estimatedDate = e.target.value;
    });

    // Initialize Quill editor for upcoming subtopics
    quillEditors = {};
    const upcomingSubtopicsEditor = new Quill('#upcomingSubtopicsEditor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                ['clean']
            ]
        }
    });
    
    // Set initial content - directly set the HTML content
    if (subtopicsHTML) {
        upcomingSubtopicsEditor.root.innerHTML = subtopicsHTML;
    }
    
    // Save changes on text change
    upcomingSubtopicsEditor.on('text-change', () => {
        const htmlContent = upcomingSubtopicsEditor.root.innerHTML;
        // Extract list items from the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const listItems = tempDiv.querySelectorAll('li');
        videoPlaylistData.upcomingTopic.subtopics = Array.from(listItems).map(li => li.innerHTML.trim()).filter(item => item !== '');
        
        // If no list items, save the entire content as a single item
        if (videoPlaylistData.upcomingTopic.subtopics.length === 0) {
            const textContent = upcomingSubtopicsEditor.getText().trim();
            if (textContent) {
                videoPlaylistData.upcomingTopic.subtopics = [htmlContent];
            }
        }
    });
    
    quillEditors['upcomingSubtopicsEditor'] = upcomingSubtopicsEditor;

    // Initialize Quill editors for upcoming questions and answers
    (topic.interviewQuestions || [{ question: '', answer: '' }]).forEach((item, i) => {
        // Question editor
        const questionEditorId = `upcomingQuestionEditor${i}`;
        quillEditors[questionEditorId] = new Quill(`#${questionEditorId}`, {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'color': [] }, { 'background': [] }],
                    ['clean']
                ]
            }
        });
        
        quillEditors[questionEditorId].on('text-change', () => {
            updateUpcomingQuestion(i, quillEditors[questionEditorId].root.innerHTML, 'question');
        });

        // Answer editor
        const answerEditorId = `upcomingAnswerEditor${i}`;
        quillEditors[answerEditorId] = new Quill(`#${answerEditorId}`, {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'header': [1, 2, 3, false] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'color': [] }, { 'background': [] }],
                    ['link', 'code-block'],
                    ['clean']
                ]
            }
        });
        
        quillEditors[answerEditorId].on('text-change', () => {
            updateUpcomingQuestion(i, quillEditors[answerEditorId].root.innerHTML, 'answer');
        });
    });
}

// Bulk add functions
function toggleBulkAdd(type) {
    const container = document.getElementById(type === 'subtopics' ? 'bulkSubtopics' : type === 'questions' ? 'bulkQuestions' : 'bulkUpcomingQuestions');
    container.classList.toggle('show');
    
    // Initialize Quill editor for bulk add if showing
    if (container.classList.contains('show')) {
        const editorId = type === 'questions' ? 'bulkQuestionsEditor' : 'bulkUpcomingQuestionsEditor';
        
        // Only initialize if not already initialized
        if (!quillEditors[editorId]) {
            quillEditors[editorId] = new Quill(`#${editorId}`, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'color': [] }, { 'background': [] }],
                        ['clean']
                    ]
                },
                placeholder: 'Type or paste your questions here...\n\nExample:\nQ: What is JavaScript?\nA: JavaScript is a programming language...\n\nOr one question per line'
            });
        }
        
        // Pre-populate editor with existing questions
        const editor = quillEditors[editorId];
        if (editor) {
            let existingQuestions = [];
            
            if (type === 'questions') {
                // Get existing questions from current video
                existingQuestions = videoPlaylistData.videoPlaylist[currentEditingIndex].interviewQuestions || [];
            } else if (type === 'upcomingQuestions') {
                // Get existing questions from upcoming topic
                existingQuestions = videoPlaylistData.upcomingTopic.interviewQuestions || [];
            }
            
            // Filter out empty questions and format them
            const formattedText = existingQuestions
                .filter(q => {
                    if (typeof q === 'object') {
                        return q.question && q.question.trim() !== '';
                    }
                    return q && q.trim() !== '';
                })
                .map(q => {
                    if (typeof q === 'object') {
                        const question = q.question || '';
                        const answer = q.answer || '';
                        
                        // Remove HTML tags for plain text display in bulk editor
                        const plainQuestion = question.replace(/<[^>]*>/g, '').trim();
                        const plainAnswer = answer.replace(/<[^>]*>/g, '').trim();
                        
                        if (plainAnswer) {
                            return `Q: ${plainQuestion}\nA: ${plainAnswer}`;
                        } else {
                            return `Q: ${plainQuestion}`;
                        }
                    }
                    return q;
                })
                .join('\n\n');
            
            // Set the existing content in the editor
            if (formattedText) {
                editor.setText(formattedText);
            }
        }
    } else {
        // Clear editor content when closing (cancel)
        const editorId = type === 'questions' ? 'bulkQuestionsEditor' : 'bulkUpcomingQuestionsEditor';
        if (quillEditors[editorId]) {
            quillEditors[editorId].setText('');
        }
    }
}

function applyBulkQuestions() {
    const editor = quillEditors['bulkQuestionsEditor'];
    if (!editor) {
        showToast('Editor not initialized. Please try clicking Bulk Add again.', 'error');
        return;
    }

    const text = editor.getText().trim();
    if (!text) {
        showToast('Please enter at least one question', 'error');
        return;
    }

    const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');

    if (lines.length === 0) {
        showToast('No valid questions found', 'error');
        return;
    }

    // Check if using Q:/A: format
    const hasQAFormat = lines.some(line => line.startsWith('Q:') || line.startsWith('A:'));
    
    const formattedQuestions = [];

    if (hasQAFormat) {
        // Parse Q: and A: format - preserve HTML formatting
        let currentQuestion = null;
        
        lines.forEach(line => {
            if (line.startsWith('Q:')) {
                // Save previous question if exists
                if (currentQuestion) {
                    formattedQuestions.push(currentQuestion);
                }
                // Start new question
                currentQuestion = { 
                    question: line.substring(2).trim(), 
                    answer: '' 
                };
            } else if (line.startsWith('A:')) {
                // Add answer to current question
                if (currentQuestion) {
                    currentQuestion.answer = line.substring(2).trim();
                }
            } else if (currentQuestion && currentQuestion.answer) {
                // Continue multi-line answer
                currentQuestion.answer += '<br>' + line;
            } else if (currentQuestion) {
                // Continue multi-line question
                currentQuestion.question += '<br>' + line;
            }
        });
        
        // Don't forget the last question
        if (currentQuestion) {
            formattedQuestions.push(currentQuestion);
        }
    } else {
        // Simple format: one question per line
        lines.forEach(line => {
            formattedQuestions.push({ 
                question: line, 
                answer: '' 
            });
        });
    }

    if (formattedQuestions.length === 0) {
        showToast('No valid questions found', 'error');
        return;
    }

    // Add all new questions to the current video
    if (!videoPlaylistData.videoPlaylist[currentEditingIndex].interviewQuestions) {
        videoPlaylistData.videoPlaylist[currentEditingIndex].interviewQuestions = [];
    }
    
    videoPlaylistData.videoPlaylist[currentEditingIndex].interviewQuestions.push(...formattedQuestions);
    
    showToast(`Added ${formattedQuestions.length} questions successfully!`, 'success');
    
    // Clear the editor
    editor.setText('');
    
    editVideo(currentEditingIndex);
}

function applyBulkUpcomingQuestions() {
    const editor = quillEditors['bulkUpcomingQuestionsEditor'];
    if (!editor) {
        showToast('Editor not initialized. Please try clicking Bulk Add again.', 'error');
        return;
    }

    const text = editor.getText().trim();
    if (!text) {
        showToast('Please enter at least one question', 'error');
        return;
    }

    const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');

    if (lines.length === 0) {
        showToast('No valid questions found', 'error');
        return;
    }

    // Check if using Q:/A: format
    const hasQAFormat = lines.some(line => line.startsWith('Q:') || line.startsWith('A:'));
    
    const formattedQuestions = [];

    if (hasQAFormat) {
        // Parse Q: and A: format
        let currentQuestion = null;
        
        lines.forEach(line => {
            if (line.startsWith('Q:')) {
                // Save previous question if exists
                if (currentQuestion) {
                    formattedQuestions.push(currentQuestion);
                }
                // Start new question
                currentQuestion = { 
                    question: line.substring(2).trim(), 
                    answer: '' 
                };
            } else if (line.startsWith('A:')) {
                // Add answer to current question
                if (currentQuestion) {
                    currentQuestion.answer = line.substring(2).trim();
                }
            } else if (currentQuestion && currentQuestion.answer) {
                // Continue multi-line answer
                currentQuestion.answer += '<br>' + line;
            } else if (currentQuestion) {
                // Continue multi-line question
                currentQuestion.question += '<br>' + line;
            }
        });
        
        // Don't forget the last question
        if (currentQuestion) {
            formattedQuestions.push(currentQuestion);
        }
    } else {
        // Simple format: one question per line
        lines.forEach(line => {
            formattedQuestions.push({ 
                question: line, 
                answer: '' 
            });
        });
    }

    if (formattedQuestions.length === 0) {
        showToast('No valid questions found', 'error');
        return;
    }

    // Add all new questions to the upcoming topic
    if (!videoPlaylistData.upcomingTopic.interviewQuestions) {
        videoPlaylistData.upcomingTopic.interviewQuestions = [];
    }
    
    videoPlaylistData.upcomingTopic.interviewQuestions.push(...formattedQuestions);
    
    showToast(`Added ${formattedQuestions.length} questions successfully!`, 'success');
    
    // Clear the editor
    editor.setText('');
    
    editUpcomingTopic();
}

// Subtopic functions
function updateSubtopic(index, value) {
    if (!videoPlaylistData.videoPlaylist[currentEditingIndex].subtopics) {
        videoPlaylistData.videoPlaylist[currentEditingIndex].subtopics = [];
    }
    videoPlaylistData.videoPlaylist[currentEditingIndex].subtopics[index] = value;
}

function addSubtopic() {
    if (!videoPlaylistData.videoPlaylist[currentEditingIndex].subtopics) {
        videoPlaylistData.videoPlaylist[currentEditingIndex].subtopics = [];
    }
    videoPlaylistData.videoPlaylist[currentEditingIndex].subtopics.push('');
    editVideo(currentEditingIndex);
}

function removeSubtopic(index) {
    showConfirmModal('⚠️ Are you sure you want to delete this subtopic?', () => {
        videoPlaylistData.videoPlaylist[currentEditingIndex].subtopics.splice(index, 1);
        editVideo(currentEditingIndex);
        showToast('Subtopic deleted successfully', 'success');
    }, {
        title: '🗑️ Delete Subtopic',
        buttonText: 'Delete',
        buttonClass: 'btn btn-danger'
    });
}

// Question functions
function updateQuestion(index, value, field) {
    if (!videoPlaylistData.videoPlaylist[currentEditingIndex].interviewQuestions) {
        videoPlaylistData.videoPlaylist[currentEditingIndex].interviewQuestions = [];
    }
    if (typeof videoPlaylistData.videoPlaylist[currentEditingIndex].interviewQuestions[index] !== 'object') {
        videoPlaylistData.videoPlaylist[currentEditingIndex].interviewQuestions[index] = { question: '', answer: '' };
    }
    videoPlaylistData.videoPlaylist[currentEditingIndex].interviewQuestions[index][field] = value;
}

function addQuestion() {
    if (!videoPlaylistData.videoPlaylist[currentEditingIndex].interviewQuestions) {
        videoPlaylistData.videoPlaylist[currentEditingIndex].interviewQuestions = [];
    }
    videoPlaylistData.videoPlaylist[currentEditingIndex].interviewQuestions.push({ question: '', answer: '' });
    editVideo(currentEditingIndex);
}

function removeQuestion(index) {
    showConfirmModal('⚠️ Are you sure you want to delete this question?', () => {
        videoPlaylistData.videoPlaylist[currentEditingIndex].interviewQuestions.splice(index, 1);
        editVideo(currentEditingIndex);
        showToast('Question deleted successfully', 'success');
    }, {
        title: '🗑️ Delete Question',
        buttonText: 'Delete',
        buttonClass: 'btn btn-danger'
    });
}

// Clear all questions
function clearAllQuestions() {
    showConfirmModal('⚠️ Are you sure you want to clear all questions?', () => {
        videoPlaylistData.videoPlaylist[currentEditingIndex].interviewQuestions = [];
        editVideo(currentEditingIndex);
        showToast('All questions cleared successfully', 'success');
    }, {
        title: '🗑️ Clear All Questions',
        buttonText: 'Ok',
        buttonClass: 'btn btn-danger'
    });
}

// Move question up or down
function moveQuestion(index, direction) {
    const questions = videoPlaylistData.videoPlaylist[currentEditingIndex].interviewQuestions;
    const newIndex = index + direction;

    if (newIndex >= 0 && newIndex < questions.length) {
        const [movedQuestion] = questions.splice(index, 1);
        questions.splice(newIndex, 0, movedQuestion);
        editVideo(currentEditingIndex);
    }
}

// Upcoming topic functions
function updateUpcomingSubtopic(index, value) {
    videoPlaylistData.upcomingTopic.subtopics[index] = value;
}

function addUpcomingSubtopic() {
    videoPlaylistData.upcomingTopic.subtopics.push('');
    editUpcomingTopic();
}

function removeUpcomingSubtopic(index) {
    showConfirmModal('⚠️ Are you sure you want to delete this upcoming subtopic?', () => {
        videoPlaylistData.upcomingTopic.subtopics.splice(index, 1);
        editUpcomingTopic();
        showToast('Upcoming subtopic deleted successfully', 'success');
    }, {
        title: '🗑️ Delete Upcoming Subtopic',
        buttonText: 'Delete',
        buttonClass: 'btn btn-danger'
    });
}

function updateUpcomingQuestion(index, value, field) {
    if (!videoPlaylistData.upcomingTopic.interviewQuestions) {
        videoPlaylistData.upcomingTopic.interviewQuestions = [];
    }
    if (typeof videoPlaylistData.upcomingTopic.interviewQuestions[index] !== 'object') {
        videoPlaylistData.upcomingTopic.interviewQuestions[index] = { question: '', answer: '' };
    }
    videoPlaylistData.upcomingTopic.interviewQuestions[index][field] = value;
}

function addUpcomingQuestion() {
    videoPlaylistData.upcomingTopic.interviewQuestions.push({ question: '', answer: '' });
    editUpcomingTopic();
}

function removeUpcomingQuestion(index) {
    showConfirmModal('⚠️ Are you sure you want to delete this upcoming question?', () => {
        videoPlaylistData.upcomingTopic.interviewQuestions.splice(index, 1);
        editUpcomingTopic();
        showToast('Upcoming question deleted successfully', 'success');
    }, {
        title: '🗑️ Delete Upcoming Question',
        buttonText: 'Delete',
        buttonClass: 'btn btn-danger'
    });
}

// Clear all upcoming questions
function clearAllUpcomingQuestions() {
    showConfirmModal('⚠️ Are you sure you want to clear all upcoming questions?', () => {
        videoPlaylistData.upcomingTopic.interviewQuestions = [];
        editUpcomingTopic();
        showToast('All upcoming questions cleared successfully', 'success');
    }, {
        title: '🗑️ Clear All Upcoming Questions',
        buttonText: 'Ok',
        buttonClass: 'btn btn-danger'
    });
}

// Move upcoming question up or down
function moveUpcomingQuestion(index, direction) {
    const questions = videoPlaylistData.upcomingTopic.interviewQuestions;
    const newIndex = index + direction;

    if (newIndex >= 0 && newIndex < questions.length) {
        const [movedQuestion] = questions.splice(index, 1);
        questions.splice(newIndex, 0, movedQuestion);
        editUpcomingTopic();
    }
}

// Copy upcoming topic content to a selected video
async function copyUpcomingToLatestVideo() {
    if (!videoPlaylistData.upcomingTopic) {
        showToast('No upcoming topic to copy!', 'error');
        return;
    }

    if (videoPlaylistData.videoPlaylist.length === 0) {
        showToast('No videos available to copy to!', 'error');
        return;
    }

    // Count valid content
    const subtopicsCount = videoPlaylistData.upcomingTopic.subtopics?.filter(s => s.trim()).length || 0;
    const questionsCount = videoPlaylistData.upcomingTopic.interviewQuestions?.filter(q => q.question?.trim()).length || 0;

    // Create video selection dropdown
    const videoOptions = videoPlaylistData.videoPlaylist.map((video, index) => 
        `<option value="${index}">Day ${index + 1}: ${video.title || 'Untitled'}</option>`
    ).join('');

    // Show custom modal with video selection
    const modalBody = document.getElementById('confirmModalBody');
    const modalTitle = document.getElementById('confirmModalLabel');
    const confirmBtn = document.getElementById('confirmModalBtn');
    
    modalTitle.textContent = '📋 Copy "Coming Soon" Content';
    confirmBtn.textContent = 'Copy';
    confirmBtn.className = 'btn btn-primary';
    
    modalBody.innerHTML = `
        <div style="text-align: left;">
            <p style="margin-bottom: 15px;">This will copy:</p>
            <ul style="margin-bottom: 20px;">
                <li><strong>${subtopicsCount}</strong> subtopics</li>
                <li><strong>${questionsCount}</strong> interview questions</li>
            </ul>
            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px;">
                    Select target video:
                </label>
                <select id="targetVideoSelect" class="form-select" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem;">
                    ${videoOptions}
                </select>
            </div>
            <p style="color: #666; font-size: 0.9rem; margin-top: 15px;">
                ℹ️ The current content of the selected video will be preserved.
            </p>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    
    // Remove old event listeners by cloning the button
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Add new event listener
    newConfirmBtn.addEventListener('click', async () => {
        const selectedIndex = parseInt(document.getElementById('targetVideoSelect').value);
        const targetVideo = videoPlaylistData.videoPlaylist[selectedIndex];
        
        modal.hide();
        
        // Copy subtopics (filter out empty ones)
        const upcomingSubtopics = (videoPlaylistData.upcomingTopic.subtopics || [])
            .filter(topic => topic && topic.trim() !== '');
        
        // Copy interview questions (filter out empty ones)
        const upcomingQuestions = (videoPlaylistData.upcomingTopic.interviewQuestions || [])
            .filter(q => {
                if (!q) return false;
                if (typeof q === 'string') return q.trim() !== '';
                if (typeof q === 'object') return q.question && q.question.trim() !== '';
                return false;
            })
            .map(q => {
                // Deep clone to avoid reference issues
                if (typeof q === 'string') {
                    return { question: q, answer: '' };
                }
                return { question: q.question, answer: q.answer || '' };
            });

        // Initialize arrays if they don't exist
        if (!targetVideo.subtopics) targetVideo.subtopics = [];
        if (!targetVideo.interviewQuestions) targetVideo.interviewQuestions = [];

        // Add the copied content
        targetVideo.subtopics.push(...upcomingSubtopics);
        targetVideo.interviewQuestions.push(...upcomingQuestions);

        // Save to server
        const success = await saveToServer();
        
        if (success) {
            showToast(
                `✅ Successfully copied ${upcomingSubtopics.length} subtopics and ${upcomingQuestions.length} questions to Day ${selectedIndex + 1}!`,
                'success'
            );
            
            // Switch to the selected video to show the changes
            editVideo(selectedIndex);
        }
    });
    
    modal.show();
}

// Save current video
async function saveCurrentVideo() {
    await saveToServer();
    showToast('Changes saved successfully!', 'success');
    renderVideoList();
}

// Delete video
async function deleteVideo(index) {
    showConfirmModal('Are you sure you want to delete this video?', async () => {
        videoPlaylistData.videoPlaylist.splice(index, 1);
        currentEditingIndex = null;
        
        await saveToServer();
        
        renderVideoList();
        document.getElementById('editorPanel').innerHTML = `
            <div class="empty-state">
                <h3>Video deleted</h3>
                <p>Select another video to edit or add a new one</p>
            </div>
        `;
        showToast('Video deleted successfully', 'success');
    }, {
        title: '🗑️ Delete Video',
        buttonText: 'Delete',
        buttonClass: 'btn btn-danger'
    });
}

// Save to server (only save subtopics and interview questions, not YouTube data)
async function saveToServer() {
    try {
        // Save to IndexedDB first
        try {
            await saveRoadmapToIndexedDB(videoPlaylistData);
            console.log('✅ Data saved to IndexedDB');
        } catch (dbError) {
            console.error('Error saving to IndexedDB:', dbError);
            showToast('⚠️ Warning: Could not save to local database', 'warning');
        }

        // Prepare published videos data
        const publishedVideos = [];
        
        videoPlaylistData.videoPlaylist.forEach((video) => {
            // Only include videos with valid YouTube videoId
            if (video.videoId && !video.videoId.startsWith('upcoming-')) {
                const validSubtopics = (video.subtopics || [])
                    .filter(topic => topic && topic.trim() !== '');
                
                const validQuestions = (video.interviewQuestions || [])
                    .filter(q => {
                        if (!q) return false;
                        if (typeof q === 'string') return q.trim() !== '';
                        if (typeof q === 'object') return q.question && q.question.trim() !== '';
                        return false;
                    })
                    .map(q => {
                        if (typeof q === 'string') {
                            return { question: q, answer: '' };
                        }
                        return q;
                    });
                
                publishedVideos.push({
                    videoId: video.videoId,
                    title: video.title,
                    subtopics: validSubtopics,
                    interviewQuestions: validQuestions
                });
            }
        });

        // Prepare upcoming topic data (single topic only)
        let upcomingTopicData = null;
        if (videoPlaylistData.upcomingTopic && videoPlaylistData.upcomingTopic.title?.trim()) {
            const validSubtopics = (videoPlaylistData.upcomingTopic.subtopics || [])
                .filter(topic => topic && topic.trim() !== '');
            
            const validQuestions = (videoPlaylistData.upcomingTopic.interviewQuestions || [])
                .filter(q => {
                    if (!q) return false;
                    if (typeof q === 'string') return q.trim() !== '';
                    if (typeof q === 'object') return q.question && q.question.trim() !== '';
                    return false;
                })
                .map(q => {
                    if (typeof q === 'string') {
                        return { question: q, answer: '' };
                    }
                    return q;
                });
            
            upcomingTopicData = {
                title: videoPlaylistData.upcomingTopic.title.trim(),
                description: videoPlaylistData.upcomingTopic.description?.trim() || '',
                subtopics: validSubtopics,
                interviewQuestions: validQuestions,
                estimatedDate: videoPlaylistData.upcomingTopic.estimatedDate || new Date().toISOString().split('T')[0]
            };
        }

        // Prepare data to send
        const dataToSave = {
            channelName: videoPlaylistData.channelName,
            channelLogo: videoPlaylistData.channelLogo,
            videoPlaylist: publishedVideos,
            upcomingTopic: upcomingTopicData
        };

        console.log('💾 Saving to MongoDB:', {
            publishedVideos: publishedVideos.length,
            upcomingTopic: upcomingTopicData ? upcomingTopicData.title : 'None'
        });

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSave)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error('Failed to save to server: ' + errorText);
        }
        
        const result = await response.json();
        console.log('✅ Save successful:', result);
        
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        showToast('❌ Error saving data! ' + error.message, 'error');
        return false;
    }
}

// Save all data
async function saveAllData() {
    const success = await saveToServer();
    if (success) {
        showToast('All changes saved to roadmap.json file!', 'success');
    }
}

// Download JSON (backup) - now includes option to export from IndexedDB
async function downloadJSON() {
    try {
        // Get fresh data from IndexedDB
        const indexedDBData = await loadRoadmapFromIndexedDB();
        
        const dataToExport = indexedDBData || videoPlaylistData;
        
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roadmap_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('✅ Backup downloaded from IndexedDB!', 'success');
    } catch (error) {
        console.error('Error downloading backup:', error);
        // Fallback to current data
        const dataStr = JSON.stringify(videoPlaylistData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roadmap_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('✅ Backup downloaded!', 'success');
    }
}

// Clear all data from IndexedDB (useful for debugging/reset)
async function clearIndexedDBData() {
    showConfirmModal(
        `<div style="text-align: left;">
            <p><strong>This will:</strong></p>
            <ul style="margin: 15px 0;">
                <li>Clear all cached data from IndexedDB</li>
                <li>Reload fresh data from MongoDB</li>
                <li>Fix any sync issues</li>
            </ul>
            <p style="color: #666; margin-top: 15px;">
                ℹ️ This is useful if you're seeing outdated data or the "Coming Soon" section is missing.
            </p>
        </div>`,
        async () => {
            try {
                await clearRoadmapFromIndexedDB();
                showToast('🔄 Cache cleared! Reloading fresh data...', 'success');
                
                // Reload data from MongoDB
                await loadData();
            } catch (error) {
                console.error('Error clearing IndexedDB:', error);
                showToast('❌ Error clearing data: ' + error.message, 'error');
            }
        },
        {
            title: '🗑️ Clear Cache & Reload',
            buttonText: 'Clear & Reload',
            buttonClass: 'btn btn-warning'
        }
    );
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// Show confirmation modal for delete actions
function showConfirmModal(message, onConfirm, options = {}) {
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const modalBody = document.getElementById('confirmModalBody');
    const modalTitle = document.getElementById('confirmModalLabel');
    const confirmBtn = document.getElementById('confirmModalBtn');
    
    // Set custom title and button text, or use defaults
    modalTitle.textContent = options.title || '⚠️ Confirm Action';
    confirmBtn.textContent = options.buttonText || 'Confirm';
    confirmBtn.className = options.buttonClass || 'btn btn-danger';
    
    modalBody.innerHTML = typeof message === 'string' 
        ? `<p>${message}</p>` 
        : message;
    
    // Remove old event listeners by cloning the button
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Add new event listener
    newConfirmBtn.addEventListener('click', () => {
        modal.hide();
        onConfirm();
    });
    
    modal.show();
}

// Toggle comments section
async function toggleComments(index) {
    const commentsSection = document.getElementById(`commentsSection${index}`);
    const button = document.getElementById(`btnComments${index}`);
    
    if (commentsSection.style.display === 'none') {
        // Show comments section
        commentsSection.style.display = 'block';
        button.textContent = '🔼 Hide Comments';
        button.classList.add('active');
        
        // Fetch comments if not already loaded
        if (commentsSection.innerHTML.includes('Loading')) {
            const video = videoPlaylistData.videoPlaylist[index];
            const comments = await fetchVideoComments(video.videoId, 10);
            
            if (comments.length > 0) {
                commentsSection.innerHTML = `
                    <h4 style="margin-bottom: 15px; color: #667eea;">💬 Latest Comments (${comments.length})</h4>
                    ${comments.map(comment => `
                        <div class="comment-item">
                            <img src="${comment.authorProfileImage}" alt="${comment.author}" class="comment-avatar">
                            <div class="comment-content">
                                <div class="comment-header">
                                    <span class="comment-author">${comment.author}</span>
                                    <span class="comment-time">${formatRelativeTime(comment.publishedAt)}</span>
                                </div>
                                <div class="comment-text">${comment.text}</div>
                                <div class="comment-footer">
                                    <span class="comment-likes">👍 ${comment.likeCount > 0 ? formatNumber(comment.likeCount) : ''}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    <a href="${video.videoUrl}" target="_blank" class="view-all-comments">
                        View all comments on YouTube →
                    </a>
                `;
            } else {
                commentsSection.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No comments available or comments are disabled for this video.</p>';
            }
        }
    } else {
        // Hide comments section
        commentsSection.style.display = 'none';
        button.textContent = '📝 View Latest Comments';
        button.classList.remove('active');
    }
}

// Delete upcoming topic
async function deleteUpcomingTopic() {
    showConfirmModal('Are you sure you want to clear the upcoming topic?', async () => {
        // Don't delete, just clear/empty all fields
        videoPlaylistData.upcomingTopic = {
            title: '',
            description: '',
            subtopics: [''],
            interviewQuestions: [{ question: '', answer: '' }],
            estimatedDate: new Date().toISOString().split('T')[0]
        };
        
        await saveToServer();
        
        renderVideoList();
        
        // Reload the empty upcoming topic form
        editUpcomingTopic();
        
        showToast('Upcoming topic cleared successfully', 'success');
    }, {
        title: '🗑️ Clear Upcoming Topic',
        buttonText: 'Ok',
        buttonClass: 'btn btn-danger'
    });
}

// ==================== MANUAL SYNC WITH MONGODB ====================
/**
 * Manual sync button function - allows users to manually trigger MongoDB sync
 * Shows loader during sync and toast notification on completion
 */
async function manualSyncWithMongoDB() {
    const syncStatus = document.getElementById('syncStatus');
    const syncStatusText = document.getElementById('syncStatusText');
    
    try {
        // Show syncing status
        if (syncStatus) {
            syncStatus.style.display = 'flex';
            syncStatus.className = 'sync-status syncing';
        }
        if (syncStatusText) {
            syncStatusText.textContent = 'Syncing with MongoDB...';
        }
        
        console.log('🔄 Manual sync initiated...');
        
        // Check if adminAPI is available
        if (typeof adminAPI === 'undefined') {
            throw new Error('Admin API not loaded');
        }
        
        // Fetch complete roadmap including upcomingTopic
        const roadmapData = await adminAPI.getCompleteRoadmap();
        const apiVideos = roadmapData.videoPlaylist || [];
        
        if (!apiVideos || apiVideos.length === 0) {
            throw new Error('No videos found in MongoDB');
        }
        
        console.log(`🌐 Fetched ${apiVideos.length} videos from MongoDB`);
        
        // Merge MongoDB data with YouTube data
        videoPlaylistData.videoPlaylist = youtubeVideos.map((video, index) => {
            const apiVideo = apiVideos.find(v => v.videoId === video.videoId) || apiVideos[index] || {};
            const interviewQuestions = (apiVideo.interviewQuestions || []).map(q => {
                if (typeof q === 'string') return { question: q, answer: '' };
                return q;
            });
            
            return {
                ...video,
                _id: apiVideo._id,
                subtopics: apiVideo.subtopics || [''],
                interviewQuestions: interviewQuestions.length > 0 ? interviewQuestions : [{ question: '', answer: '' }]
            };
        });
        
        // Load single upcomingTopic from MongoDB
        if (roadmapData.upcomingTopic && roadmapData.upcomingTopic.title) {
            console.log('🔔 Loading upcoming topic from MongoDB:', roadmapData.upcomingTopic.title);
            videoPlaylistData.upcomingTopic = {
                ...roadmapData.upcomingTopic,
                interviewQuestions: (roadmapData.upcomingTopic.interviewQuestions || []).map(q => {
                    if (typeof q === 'string') return { question: q, answer: '' };
                    return q;
                })
            };
        } else {
            console.log('📭 No upcoming topic found in MongoDB');
            videoPlaylistData.upcomingTopic = null;
        }
        
        // Update IndexedDB with fresh data
        await saveRoadmapToIndexedDB(videoPlaylistData);
        console.log('💾 IndexedDB updated with MongoDB data');
        
        // Refresh UI
        renderVideoList();
        
        // Show success status
        if (syncStatus) {
            syncStatus.className = 'sync-status success';
        }
        if (syncStatusText) {
            syncStatusText.textContent = '✓ Synced successfully!';
        }
        showToast('✅ Successfully synced with MongoDB', 'success');
        
        // Hide status after 3 seconds
        setTimeout(() => {
            if (syncStatus) {
                syncStatus.style.display = 'none';
            }
        }, 3000);
        
    } catch (error) {
        console.error('❌ Manual sync failed:', error);
        
        // Show error status
        if (syncStatus) {
            syncStatus.className = 'sync-status error';
        }
        if (syncStatusText) {
            syncStatusText.textContent = '✕ Sync failed';
        }
        showToast('❌ Sync failed: ' + error.message, 'error');
        
        // Hide status after 5 seconds
        setTimeout(() => {
            if (syncStatus) {
                syncStatus.style.display = 'none';
            }
        }, 5000);
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', loadData);
