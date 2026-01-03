// ==================== STUDY NOTES VIEWER ====================
// Global Variables
let allNotes = [];
let filteredNotes = [];
let currentNoteIndex = null;
let categories = [];

// ==================== INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', () => {
    loadStudyNotes();
});

// ==================== LOAD NOTES FROM API ====================
async function loadStudyNotes() {
    showLoading(true);
    try {
        console.log('🔄 Loading study notes from API...');
        
        // Fetch notes from server API
        const response = await fetch(APP_CONFIG.API.BASE_URL + APP_CONFIG.API.ENDPOINTS.STUDY_NOTES);
        
        if (!response.ok) {
            throw new Error('Failed to load notes');
        }

        const result = await response.json();
        console.log('✅ API Response:', result);
        
        // ✅ FIXED: Handle the actual API response format
        if (result.success && result.data) {
            allNotes = result.data || [];
        } else {
            // Fallback for old format
            allNotes = result.notes || result.data || [];
        }
        
        filteredNotes = [...allNotes];
        
        // Extract unique categories from notes
        categories = [...new Set(allNotes.map(note => note.category).filter(Boolean))];
        
        console.log(`📚 Loaded ${allNotes.length} notes with ${categories.length} categories`);

        // Populate category filter
        populateCategoryFilter();
        
        // Render notes list
        renderNotesList();
        
        // Update count
        updateNotesCount();
        
        showLoading(false);
        
        if (allNotes.length === 0) {
            showEmptyState();
        } else {
            // Auto-select first note
            displayNote(0);
        }
    } catch (error) {
        console.error('❌ Error loading study notes:', error);
        showLoading(false);
        showError('Failed to load study notes. Please make sure the server is running.');
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
