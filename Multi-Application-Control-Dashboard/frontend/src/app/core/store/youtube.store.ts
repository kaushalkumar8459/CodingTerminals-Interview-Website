import { Injectable, inject, computed, Signal } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

// Types for YouTube Videos
export type YoutubeVideoStatus = 'draft' | 'published' | 'archived';
export type YoutubeCategory = 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Other';

export interface YoutubeVideo {
  id: string;
  title: string;
  videoUrl: string;
  category: YoutubeCategory;
  description: string;
  status: YoutubeVideoStatus;
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CreateYoutubeVideoRequest {
  title: string;
  videoUrl: string;
  category: YoutubeCategory;
  description: string;
  status?: YoutubeVideoStatus;
}

export interface UpdateYoutubeVideoRequest {
  title?: string;
  videoUrl?: string;
  category?: YoutubeCategory;
  description?: string;
  status?: YoutubeVideoStatus;
}

export interface YoutubeVideoWithUI extends YoutubeVideo {
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export interface YoutubeState {
  videos: YoutubeVideoWithUI[];
  currentVideo: YoutubeVideoWithUI | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  currentPage: number;
  pageSize: number;
  totalVideos: number;
  selectedCategory: YoutubeCategory | 'all';
  selectedStatus: YoutubeVideoStatus | 'all';
  searchQuery: string;
}

const initialState: YoutubeState = {
  videos: [],
  currentVideo: null,
  loading: false,
  error: null,
  success: null,
  currentPage: 1,
  pageSize: 10,
  totalVideos: 0,
  selectedCategory: 'all',
  selectedStatus: 'all',
  searchQuery: ''
};

@Injectable({
  providedIn: 'root'
})
export class YoutubeStore extends signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state: any) => ({
    // ===== LOADING & UI STATES =====
    isLoading: computed(() => state.loading()),
    hasError: computed(() => state.error() !== null),
    hasSuccess: computed(() => state.success() !== null),

    // ===== PAGINATION =====
    totalPages: computed(() => Math.ceil(state.totalVideos() / state.pageSize())),
    hasNextPage: computed(() => state.currentPage() < Math.ceil(state.totalVideos() / state.pageSize())),
    hasPreviousPage: computed(() => state.currentPage() > 1),

    // ===== DATA PRESENCE CHECKS =====
    hasVideos: computed(() => state.videos().length > 0),
    isEmpty: computed(() => state.videos().length === 0 && !state.loading()),
    hasCurrentVideo: computed(() => state.currentVideo() !== null),

    // ===== FILTER STATE =====
    hasFilters: computed(() =>
      state.selectedCategory !== 'all' ||
      state.selectedStatus !== 'all' ||
      state.searchQuery() !== ''
    ),
    filteredCount: computed(() => state.videos().length),

    // ===== STATUS COUNTS =====
    draftCount: computed(() =>
      state.videos().filter((v: YoutubeVideoWithUI) => v.status === 'draft').length
    ),
    publishedCount: computed(() =>
      state.videos().filter((v: YoutubeVideoWithUI) => v.status === 'published').length
    ),
    archivedCount: computed(() =>
      state.videos().filter((v: YoutubeVideoWithUI) => v.status === 'archived').length
    ),

    // ===== CATEGORY COUNTS =====
    frontendCount: computed(() =>
      state.videos().filter((v: YoutubeVideoWithUI) => v.category === 'Frontend').length
    ),
    backendCount: computed(() =>
      state.videos().filter((v: YoutubeVideoWithUI) => v.category === 'Backend').length
    ),
    databaseCount: computed(() =>
      state.videos().filter((v: YoutubeVideoWithUI) => v.category === 'Database').length
    ),
    devopsCount: computed(() =>
      state.videos().filter((v: YoutubeVideoWithUI) => v.category === 'DevOps').length
    ),

    // ===== VIEW ANALYTICS =====
    totalViews: computed(() =>
      state.videos().reduce((sum: number, v: YoutubeVideoWithUI) => sum + v.views, 0)
    ),
    totalLikes: computed(() =>
      state.videos().reduce((sum: number, v: YoutubeVideoWithUI) => sum + v.likes, 0)
    ),
    averageViews: computed(() => {
      const videos = state.videos();
      return videos.length > 0 ? Math.round(state.totalViews() / videos.length) : 0;
    }),
    averageLikes: computed(() => {
      const videos = state.videos();
      return videos.length > 0 ? Math.round(state.totalLikes() / videos.length) : 0;
    }),

    // ===== DISPLAY FLAGS =====
    isDataFresh: computed(() => true)
  })),
  withMethods((store: any) => {
    // 1. Define internal methods
    const loadVideos = async (): Promise<void> => {
      patchState(store, { loading: true, error: null });
      try {
        // Simulate API call to fetch videos
        const mockVideos: YoutubeVideoWithUI[] = [
          {
            id: '1',
            title: 'Angular Tutorial',
            videoUrl: 'https://youtube.com/embed/dQw4w9WgXcQ',
            category: 'Frontend',
            description: 'Complete Angular tutorial for beginners',
            status: 'published',
            views: 1234,
            likes: 89,
            createdAt: new Date('2025-12-01'),
            updatedAt: new Date('2025-12-10'),
            createdBy: 'admin',
            isDeleting: false,
            isUpdating: false
          },
          {
            id: '2',
            title: 'TypeScript Basics',
            videoUrl: 'https://youtube.com/embed/dQw4w9WgXcQ',
            category: 'Frontend',
            description: 'Learn TypeScript fundamentals',
            status: 'published',
            views: 890,
            likes: 67,
            createdAt: new Date('2025-11-15'),
            updatedAt: new Date('2025-12-05'),
            createdBy: 'trainer',
            isDeleting: false,
            isUpdating: false
          },
          {
            id: '3',
            title: 'Node.js Concepts',
            videoUrl: 'https://youtube.com/embed/dQw4w9WgXcQ',
            category: 'Backend',
            description: 'Deep dive into Node.js concepts',
            status: 'draft',
            views: 456,
            likes: 32,
            createdAt: new Date('2025-11-01'),
            updatedAt: new Date('2025-12-08'),
            createdBy: 'admin',
            isDeleting: false,
            isUpdating: false
          }
        ];

        // Apply filters
        let filtered = mockVideos;

        if (store.selectedCategory() !== 'all') {
          filtered = filtered.filter(v => v.category === store.selectedCategory());
        }

        if (store.selectedStatus() !== 'all') {
          filtered = filtered.filter(v => v.status === store.selectedStatus());
        }

        if (store.searchQuery()) {
          const query = store.searchQuery().toLowerCase();
          filtered = filtered.filter(v =>
            v.title.toLowerCase().includes(query) ||
            v.description.toLowerCase().includes(query)
          );
        }

        patchState(store, {
          videos: filtered,
          totalVideos: filtered.length,
          loading: false,
          error: null
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load videos',
          loading: false
        });
        console.error('YoutubeStore: Error loading videos', err);
      }
    };

    const goToPage = (page: number): void => {
      if (page >= 1 && page <= store.totalPages()) {
        patchState(store, { currentPage: page });
        loadVideos();
      }
    };

    return {
      loadVideos,

    /**
     * Load single video by ID - ASYNC
     */
    async loadVideoById(id: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        // Simulate API call
        const video: YoutubeVideoWithUI = {
          id,
          title: 'Angular Tutorial',
          videoUrl: 'https://youtube.com/embed/dQw4w9WgXcQ',
          category: 'Frontend',
          description: 'Complete Angular tutorial for beginners',
          status: 'published',
          views: 1234,
          likes: 89,
          createdAt: new Date('2025-12-01'),
          updatedAt: new Date('2025-12-10'),
          createdBy: 'admin',
          isDeleting: false,
          isUpdating: false
        };

        patchState(store, {
          currentVideo: video,
          loading: false,
          error: null
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load video',
          loading: false
        });
        console.error('YoutubeStore: Error loading video', err);
      }
    },

    /**
     * Create new video - ASYNC
     */
    async createVideo(data: CreateYoutubeVideoRequest): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        // Simulate API call to create video
        const newVideo: YoutubeVideoWithUI = {
          id: Date.now().toString(),
          ...data,
          status: data.status || 'draft',
          views: 0,
          likes: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'current-user',
          isDeleting: false,
          isUpdating: false
        };

        const updatedVideos = [newVideo, ...store.videos()];
        patchState(store, {
          videos: updatedVideos,
          totalVideos: updatedVideos.length,
          success: 'Video created successfully!',
          error: null,
          loading: false
        });

        // Auto-clear success
        setTimeout(() => patchState(store, { success: null }), 3000);

        // Reload to apply filters
        await loadVideos();
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to create video',
          loading: false
        });
        console.error('YoutubeStore: Error creating video', err);
      }
    },

    /**
     * Update existing video - ASYNC
     */
    async updateVideo(id: string, data: UpdateYoutubeVideoRequest): Promise<void> {
      patchState(store, { error: null });
      try {
        const updatedVideos = store.videos().map((v: YoutubeVideoWithUI) =>
          v.id === id
            ? {
              ...v,
              ...data,
              updatedAt: new Date(),
              isUpdating: false
            }
            : v
        );

        patchState(store, {
          videos: updatedVideos,
          currentVideo: updatedVideos.find((v: YoutubeVideoWithUI) => v.id === id) || null,
          success: 'Video updated successfully!',
          error: null
        });

        // Auto-clear success
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to update video'
        });
        console.error('YoutubeStore: Error updating video', err);
      }
    },

    /**
     * Update video status only - ASYNC
     */
    async updateVideoStatus(id: string, status: YoutubeVideoStatus): Promise<void> {
      patchState(store, { error: null });
      try {
        const updatedVideos = store.videos().map((v: YoutubeVideoWithUI) =>
          v.id === id
            ? {
              ...v,
              status,
              updatedAt: new Date()
            }
            : v
        );

        patchState(store, {
          videos: updatedVideos,
          currentVideo: updatedVideos.find((v: YoutubeVideoWithUI) => v.id === id) || null,
          success: `Video status changed to ${status}!`,
          error: null
        });

        // Auto-clear success
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to update video status'
        });
        console.error('YoutubeStore: Error updating video status', err);
      }
    },

    /**
     * Publish video (draft -> published) - ASYNC
     */
    async publishVideo(id: string): Promise<void> {
      await store.updateVideoStatus(id, 'published');
    },

    /**
     * Archive video - ASYNC
     */
    async archiveVideo(id: string): Promise<void> {
      await store.updateVideoStatus(id, 'archived');
    },

    /**
     * Delete video - ASYNC
     */
    async deleteVideo(id: string): Promise<void> {
      // Set deleting flag for UI
      const videos = store.videos().map((v: YoutubeVideoWithUI) =>
        v.id === id ? { ...v, isDeleting: true } : v
      );
      patchState(store, { videos, error: null });

      try {
        // Simulate API call to delete
        const updatedVideos = store.videos().filter((v: YoutubeVideoWithUI) => v.id !== id);
        patchState(store, {
          videos: updatedVideos,
          totalVideos: updatedVideos.length,
          success: 'Video deleted successfully!',
          error: null
        });

        // Auto-clear success
        setTimeout(() => patchState(store, { success: null }), 3000);

        // Reload to apply filters
        await loadVideos();
      } catch (err: any) {
        // Clear deleting flag on error
        const errorVideos = store.videos().map((v: YoutubeVideoWithUI) =>
          v.id === id ? { ...v, isDeleting: false } : v
        );
        patchState(store, {
          videos: errorVideos,
          error: err?.error?.message ?? 'Failed to delete video'
        });
        console.error('YoutubeStore: Error deleting video', err);
      }
    },

    /**
     * Filter by category
     */
    filterByCategory(category: YoutubeCategory | 'all'): void {
      patchState(store, { selectedCategory: category, currentPage: 1 });
      loadVideos();
    },

    /**
     * Filter by status
     */
    filterByStatus(status: YoutubeVideoStatus | 'all'): void {
      patchState(store, { selectedStatus: status, currentPage: 1 });
      loadVideos();
    },

    /**
     * Search videos
     */
    searchVideos(query: string): void {
      patchState(store, { searchQuery: query, currentPage: 1 });
      loadVideos();
    },

    /**
     * Clear all filters and reload
     */
    clearFilters(): void {
      patchState(store, {
        searchQuery: '',
        selectedCategory: 'all',
        selectedStatus: 'all',
        currentPage: 1
      });
      loadVideos();
    },

    /**
     * Navigate to specific page
     */
    goToPage,

    /**
     * Go to previous page
     */
    previousPage(): void {
      goToPage(store.currentPage() - 1);
    },

    /**
     * Go to next page
     */
    nextPage(): void {
      goToPage(store.currentPage() + 1);
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
     * Clear current video
     */
    clearCurrentVideo(): void {
      patchState(store, { currentVideo: null });
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
    };
  })
) {
}
