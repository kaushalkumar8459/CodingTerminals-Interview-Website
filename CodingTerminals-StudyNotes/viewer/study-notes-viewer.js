// ==================== STUDY NOTES VIEWER WITH OFFLINE-FIRST ARCHITECTURE ====================
// Global Variables
let allNotes = [];
let filteredNotes = [];
let currentNoteIndex = null;
let categories = [];
let studyNotesDB = null; // IndexedDB instance

// IndexedDB Configuration
const STUDY_NOTES_DB_NAME = 'CodingTerminalsStudyNotesDB';
const STUDY_NOTES_DB_VERSION = 1;
const STUDY_NOTES_STORE = 'studyNotes';

// ==================== INDEXEDDB SETUP ====================
async function initializeStudyNotesDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(STUDY_NOTES_DB_NAME, STUDY_NOTES_DB_VERSION);

        request.onupgradeneeded = (event) => {
            studyNotesDB = event.target.result;
            
            if (!studyNotesDB.objectStoreNames.contains(STUDY_NOTES_STORE)) {
                const store = studyNotesDB.createObjectStore(STUDY_NOTES_STORE, { keyPath: '_id' });
                store.createIndex('category', 'category', { unique: false });
                store.createIndex('createdAt', 'createdAt', { unique: false });
                console.log('📦 Created Study Notes object store');
            }
        };

        request.onsuccess = (event) => {
            studyNotesDB = event.target.result;
            console.log('✅ Study Notes IndexedDB initialized');
            resolve(studyNotesDB);
        };

        request.onerror = () => {
            console.error('❌ IndexedDB initialization failed:', request.error);
            reject(request.error);
        };
    });
}

// Save notes to IndexedDB
async function saveNotesToIndexedDB(notes) {
    return new Promise((resolve, reject) => {
        const transaction = studyNotesDB.transaction([STUDY_NOTES_STORE], 'readwrite');
        const store = transaction.objectStore(STUDY_NOTES_STORE);
        
        // Clear existing data
        store.clear();
        
        // Add all notes
        notes.forEach(note => {
            store.put({
                ...note,
                lastSyncedAt: new Date().toISOString()
            });
        });

        transaction.oncomplete = () => {
            console.log(`💾 Saved ${notes.length} notes to IndexedDB`);
            resolve(true);
        };

        transaction.onerror = () => {
            console.error('❌ Error saving to IndexedDB:', transaction.error);
            reject(transaction.error);
        };
    });
}

// Load notes from IndexedDB
async function loadNotesFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const transaction = studyNotesDB.transaction([STUDY_NOTES_STORE], 'readonly');
        const store = transaction.objectStore(STUDY_NOTES_STORE);
        const request = store.getAll();

        request.onsuccess = () => {
            console.log(`📂 Loaded ${request.result.length} notes from IndexedDB`);
            resolve(request.result || []);
        };

        request.onerror = () => {
            console.error('❌ Error reading from IndexedDB:', request.error);
            reject(request.error);
        };
    });
}

// ==================== INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', async () => {
    await initializeStudyNotesDB();
    loadStudyNotes();
});

// ==================== LOAD NOTES WITH OFFLINE-FIRST ARCHITECTURE ====================
async function loadStudyNotes() {
    try {
        console.log('🚀 Starting offline-first load...');
        
        // ==================== STEP 1: CHECK INDEXEDDB (CACHE-FIRST) ====================
        const cachedNotes = await loadNotesFromIndexedDB();
        
        if (cachedNotes && cachedNotes.length > 0) {
            console.log('📂 Loading from IndexedDB cache...');
            
            // STEP 1A: Display cached data INSTANTLY
            allNotes = cachedNotes;
            filteredNotes = [...allNotes];
            
            // Extract categories from cached data
            categories = [...new Set(allNotes.map(note => note.category).filter(Boolean))];
            
            populateCategoryFilter();
            renderNotesList();
            updateNotesCount();
            
            console.log(`✅ Rendered ${allNotes.length} notes from cache (INSTANT LOAD)`);
            
            // Show sync indicator
            showSyncIndicator('Checking for updates...');
        } else {
            console.log('📭 No cache found, showing loading state...');
            showLoading(true);
        }

        // ==================== STEP 2: FETCH FROM API (BACKGROUND) ====================
        console.log('🔄 Fetching latest data from API in background...');
        
        try {
            const response = await fetch(APP_CONFIG.API.BASE_URL + APP_CONFIG.API.ENDPOINTS.STUDY_NOTES);
            
            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            const freshNotes = data.notes || [];
            
            if (freshNotes.length > 0) {
                console.log(`🌐 Fetched ${freshNotes.length} notes from API`);
                
                // STEP 2A: Save to IndexedDB (background sync)
                await saveNotesToIndexedDB(freshNotes);
                
                // STEP 2B: Update UI with fresh data (silent refresh)
                allNotes = freshNotes;
                filteredNotes = [...allNotes];
                categories = data.categories || [...new Set(allNotes.map(note => note.category).filter(Boolean))];
                
                populateCategoryFilter();
                renderNotesList();
                updateNotesCount();
                
                console.log('✅ UI updated with latest data from API');
                showSyncIndicator('✓ Up to date', true);
                
                // Hide sync indicator after 2 seconds
                setTimeout(hideSyncIndicator, 2000);
            } else {
                throw new Error('No notes found in API');
            }
            
            showLoading(false);
            
        } catch (apiError) {
            console.warn('⚠️ API fetch failed:', apiError.message);
            
            // If we had cache, we already showed it
            if (cachedNotes && cachedNotes.length > 0) {
                showSyncIndicator('⚠ Using cached data (offline)', false);
                setTimeout(hideSyncIndicator, 3000);
            } else {
                // No cache and no API - show error
                showLoading(false);
                showError('Failed to load study notes. Please check your connection and try again.');
            }
        }
        
    } catch (error) {
        console.error('❌ Error loading study notes:', error);
        showLoading(false);
        showError('Failed to load study notes. Please make sure the server is running.');
    }
}

// ==================== SYNC INDICATOR FUNCTIONS ====================
function showSyncIndicator(message, success = true) {
    let indicator = document.getElementById('syncIndicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'syncIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${success ? '#4caf50' : '#ff9800'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(indicator);
    }
    
    indicator.textContent = message;
    indicator.style.background = success ? '#4caf50' : '#ff9800';
    indicator.style.display = 'block';
}

function hideSyncIndicator() {
    const indicator = document.getElementById('syncIndicator');
    if (indicator) {
        indicator.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 300);
    }
}

// ==================== RENDER NOTES LIST ====================
function renderNotesList() {
    const container = document.getElementById('notesListContainer');
    
    if (filteredNotes.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <div class="text-4xl mb-2">📭</div>
                <p class="text-sm">No notes found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredNotes.map((note, index) => `
        <div onclick="displayNote(${index})" 
             class="p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                 currentNoteIndex === index 
                 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500 shadow-lg' 
                 : 'bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300 hover:shadow-md'
             }">
            <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                    <div class="font-semibold text-sm truncate ${currentNoteIndex === index ? 'text-white' : 'text-purple-900'}">
                        ${note.title || 'Untitled Note'}
                    </div>
                    <div class="text-xs mt-1 flex items-center gap-2 ${currentNoteIndex === index ? 'text-purple-100' : 'text-purple-600'}">
                        <span>📄</span>
                        <span>${note.date || ''}</span>
                    </div>
                    ${note.category ? `
                        <div class="text-xs mt-2">
                            <span class="px-2 py-1 rounded-full ${currentNoteIndex === index ? 'bg-white text-purple-600' : 'bg-purple-200 text-purple-700'}">
                                ${note.category}
                            </span>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// ==================== DISPLAY NOTE ====================
function displayNote(index) {
    currentNoteIndex = index;
    const note = filteredNotes[index];
    const container = document.getElementById('noteDisplayContainer');
    
    // Re-render list to update active state
    renderNotesList();
    
    // Display note content
    container.innerHTML = `
        <div class="space-y-4">
            <!-- Note Header -->
            <div class="border-b-2 border-purple-200 pb-4">
                <h1 class="text-3xl font-bold text-gray-800 mb-2">${note.title || 'Untitled Note'}</h1>
                <div class="flex flex-wrap gap-3 text-sm text-gray-600">
                    <span class="flex items-center gap-1">
                        <span class="text-lg">📅</span>
                        <span>${note.date || 'No date'}</span>
                    </span>
                    ${note.category ? `
                        <span class="flex items-center gap-1">
                            <span class="text-lg">📂</span>
                            <span>${note.category}</span>
                        </span>
                    ` : ''}
                    ${note.tags && note.tags.length > 0 ? `
                        <span class="flex items-center gap-1">
                            <span class="text-lg">🏷️</span>
                            <span>${note.tags.join(', ')}</span>
                        </span>
                    ` : ''}
                </div>
            </div>
            
            <!-- Note Content -->
            <div class="note-content text-gray-700">
                ${note.content || '<p class="text-gray-400 italic">No content available</p>'}
            </div>
            
            <!-- Note Footer -->
            <div class="border-t-2 border-purple-200 pt-4 mt-8">
                <div class="flex justify-between items-center">
                    <button onclick="displayPreviousNote()" 
                            class="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all ${currentNoteIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                            ${currentNoteIndex === 0 ? 'disabled' : ''}>
                        ← Previous Note
                    </button>
                    <button onclick="displayNextNote()" 
                            class="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all ${currentNoteIndex === filteredNotes.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                            ${currentNoteIndex === filteredNotes.length - 1 ? 'disabled' : ''}>
                        Next Note →
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Scroll to top
    container.scrollTop = 0;
}

// ==================== NAVIGATION ====================
function displayPreviousNote() {
    if (currentNoteIndex > 0) {
        displayNote(currentNoteIndex - 1);
    }
}

function displayNextNote() {
    if (currentNoteIndex < filteredNotes.length - 1) {
        displayNote(currentNoteIndex + 1);
    }
}

// ==================== SEARCH FUNCTIONALITY ====================
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        // Reset to all notes if search is empty
        filteredNotes = [...allNotes];
        updateSearchResultsInfo('');
    } else {
        // Filter notes based on search term
        filteredNotes = allNotes.filter(note => {
            const titleMatch = (note.title || '').toLowerCase().includes(searchTerm);
            const contentMatch = (note.content || '').toLowerCase().includes(searchTerm);
            const categoryMatch = (note.category || '').toLowerCase().includes(searchTerm);
            const tagsMatch = (note.tags || []).some(tag => tag.toLowerCase().includes(searchTerm));
            
            return titleMatch || contentMatch || categoryMatch || tagsMatch;
        });
        
        updateSearchResultsInfo(`Found ${filteredNotes.length} note(s) matching "${searchTerm}"`);
    }
    
    // Apply current category filter
    applyCategoryFilter();
    
    // Re-render list
    currentNoteIndex = null;
    renderNotesList();
    updateNotesCount();
    
    // Clear note display if no results
    if (filteredNotes.length === 0) {
        showNoResults();
    }
}

// ==================== CATEGORY FILTER ====================
function populateCategoryFilter() {
    const select = document.getElementById('categoryFilter');
    
    // Keep "All Categories" option and add others
    const currentHTML = '<option value="all">📂 All Categories</option>';
    const categoriesHTML = categories.map(cat => 
        `<option value="${cat}">${cat}</option>`
    ).join('');
    
    select.innerHTML = currentHTML + categoriesHTML;
}

function handleCategoryFilter() {
    applyCategoryFilter();
    renderNotesList();
    updateNotesCount();
    currentNoteIndex = null;
    
    const category = document.getElementById('categoryFilter').value;
    if (category !== 'all') {
        updateSearchResultsInfo(`Showing notes in category: ${category}`);
    } else {
        updateSearchResultsInfo('');
    }
}

function applyCategoryFilter() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    if (selectedCategory !== 'all') {
        filteredNotes = filteredNotes.filter(note => note.category === selectedCategory);
    }
}

// ==================== SORT FUNCTIONALITY ====================
function handleSort() {
    const sortOrder = document.getElementById('sortOrder').value;
    
    switch(sortOrder) {
        case 'newest':
            filteredNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            filteredNotes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'title':
            filteredNotes.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
            break;
    }
    
    currentNoteIndex = null;
    renderNotesList();
}

// ==================== UI HELPERS ====================
function updateNotesCount() {
    document.getElementById('notesCount').textContent = `(${filteredNotes.length})`;
}

function updateSearchResultsInfo(message) {
    const infoElement = document.getElementById('searchResultsInfo');
    if (message) {
        infoElement.textContent = message;
        infoElement.classList.remove('hidden');
    } else {
        infoElement.textContent = '';
        infoElement.classList.add('hidden');
    }
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.classList.remove('hidden');
    } else {
        spinner.classList.add('hidden');
    }
}

function showEmptyState() {
    const container = document.getElementById('noteDisplayContainer');
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center">
            <div class="text-6xl mb-4">📭</div>
            <h3 class="text-2xl font-bold text-gray-700 mb-2">No Study Notes Yet</h3>
            <p class="text-gray-500">Notes created by admin will appear here</p>
        </div>
    `;
}

function showNoResults() {
    const container = document.getElementById('noteDisplayContainer');
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center">
            <div class="text-6xl mb-4">🔍</div>
            <h3 class="text-2xl font-bold text-gray-700 mb-2">No Results Found</h3>
            <p class="text-gray-500">Try adjusting your search or filters</p>
        </div>
    `;
}

function showError(message) {
    const container = document.getElementById('noteDisplayContainer');
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center">
            <div class="text-6xl mb-4">⚠️</div>
            <h3 class="text-2xl font-bold text-red-600 mb-2">Error</h3>
            <p class="text-gray-600">${message}</p>
            <button onclick="loadStudyNotes()" class="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all">
                🔄 Retry
            </button>
        </div>
    `;
}
