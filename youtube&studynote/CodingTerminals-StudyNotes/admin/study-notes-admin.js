// ==================== STUDY NOTES APPLICATION (MONGODB ONLY) ====================
// Global Variables
let studyNotesData = {
    notes: []
};

let currentEditingNoteIndex = null;
let noteQuillEditor = null;
let confirmModalCallback = null;

// ==================== INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', () => {
    loadStudyNotes();
});

// ==================== AUTHENTICATION ====================
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        window.location.href = './../../auth/login.html';
    }
}

// ==================== DATA MANAGEMENT ====================
/**
 * Load study notes - Try MongoDB first, fallback to IndexedDB
 */
async function loadStudyNotes() {
    try {
        // Check if API service is available
        if (typeof studyNotesAPI !== 'undefined') {
            console.log('🔄 Attempting to load from MongoDB...');
            try {
                const mongoNotes = await studyNotesAPI.getAllNotes();
                
                if (mongoNotes && mongoNotes.length > 0) {
                    // Map MongoDB notes to IndexedDB format (_id = noteId)
                    studyNotesData.notes = mongoNotes.map(note => ({
                        _id: note.noteId,          // Use noteId as _id for IndexedDB
                        noteId: note.noteId,
                        title: note.title,
                        content: note.content,
                        category: note.category,
                        tags: note.tags,
                        type: note.type,
                        date: note.date,
                        isPinned: note.isPinned,
                        isFavorite: note.isFavorite,
                        createdAt: note.createdAt,
                        updatedAt: note.updatedAt
                    }));
                    
                    renderNotesList();
                    showToast('📚 Notes loaded from MongoDB!', 'success');
                    return;
                }
            } catch (mongoError) {
                console.warn('⚠️ MongoDB unavailable:', mongoError);
            }
        }
        
        // Fallback to empty notes
        studyNotesData.notes = [];
        renderNotesList();
        showToast('⚠️ No notes available', 'warning');
    } catch (error) {
        console.error('Error loading study notes:', error);
        showToast('⚠️ Error loading notes', 'error');
        renderNotesList();
    }
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

        // ✅ FIXED: Actually save to MongoDB
        if (typeof studyNotesAPI !== 'undefined') {
            try {
                // Check if note has MongoDB _id
                if (currentNote._id && currentNote._id.startsWith('note_')) {
                    // New note - create it
                    await studyNotesAPI.createNote(currentNote);
                } else {
                    // Existing note - update it
                    await studyNotesAPI.updateNote(currentNote._id, currentNote);
                }
                showToast('✅ Note saved to MongoDB!', 'success');
            } catch (error) {
                console.error('MongoDB save error:', error);
                showToast('⚠️ Saved locally only (MongoDB unavailable)', 'warning');
            }
        }

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
        
        // ✅ FIXED: Actually save all notes to MongoDB using bulk upsert
        if (typeof studyNotesAPI !== 'undefined') {
            try {
                console.log('💾 Saving all notes to MongoDB...');
                const results = await studyNotesAPI.syncNotesWithMongoDB(studyNotesData.notes);
                
                // Update local notes with MongoDB data (includes _id)
                studyNotesData.notes = results;
                
                showToast(`✅ All ${results.length} notes saved to MongoDB!`, 'success');
                renderNotesList();
            } catch (error) {
                console.error('MongoDB bulk save error:', error);
                showToast('⚠️ Saved locally only (MongoDB unavailable)', 'warning');
            }
        } else {
            showToast('⚠️ Saved locally only (API not available)', 'warning');
        }
        
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
                // ✅ FIXED: Delete from MongoDB first
                if (typeof studyNotesAPI !== 'undefined' && note._id) {
                    try {
                        // If it's a MongoDB document (has proper _id), delete from MongoDB
                        if (!note._id.startsWith('note_')) {
                            await studyNotesAPI.deleteNote(note._id);
                            showToast('✅ Note deleted from MongoDB!', 'success');
                        }
                    } catch (error) {
                        console.error('MongoDB delete error:', error);
                        showToast('⚠️ Deleted locally (MongoDB unavailable)', 'warning');
                    }
                }
                
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
        const exportData = {
            _id: 'study_notes_collection',
            version: '1.0',
            exportedAt: new Date().toISOString(),
            notes: studyNotesData.notes,
            categories: [...new Set(studyNotesData.notes.map(n => n.category))],
            tags: [...new Set(studyNotesData.notes.flatMap(n => n.tags || []))]
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
