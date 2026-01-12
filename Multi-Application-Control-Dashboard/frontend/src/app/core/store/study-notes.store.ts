import { Injectable, inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

// Types for StudyNotes
export type StudyNoteCategory = 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Other';

export interface StudyNote {
  id: string;
  title: string;
  category: StudyNoteCategory;
  content: string;
  tags: string[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CreateStudyNoteRequest {
  title: string;
  category: StudyNoteCategory;
  content: string;
  tags: string[];
}

export interface UpdateStudyNoteRequest {
  title?: string;
  category?: StudyNoteCategory;
  content?: string;
  tags?: string[];
}

export interface StudyNoteWithUI extends StudyNote {
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export interface StudyNotesState {
  notes: StudyNoteWithUI[];
  currentNote: StudyNoteWithUI | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  currentPage: number;
  pageSize: number;
  totalNotes: number;
  selectedCategory: StudyNoteCategory | 'all';
  searchQuery: string;
}

const initialState: StudyNotesState = {
  notes: [],
  currentNote: null,
  loading: false,
  error: null,
  success: null,
  currentPage: 1,
  pageSize: 10,
  totalNotes: 0,
  selectedCategory: 'all',
  searchQuery: ''
};

@Injectable({
  providedIn: 'root'
})
export class StudyNotesStore extends signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    // ===== LOADING & UI STATES =====
    isLoading: computed(() => state.loading()),
    hasError: computed(() => state.error() !== null),
    hasSuccess: computed(() => state.success() !== null),
    
    // ===== PAGINATION =====
    totalPages: computed(() => Math.ceil(state.totalNotes() / state.pageSize())),
    hasNextPage: computed(() => state.currentPage() < Math.ceil(state.totalNotes() / state.pageSize())),
    hasPreviousPage: computed(() => state.currentPage() > 1),
    
    // ===== DATA PRESENCE CHECKS =====
    hasNotes: computed(() => state.notes().length > 0),
    isEmpty: computed(() => state.notes().length === 0 && !state.loading()),
    hasCurrentNote: computed(() => state.currentNote() !== null),
    
    // ===== FILTER STATE =====
    hasFilters: computed(() => state.selectedCategory() !== 'all' || state.searchQuery() !== ''),
    filteredCount: computed(() => state.notes().length),
    
    // ===== CATEGORY COUNTS =====
    frontendCount: computed(() => 
      state.notes().filter(n => n.category === 'Frontend').length
    ),
    backendCount: computed(() => 
      state.notes().filter(n => n.category === 'Backend').length
    ),
    databaseCount: computed(() => 
      state.notes().filter(n => n.category === 'Database').length
    ),
    devopsCount: computed(() => 
      state.notes().filter(n => n.category === 'DevOps').length
    ),
    
    // ===== DISPLAY FLAGS =====
    isDataFresh: computed(() => {
      // Placeholder for timestamp check
      return true;
    })
  })),
  withMethods((store) => ({
    // ===== PUBLIC ACTIONS (called from components) =====

    /**
     * Load all study notes with filters - ASYNC
     */
    async loadNotes(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        // Simulate API call to fetch notes
        // In real implementation, inject StudyNotesService and call API
        const mockNotes: StudyNoteWithUI[] = [
          {
            id: '1',
            title: 'Angular Basics',
            category: 'Frontend',
            content: 'Complete guide to Angular fundamentals including components, directives, and services.',
            tags: ['angular', 'frontend', 'typescript'],
            views: 234,
            createdAt: new Date('2025-12-01'),
            updatedAt: new Date('2025-12-10'),
            createdBy: 'admin',
            isDeleting: false,
            isUpdating: false
          },
          {
            id: '2',
            title: 'RxJS Operators',
            category: 'Frontend',
            content: 'Deep dive into RxJS operators like map, filter, switchMap, and more.',
            tags: ['rxjs', 'frontend', 'reactive'],
            views: 156,
            createdAt: new Date('2025-11-15'),
            updatedAt: new Date('2025-12-05'),
            createdBy: 'trainer',
            isDeleting: false,
            isUpdating: false
          },
          {
            id: '3',
            title: 'Node.js REST APIs',
            category: 'Backend',
            content: 'Building scalable REST APIs with Node.js and Express.js.',
            tags: ['nodejs', 'backend', 'api'],
            views: 189,
            createdAt: new Date('2025-11-01'),
            updatedAt: new Date('2025-12-08'),
            createdBy: 'admin',
            isDeleting: false,
            isUpdating: false
          }
        ];

        // Apply filters
        let filtered = mockNotes;
        if (store.selectedCategory() !== 'all') {
          filtered = filtered.filter(n => n.category === store.selectedCategory());
        }
        if (store.searchQuery()) {
          const query = store.searchQuery().toLowerCase();
          filtered = filtered.filter(n => 
            n.title.toLowerCase().includes(query) || 
            n.content.toLowerCase().includes(query) ||
            n.tags.some(t => t.toLowerCase().includes(query))
          );
        }

        patchState(store, {
          notes: filtered,
          totalNotes: filtered.length,
          loading: false,
          error: null
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load study notes',
          loading: false
        });
        console.error('StudyNotesStore: Error loading notes', err);
      }
    },

    /**
     * Load single study note by ID - ASYNC
     */
    async loadNoteById(id: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        // Simulate API call
        const note: StudyNoteWithUI = {
          id,
          title: 'Angular Basics',
          category: 'Frontend',
          content: 'Complete guide to Angular fundamentals including components, directives, and services.',
          tags: ['angular', 'frontend', 'typescript'],
          views: 234,
          createdAt: new Date('2025-12-01'),
          updatedAt: new Date('2025-12-10'),
          createdBy: 'admin',
          isDeleting: false,
          isUpdating: false
        };

        patchState(store, {
          currentNote: note,
          loading: false,
          error: null
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load study note',
          loading: false
        });
        console.error('StudyNotesStore: Error loading note', err);
      }
    },

    /**
     * Create new study note - ASYNC
     */
    async createNote(data: CreateStudyNoteRequest): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        // Simulate API call to create note
        const newNote: StudyNoteWithUI = {
          id: Date.now().toString(),
          ...data,
          views: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'current-user',
          isDeleting: false,
          isUpdating: false
        };

        const updatedNotes = [newNote, ...(store as any)['notes']()];
        patchState(store, {
          notes: updatedNotes,
          totalNotes: updatedNotes.length,
          success: 'Study note created successfully!',
          error: null,
          loading: false
        });

        // Auto-clear success
        setTimeout(() => patchState(store, { success: null }), 3000);
        
        // Reload to apply filters
        await (store as any)['loadNotes']();
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to create study note',
          loading: false
        });
        console.error('StudyNotesStore: Error creating note', err);
      }
    },

    /**
     * Update existing study note - ASYNC
     */
    async updateNote(id: string, data: UpdateStudyNoteRequest): Promise<void> {
      patchState(store, { error: null });
      try {
        const updatedNotes = store.notes().map(n =>
          n.id === id 
            ? { 
                ...n, 
                ...data,
                updatedAt: new Date(),
                isUpdating: false
              } 
            : n
        );

        patchState(store, {
          notes: updatedNotes,
          currentNote: updatedNotes.find(n => n.id === id) || null,
          success: 'Study note updated successfully!',
          error: null
        });

        // Auto-clear success
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to update study note'
        });
        console.error('StudyNotesStore: Error updating note', err);
      }
    },

    /**
     * Delete study note - ASYNC
     */
    async deleteNote(id: string): Promise<void> {
      // Set deleting flag for UI
      const notes = (store as any)['notes']().map((n: StudyNoteWithUI) =>
        n.id === id ? { ...n, isDeleting: true } : n
      );
      patchState(store, { notes, error: null });

      try {
        // Simulate API call to delete
        const updatedNotes = (store as any)['notes']().filter((n: StudyNoteWithUI) => n.id !== id);
        patchState(store, {
          notes: updatedNotes,
          totalNotes: updatedNotes.length,
          success: 'Study note deleted successfully!',
          error: null
        });

        // Auto-clear success
        setTimeout(() => patchState(store, { success: null }), 3000);
        
        // Reload to apply filters
        await (store as any)['loadNotes']();
      } catch (err: any) {
        // Clear deleting flag on error
        const errorNotes = (store as any)['notes']().map((n: StudyNoteWithUI) =>
          n.id === id ? { ...n, isDeleting: false } : n
        );
        patchState(store, {
          notes: errorNotes,
          error: err?.error?.message ?? 'Failed to delete study note'
        });
        console.error('StudyNotesStore: Error deleting note', err);
      }
    },

    /**
     * Filter by category
     */
    filterByCategory(category: StudyNoteCategory | 'all'): void {
      patchState(store, { selectedCategory: category, currentPage: 1 });
      (store as any)['loadNotes']();
    },

    /**
     * Search notes
     */
    searchNotes(query: string): void {
      patchState(store, { searchQuery: query, currentPage: 1 });
      (store as any)['loadNotes']();
    },

    /**
     * Clear all filters and reload
     */
    clearFilters(): void {
      patchState(store, {
        searchQuery: '',
        selectedCategory: 'all',
        currentPage: 1
      });
      (store as any)['loadNotes']();
    },

    /**
     * Navigate to specific page
     */
    goToPage(page: number): void {
      if (page >= 1 && page <= store.totalPages()) {
        patchState(store, { currentPage: page });
        (store as any)['loadNotes']();
      }
    },

    /**
     * Go to previous page
     */
    previousPage(): void {
      (store as any)['goToPage'](store.currentPage() - 1);
    },

    /**
     * Go to next page
     */
    nextPage(): void {
      (store as any)['goToPage'](store.currentPage() + 1);
    },

    /**
     * Get page numbers for pagination UI
     */
    getPageNumbers(): number[] {
      const pages: number[] = [];
      const maxVisible = 5;
      let start = Math.max(1, store.currentPage() - Math.floor(maxVisible / 2));
      let end = Math.min(store.totalPages(), start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },

    /**
     * Clear current note
     */
    clearCurrentNote(): void {
      patchState(store, { currentNote: null });
    },

    /**
     * Clear error message
     */
    clearError(): void {
      patchState(store, { error: null });
    },

    /**
     * Clear success message
     */
    clearSuccess(): void {
      patchState(store, { success: null });
    }
  }))
) {
}
