// ==================== STUDY NOTES APPLICATION WITH INDEXEDDB ====================
// Global Variables
let studyNotesData = {
    notes: []
};

let currentEditingNoteIndex = null;
let noteQuillEditor = null;
let confirmModalCallback = null;
let db = null; // IndexedDB instance

// IndexedDB Configuration - Use centralized config
const DB_NAME = APP_CONFIG.INDEXEDDB.DB_NAME;
const DB_VERSION = APP_CONFIG.INDEXEDDB.DB_VERSION;
const STORE_NAME = APP_CONFIG.INDEXEDDB.STORES.STUDY_NOTES;

// ==================== INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', () => {
    initializeIndexedDB();
});

// ==================== INDEXEDDB SETUP ====================
/**
 * Initialize IndexedDB
 * Creates database and object store if they don't exist
 */
function initializeIndexedDB() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Handle database upgrade (first time or version change)
    request.onupgradeneeded = function(event) {
        db = event.target.result;
        
        console.log('🔄 Upgrading database...', 'Current stores:', db.objectStoreNames);
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            const objectStore = db.createObjectStore(STORE_NAME, { keyPath: '_id' });
            
            // Create indexes for better query performance
            objectStore.createIndex('title', 'title', { unique: false });
            objectStore.createIndex('category', 'category', { unique: false });
            objectStore.createIndex('date', 'date', { unique: false });
            objectStore.createIndex('createdAt', 'createdAt', { unique: false });
            
            console.log('✅ IndexedDB object store created:', STORE_NAME);
        } else {
            console.log('ℹ️ Object store already exists:', STORE_NAME);
        }
    };

    // Handle success
    request.onsuccess = function(event) {
        db = event.target.result;
        
        // Check if the required object store exists
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            console.error('❌ Object store not found:', STORE_NAME);
            console.log('Available stores:', Array.from(db.objectStoreNames));
            
            // Close and delete the database, then retry
            db.close();
            showToast('⚠️ Recreating database...', 'warning');
            
            const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
            deleteRequest.onsuccess = function() {
                console.log('🗑️ Old database deleted, reinitializing...');
                setTimeout(() => initializeIndexedDB(), 500);
            };
            deleteRequest.onerror = function() {
                console.error('❌ Failed to delete database');
                showToast('Database error. Please refresh the page.', 'error');
            };
            return;
        }
        
        console.log('✅ IndexedDB initialized successfully');
        console.log('Available stores:', Array.from(db.objectStoreNames));
        loadStudyNotes();
    };

    // Handle error
    request.onerror = function(event) {
        console.error('❌ IndexedDB initialization failed:', event.target.error);
        showToast('Database initialization failed. Using fallback storage.', 'error');
        loadStudyNotesFromJSON(); // Fallback to loading from JSON
    };
}

// ==================== AUTHENTICATION ====================
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        window.location.href = './../../auth/login.html';
    }
}

// ==================== DATA MANAGEMENT ====================
/**
 * Load study notes from IndexedDB
 * If empty, load sample data from JSON file
 */
async function loadStudyNotes() {
    try {
        const notes = await getAllNotesFromIndexedDB();
        
        if (notes.length > 0) {
            // Load from IndexedDB
            studyNotesData.notes = notes;
            renderNotesList();
            showToast('📚 Notes loaded from IndexedDB', 'info');
        } else {
            // First time - load sample data from JSON
            await loadStudyNotesFromJSON();
        }
    } catch (error) {
        console.error('Error loading study notes:', error);
        showToast('⚠️ Error loading notes', 'error');
        renderNotesList();
    }
}

/**
 * Load sample notes from JSON file (first time only)
 */
async function loadStudyNotesFromJSON() {
    try {
        const response = await fetch(APP_CONFIG.API.BASE_URL + APP_CONFIG.API.ENDPOINTS.STUDY_NOTES);
        if (response.ok) {
            const jsonData = await response.json();
            studyNotesData = jsonData;
            
            // Save all sample notes to IndexedDB
            for (const note of jsonData.notes) {
                await saveNoteToIndexedDB(note);
            }
            
            renderNotesList();
            showToast('📚 Sample notes loaded and saved to IndexedDB!', 'success');
        } else {
            throw new Error('Failed to load sample notes');
        }
    } catch (error) {
        console.error('Error loading sample notes:', error);
        showToast('⚠️ Could not load sample data', 'warning');
        renderNotesList();
    }
}

/**
 * Get all notes from IndexedDB
 * @returns {Promise<Array>} Array of note objects
 */
function getAllNotesFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.getAll();

        request.onsuccess = function() {
            resolve(request.result || []);
        };

        request.onerror = function() {
            reject(request.error);
        };
    });
}

/**
 * Save a single note to IndexedDB
 * @param {Object} note - Note object to save
 * @returns {Promise}
 */
function saveNoteToIndexedDB(note) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.put(note); // put = insert or update

        request.onsuccess = function() {
            resolve(request.result);
        };

        request.onerror = function() {
            reject(request.error);
        };
    });
}

/**
 * Delete a note from IndexedDB
 * @param {string} noteId - ID of note to delete
 * @returns {Promise}
 */
function deleteNoteFromIndexedDB(noteId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.delete(noteId);

        request.onsuccess = function() {
            resolve();
        };

        request.onerror = function() {
            reject(request.error);
        };
    });
}

/**
 * Save current note being edited
 */
async function saveCurrentNote() {
    try {
        if (currentEditingNoteIndex === null) return;

        const currentNote = studyNotesData.notes[currentEditingNoteIndex];
        
        // Save content from Quill editor
        if (noteQuillEditor) {
            currentNote.content = noteQuillEditor.root.innerHTML;
        }

        // Update timestamp
        currentNote.updatedAt = new Date().toISOString();

        // Save to IndexedDB
        await saveNoteToIndexedDB(currentNote);
        
        showToast('✅ Note saved successfully!', 'success');
        return true;
    } catch (error) {
        console.error('Error saving note:', error);
        showToast('❌ Error saving note', 'error');
        return false;
    }
}

/**
 * Save all notes (bulk save)
 */
async function saveAllNotes() {
    try {
        // Save current note first
        if (currentEditingNoteIndex !== null) {
            const currentNote = studyNotesData.notes[currentEditingNoteIndex];
            if (noteQuillEditor) {
                currentNote.content = noteQuillEditor.root.innerHTML;
            }
            currentNote.updatedAt = new Date().toISOString();
        }

        // Save all notes to IndexedDB
        for (const note of studyNotesData.notes) {
            await saveNoteToIndexedDB(note);
        }
        
        showToast('✅ All notes saved successfully!', 'success');
        return true;
    } catch (error) {
        console.error('Error saving notes:', error);
        showToast('❌ Error saving notes', 'error');
        return false;
    }
}

// ==================== NOTES LIST MANAGEMENT ====================
// Render notes list in sidebar
function renderNotesList() {
    const container = document.getElementById('notesListContainer');
    
    if (studyNotesData.notes.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <div class="text-4xl mb-2">📋</div>
                <p class="text-sm">No notes yet</p>
            </div>
        `;
        return;
    }

    container.innerHTML = studyNotesData.notes.map((note, index) => `
        <div onclick="selectNote(${index})" 
             class="p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                 currentEditingNoteIndex === index 
                 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500 shadow-lg transform scale-105' 
                 : 'bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300 hover:shadow-md'
             }">
            <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                    <div class="font-semibold text-sm truncate ${currentEditingNoteIndex === index ? 'text-white' : 'text-purple-900'}">
                        ${note.title || 'Untitled Note'}
                    </div>
                    <div class="text-xs mt-1 flex items-center gap-2 ${currentEditingNoteIndex === index ? 'text-purple-100' : 'text-purple-600'}">
                        <span>📄</span>
                        <span>${note.date || ''}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ==================== NOTE CREATION & SELECTION ====================
// Create a new note
async function createNewNote() {
    const newNote = {
        _id: 'note_' + Date.now(),
        title: 'New Note ' + (studyNotesData.notes.length + 1),
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        }),
        type: 'rich',
        content: '',
        tags: [],
        category: 'General',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        // Save to IndexedDB
        await saveNoteToIndexedDB(newNote);
        
        // Add to local array
        studyNotesData.notes.push(newNote);
        currentEditingNoteIndex = studyNotesData.notes.length - 1;
        
        renderNotesList();
        renderNoteEditor();
        showToast('📝 New note created!', 'success');
    } catch (error) {
        console.error('Error creating note:', error);
        showToast('❌ Error creating note', 'error');
    }
}

// Select and edit a note
function selectNote(index) {
    // Save current note before switching
    if (currentEditingNoteIndex !== null && currentEditingNoteIndex !== index) {
        const currentNote = studyNotesData.notes[currentEditingNoteIndex];
        if (currentNote.type === 'rich' && noteQuillEditor) {
            currentNote.content = noteQuillEditor.root.innerHTML;
        }
    }
    
    currentEditingNoteIndex = index;
    renderNotesList();
    renderNoteEditor();
}

// ==================== NOTE EDITOR ====================
// Render the note editor
function renderNoteEditor() {
    if (currentEditingNoteIndex === null) return;
    
    const note = studyNotesData.notes[currentEditingNoteIndex];
    const container = document.getElementById('noteEditorContainer');
    
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Note Title -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Note Title</label>
                <input type="text" 
                       id="noteTitle" 
                       value="${note.title || ''}" 
                       onchange="updateNoteTitle(this.value)"
                       class="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300 text-lg font-semibold"
                       placeholder="Enter note title">
            </div>

            <!-- Rich Text Editor -->
            <div id="noteContentArea">
                <div id="richNoteEditor" class="border-2 border-purple-200 rounded-xl"></div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-6 border-t border-gray-200 flex-wrap">
                <button onclick="saveAllNotes()" 
                        class="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    💾 Save Note
                </button>
                <button onclick="exportCurrentNote()" 
                        class="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    📥 Export (JSON)
                </button>
                <button onclick="duplicateNote()" 
                        class="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    📋 Duplicate
                </button>
                <button onclick="deleteCurrentNote()" 
                        class="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `;

    initializeRichTextEditor(note);
}

// Initialize Rich Text Editor
function initializeRichTextEditor(note) {
    // Initialize Quill editor
    noteQuillEditor = new Quill('#richNoteEditor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'align': [] }],
                ['link', 'image', 'code-block'],
                ['clean']
            ]
        },
        placeholder: 'Start writing your notes here...'
    });

    // Set existing content
    if (note.content) {
        noteQuillEditor.root.innerHTML = note.content;
    }

    // Auto-save on change
    noteQuillEditor.on('text-change', () => {
        studyNotesData.notes[currentEditingNoteIndex].content = noteQuillEditor.root.innerHTML;
        studyNotesData.notes[currentEditingNoteIndex].updatedAt = new Date().toISOString();
    });
}

// Update note title
function updateNoteTitle(value) {
    if (currentEditingNoteIndex !== null) {
        studyNotesData.notes[currentEditingNoteIndex].title = value;
        studyNotesData.notes[currentEditingNoteIndex].updatedAt = new Date().toISOString();
        renderNotesList();
    }
}

// ==================== NOTE ACTIONS ====================
// Delete current note
async function deleteCurrentNote() {
    if (currentEditingNoteIndex === null) return;
    
    const note = studyNotesData.notes[currentEditingNoteIndex];
    
    showConfirmModal(
        '🗑️ Delete Note',
        `Are you sure you want to delete "${note.title}"? This action cannot be undone.`,
        async () => {
            try {
                // Delete from IndexedDB
                await deleteNoteFromIndexedDB(note._id);
                
                // Remove from local array
                studyNotesData.notes.splice(currentEditingNoteIndex, 1);
                currentEditingNoteIndex = null;
                
                renderNotesList();
                
                document.getElementById('noteEditorContainer').innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full text-center">
                        <div class="text-6xl mb-4">📝</div>
                        <h3 class="text-2xl font-bold text-gray-700 mb-2">Note Deleted</h3>
                        <p class="text-gray-500">Create a new note or select an existing one</p>
                    </div>
                `;
                showToast('✅ Note deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting note:', error);
                showToast('❌ Error deleting note', 'error');
            }
        }
    );
}

// Duplicate current note
async function duplicateNote() {
    if (currentEditingNoteIndex === null) return;
    
    try {
        const originalNote = studyNotesData.notes[currentEditingNoteIndex];
        const duplicatedNote = JSON.parse(JSON.stringify(originalNote));
        
        // Update duplicated note properties
        duplicatedNote._id = 'note_' + Date.now();
        duplicatedNote.title = originalNote.title + ' (Copy)';
        duplicatedNote.date = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        duplicatedNote.createdAt = new Date().toISOString();
        duplicatedNote.updatedAt = new Date().toISOString();
        
        // Save to IndexedDB
        await saveNoteToIndexedDB(duplicatedNote);
        
        // Add to local array
        studyNotesData.notes.push(duplicatedNote);
        currentEditingNoteIndex = studyNotesData.notes.length - 1;
        
        renderNotesList();
        renderNoteEditor();
        showToast('📋 Note duplicated!', 'success');
    } catch (error) {
        console.error('Error duplicating note:', error);
        showToast('❌ Error duplicating note', 'error');
    }
}

// Export current note to JSON
function exportCurrentNote() {
    if (currentEditingNoteIndex === null) return;
    
    const note = studyNotesData.notes[currentEditingNoteIndex];
    
    // Save content before export
    if (noteQuillEditor) {
        note.content = noteQuillEditor.root.innerHTML;
    }
    
    const dataStr = JSON.stringify(note, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/\s+/g, '_')}_note.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Note exported successfully!', 'success');
}

// Export all notes to JSON
async function exportAllNotesToJSON() {
    try {
        // Get fresh data from IndexedDB
        const allNotes = await getAllNotesFromIndexedDB();
        
        const exportData = {
            _id: 'study_notes_collection',
            version: '1.0',
            exportedAt: new Date().toISOString(),
            notes: allNotes,
            categories: [...new Set(allNotes.map(n => n.category))],
            tags: [...new Set(allNotes.flatMap(n => n.tags || []))]
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `study_notes_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('📥 All notes exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting notes:', error);
        showToast('❌ Error exporting notes', 'error');
    }
}

// Export for MongoDB (JSONL format - one document per line)
async function exportForMongoDB() {
    try {
        // Get fresh data from IndexedDB
        const allNotes = await getAllNotesFromIndexedDB();
        
        if (allNotes.length === 0) {
            showToast('⚠️ No notes to export', 'warning');
            return;
        }

        // JSONL format (JSON Lines) - each document on a separate line
        // This is the format MongoDB's mongoimport expects
        const jsonlData = allNotes.map(note => JSON.stringify(note)).join('\n');
        
        // Create and download JSONL file
        const blob = new Blob([jsonlData], { type: 'application/x-ndjson' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mongodb_import_notes_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        // Show instructions modal
        showMongoDBImportInstructions(allNotes.length);
        
        showToast(`📥 MongoDB import file created (${allNotes.length} notes)!`, 'success');
    } catch (error) {
        console.error('Error exporting for MongoDB:', error);
        showToast('❌ Error creating MongoDB export', 'error');
    }
}

// Export as MongoDB Array (alternative format)
async function exportAsMongoDBArray() {
    try {
        const allNotes = await getAllNotesFromIndexedDB();
        
        if (allNotes.length === 0) {
            showToast('⚠️ No notes to export', 'warning');
            return;
        }

        // Array format for MongoDB Compass or insertMany()
        const exportData = JSON.stringify(allNotes, null, 2);
        
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mongodb_array_notes_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast('📥 MongoDB array format exported!', 'success');
    } catch (error) {
        console.error('Error exporting array:', error);
        showToast('❌ Error creating array export', 'error');
    }
}

// Show MongoDB import instructions
function showMongoDBImportInstructions(noteCount) {
    const modal = document.getElementById('confirmModal');
    const modalTitle = document.getElementById('confirmModalTitle');
    const modalMessage = document.getElementById('confirmModalMessage');
    const modalBtn = document.getElementById('confirmModalBtn');
    
    modalTitle.innerHTML = '📦 MongoDB Import Instructions';
    modalMessage.innerHTML = `
        <div class="text-left space-y-4">
            <p class="font-semibold text-green-600">✅ File exported: ${noteCount} notes</p>
            
            <div class="bg-gray-50 p-4 rounded-lg">
                <p class="font-semibold mb-2">🔧 Option 1: Using MongoDB Shell (mongoimport)</p>
                <pre class="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">mongoimport --db codingTerminalsDB --collection studyNotes --file mongodb_import_notes_*.json</pre>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
                <p class="font-semibold mb-2">🖥️ Option 2: Using MongoDB Compass</p>
                <ol class="list-decimal list-inside text-sm space-y-1 text-gray-700">
                    <li>Open MongoDB Compass</li>
                    <li>Connect to your database</li>
                    <li>Select/Create database: <code class="bg-gray-200 px-2 py-1 rounded">codingTerminalsDB</code></li>
                    <li>Select/Create collection: <code class="bg-gray-200 px-2 py-1 rounded">studyNotes</code></li>
                    <li>Click "Add Data" → "Import File"</li>
                    <li>Select the exported JSON file</li>
                    <li>Click "Import"</li>
                </ol>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
                <p class="font-semibold mb-2">📝 Option 3: Using Node.js/Express</p>
                <pre class="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">const fs = require('fs');
const data = JSON.parse(fs.readFileSync('file.json'));
await db.collection('studyNotes').insertMany(data);</pre>
            </div>
        </div>
    `;
    
    modalBtn.textContent = 'Got it!';
    modalBtn.className = 'px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all';
    
    confirmModalCallback = () => {
        closeConfirmModal();
        // Reset button
        modalBtn.textContent = 'Confirm';
        modalBtn.className = 'px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all';
    };
    
    modal.classList.remove('hidden');
}

// Import notes from JSON
function importNotesFromJSON() {
    document.getElementById('importFileInput').click();
}

async function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (importedData.notes && Array.isArray(importedData.notes)) {
                // Save all imported notes to IndexedDB
                for (const note of importedData.notes) {
                    // Ensure unique _id
                    if (!note._id) {
                        note._id = 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    }
                    await saveNoteToIndexedDB(note);
                }
                
                // Reload notes from IndexedDB
                studyNotesData.notes = await getAllNotesFromIndexedDB();
                
                renderNotesList();
                currentEditingNoteIndex = null;
                document.getElementById('noteEditorContainer').innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full text-center">
                        <div class="text-6xl mb-4">✅</div>
                        <h3 class="text-2xl font-bold text-gray-700 mb-2">Notes Imported!</h3>
                        <p class="text-gray-500">Successfully imported ${importedData.notes.length} notes</p>
                    </div>
                `;
                showToast(`📤 ${importedData.notes.length} notes imported successfully!`, 'success');
            } else {
                throw new Error('Invalid file format');
            }
        } catch (error) {
            console.error('Error importing notes:', error);
            showToast('❌ Error importing notes. Please check the file format.', 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };
    
    toast.className = `${colors[type]} text-white px-6 py-4 rounded-xl shadow-lg toast-enter flex items-center gap-3 min-w-[300px]`;
    toast.innerHTML = `
        <span class="text-xl">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span class="flex-1">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== CONFIRMATION MODAL ====================
function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const modalTitle = document.getElementById('confirmModalTitle');
    const modalMessage = document.getElementById('confirmModalMessage');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    confirmModalCallback = onConfirm;
    
    modal.classList.remove('hidden');
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.add('hidden');
    confirmModalCallback = null;
}

function confirmModalAction() {
    if (confirmModalCallback) {
        confirmModalCallback();
    }
    closeConfirmModal();
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('confirmModal');
    if (e.target === modal) {
        closeConfirmModal();
    }
});
