/**
 * Study Notes API Service
 * Handles MongoDB API calls for Study Notes Admin
 * Matches YouTube admin architecture
 */

const studyNotesAPI = {
    baseURL: APP_CONFIG.API.BASE_URL,
    notesEndpoint: '/api/notes',

    /**
     * Health check - verify API is accessible
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/api/health`);
            return response.ok;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    },

    /**
     * Get all notes from MongoDB
     * Returns array of individual note documents
     */
    async getAllNotes() {
        try {
            console.log('📡 Fetching all notes from MongoDB...');
            const response = await fetch(`${this.baseURL}${this.notesEndpoint}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log(`✅ Fetched ${result.count} notes from MongoDB`);
            return result.data;
        } catch (error) {
            console.error('❌ Error fetching notes:', error);
            throw error;
        }
    },

    /**
     * Get single note by MongoDB ID
     */
    async getNoteById(id) {
        try {
            const response = await fetch(`${this.baseURL}${this.notesEndpoint}/${id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('❌ Error fetching note:', error);
            throw error;
        }
    },

    /**
     * Create new note
     */
    async createNote(noteData) {
        try {
            console.log('➕ Creating new note:', noteData.title);
            const response = await fetch(`${this.baseURL}${this.notesEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(noteData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ Note created:', result.data._id);
            return result.data;
        } catch (error) {
            console.error('❌ Error creating note:', error);
            throw error;
        }
    },

    /**
     * Update existing note
     */
    async updateNote(id, noteData) {
        try {
            console.log('📝 Updating note:', id);
            const response = await fetch(`${this.baseURL}${this.notesEndpoint}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(noteData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ Note updated:', id);
            return result.data;
        } catch (error) {
            console.error('❌ Error updating note:', error);
            throw error;
        }
    },

    /**
     * Delete note
     */
    async deleteNote(id) {
        try {
            console.log('🗑️ Deleting note:', id);
            const response = await fetch(`${this.baseURL}${this.notesEndpoint}/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }
            
            console.log('✅ Note deleted:', id);
            return await response.json();
        } catch (error) {
            console.error('❌ Error deleting note:', error);
            throw error;
        }
    },

    /**
     * Bulk upsert notes (create or update multiple notes)
     */
    async bulkUpsertNotes(notes) {
        try {
            console.log(`📦 Bulk upserting ${notes.length} notes...`);
            const response = await fetch(`${this.baseURL}${this.notesEndpoint}/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notes })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ Bulk upsert completed:', result.count);
            return result.data;
        } catch (error) {
            console.error('❌ Error in bulk upsert:', error);
            throw error;
        }
    },

    /**
     * Sync all notes with MongoDB
     * Auto-save functionality - called periodically
     */
    async syncNotesWithMongoDB(localNotes) {
        try {
            console.log('🔄 Syncing notes with MongoDB...');
            
            // Prepare notes for sync - ensure proper ID mapping
            const notesToSync = localNotes.map(note => {
                // Use existing noteId or generate new one from _id
                const noteId = note.noteId || note._id || 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                
                return {
                    noteId: noteId,
                    title: note.title,
                    content: note.content,
                    category: note.category || 'General',
                    tags: note.tags || [],
                    type: note.type || 'rich',
                    date: note.date,
                    isPinned: note.isPinned || false,
                    isFavorite: note.isFavorite || false
                };
            });
            
            const results = await this.bulkUpsertNotes(notesToSync);
            
            // Update local notes with MongoDB data
            return results.map(mongoNote => ({
                _id: mongoNote.noteId,        // Use noteId as _id for consistency
                noteId: mongoNote.noteId,     // Keep noteId for reference
                title: mongoNote.title,
                content: mongoNote.content,
                category: mongoNote.category,
                tags: mongoNote.tags,
                type: mongoNote.type,
                date: mongoNote.date,
                isPinned: mongoNote.isPinned,
                isFavorite: mongoNote.isFavorite,
                createdAt: mongoNote.createdAt,
                updatedAt: mongoNote.updatedAt
            }));
            
            console.log('✅ Sync complete:', results.length, 'notes synced');
            return results;
        } catch (error) {
            console.error('❌ Sync failed:', error);
            throw error;
        }
    },

    /**
     * Search notes
     */
    async searchNotes(query) {
        try {
            const response = await fetch(`${this.baseURL}${this.notesEndpoint}/search?q=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('❌ Error searching notes:', error);
            throw error;
        }
    }
};

// Initialize on load
console.log('✅ Study Notes API Service initialized');
console.log('📡 API Endpoint: /api/notes (codingTerminalsStudyNotes collection)');
console.log('📊 Architecture: MongoDB (individual documents) → Backend → IndexedDB cache');
