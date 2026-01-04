const { Note } = require('../models');

/**
 * Note Controller
 * Handles CRUD operations for individual study notes
 */

class NoteController {
    
    /**
     * Get all notes
     * GET /api/notes
     */
    async getAllNotes(req, res) {
        try {
            const notes = await Note
                .find()
                .sort({ isPinned: -1, createdAt: -1 })
                .lean();
            
            res.json({
                success: true,
                count: notes.length,
                data: notes
            });
        } catch (error) {
            console.error('❌ Error fetching notes:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get note by MongoDB ID
     * GET /api/notes/:id
     */
    async getNoteById(req, res) {
        try {
            const { id } = req.params;
            const note = await Note.findById(id);
            
            if (!note) {
                return res.status(404).json({
                    success: false,
                    error: 'Note not found'
                });
            }
            
            res.json({
                success: true,
                data: note
            });
        } catch (error) {
            console.error('❌ Error fetching note:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get note by noteId
     * GET /api/notes/note/:noteId
     */
    async getNoteByNoteId(req, res) {
        try {
            const { noteId } = req.params;
            const note = await Note.findOne({ noteId });
            
            if (!note) {
                return res.status(404).json({
                    success: false,
                    error: 'Note not found'
                });
            }
            
            res.json({
                success: true,
                data: note
            });
        } catch (error) {
            console.error('❌ Error fetching note:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get notes by category
     * GET /api/notes/category/:category
     */
    async getNotesByCategory(req, res) {
        try {
            const { category } = req.params;
            const notes = await Note
                .find({ category })
                .sort({ isPinned: -1, createdAt: -1 })
                .lean();
            
            res.json({
                success: true,
                count: notes.length,
                data: notes
            });
        } catch (error) {
            console.error('❌ Error fetching notes by category:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Create new note
     * POST /api/notes
     */
    async createNote(req, res) {
        try {
            const noteData = req.body;
            
            // Generate noteId if not provided
            if (!noteData.noteId) {
                noteData.noteId = 'note_' + Date.now();
            }
            
            const note = new Note(noteData);
            await note.save();
            
            res.status(201).json({
                success: true,
                message: 'Note created successfully',
                data: note
            });
        } catch (error) {
            console.error('❌ Error creating note:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Update note
     * PUT /api/notes/:id
     */
    async updateNote(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            const note = await Note.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!note) {
                return res.status(404).json({
                    success: false,
                    error: 'Note not found'
                });
            }
            
            res.json({
                success: true,
                message: 'Note updated successfully',
                data: note
            });
        } catch (error) {
            console.error('❌ Error updating note:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Delete note
     * DELETE /api/notes/:id
     */
    async deleteNote(req, res) {
        try {
            const { id } = req.params;
            const note = await Note.findByIdAndDelete(id);
            
            if (!note) {
                return res.status(404).json({
                    success: false,
                    error: 'Note not found'
                });
            }
            
            res.json({
                success: true,
                message: 'Note deleted successfully'
            });
        } catch (error) {
            console.error('❌ Error deleting note:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Bulk upsert notes
     * POST /api/notes/bulk
     */
    async bulkUpsertNotes(req, res) {
        try {
            const { notes } = req.body;
            
            if (!Array.isArray(notes)) {
                return res.status(400).json({
                    success: false,
                    error: 'notes array is required'
                });
            }
            
            const results = [];
            
            for (const noteData of notes) {
                // Ensure noteId exists
                if (!noteData.noteId) {
                    noteData.noteId = 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                }
                
                // Upsert (update if exists, create if not)
                const note = await Note.findOneAndUpdate(
                    { noteId: noteData.noteId },
                    noteData,
                    { upsert: true, new: true, runValidators: true }
                );
                
                results.push(note);
            }
            
            res.json({
                success: true,
                message: `${results.length} notes saved successfully`,
                count: results.length,
                data: results
            });
        } catch (error) {
            console.error('❌ Error in bulk upsert:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Search notes
     * GET /api/notes/search?q=query
     */
    async searchNotes(req, res) {
        try {
            const { q } = req.query;
            
            if (!q) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required'
                });
            }
            
            const notes = await Note
                .find({ $text: { $search: q } })
                .sort({ score: { $meta: 'textScore' } })
                .lean();
            
            res.json({
                success: true,
                count: notes.length,
                data: notes
            });
        } catch (error) {
            console.error('❌ Error searching notes:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new NoteController();
