import { Injectable, inject, computed, Signal } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { LinkedinService, LinkedinPost, PostStatus, PostFilter, CreatePostRequest, UpdatePostRequest } from '../services/linkedin.service';
import { firstValueFrom } from 'rxjs';

export interface LinkedinPostWithUI extends LinkedinPost {
  isDeleting?: boolean;
  isPublishing?: boolean;
  isScheduling?: boolean;
  isArchiving?: boolean;
}

export interface LinkedinState {
  posts: LinkedinPostWithUI[];
  currentPost: LinkedinPostWithUI | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  currentPage: number;
  pageSize: number;
  totalPosts: number;
  selectedStatus: PostStatus | 'all';
  searchQuery: string;
}

const initialState: LinkedinState = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  success: null,
  currentPage: 1,
  pageSize: 10,
  totalPosts: 0,
  selectedStatus: 'all',
  searchQuery: ''
};

@Injectable({
  providedIn: 'root'
})
export class LinkedinStore extends signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state: any) => ({
    totalPages: computed(() => Math.ceil(state.totalPosts() / state.pageSize())),
    hasFilters: computed(() => 
      state.selectedStatus() !== 'all' || state.searchQuery() !== ''
    ),
    filteredCount: computed(() => state.posts().length),
    isLoading: computed(() => state.loading()),
    draftCount: computed(() => state.posts().filter((p: LinkedinPostWithUI) => p.status === 'draft').length),
    scheduledCount: computed(() => state.posts().filter((p: LinkedinPostWithUI) => p.status === 'scheduled').length),
    publishedCount: computed(() => state.posts().filter((p: LinkedinPostWithUI) => p.status === 'published').length),
    archivedCount: computed(() => state.posts().filter((p: LinkedinPostWithUI) => p.status === 'archived').length),
    totalImpressions: computed(() => state.posts().reduce((sum: number, p: LinkedinPostWithUI) => sum + (p.impressions || 0), 0)),
    totalEngagement: computed(() => state.posts().reduce((sum: number, p: LinkedinPostWithUI) => sum + (p.likes || 0) + (p.comments || 0) + (p.shares || 0), 0)),
    isEmpty: computed(() => state.posts().length === 0 && !state.loading())
  })),
  withMethods((store: any, linkedinService = inject(LinkedinService)) => {
    // 1. Define internal methods
    const loadPosts = async (): Promise<void> => {
      patchState(store, { loading: true, error: null });
      try {
        const filters: PostFilter = {
          status: store.selectedStatus() === 'all' ? undefined : (store.selectedStatus() as PostStatus),
          searchQuery: store.searchQuery() || undefined,
          page: store.currentPage(),
          limit: store.pageSize()
        };

        const response = await firstValueFrom(linkedinService.getPosts(filters));
        const posts = response.data.map((p: LinkedinPost) => ({
          ...p,
          isDeleting: false,
          isPublishing: false,
          isScheduling: false,
          isArchiving: false
        }));
        patchState(store, {
          posts,
          totalPosts: response.total || 0,
          loading: false,
          error: null
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load LinkedIn posts',
          loading: false
        });
        console.error('LinkedinStore: Error loading posts', err);
      }
    };

    const goToPage = (page: number): void => {
      if (page >= 1 && page <= store.totalPages()) {
        patchState(store, { currentPage: page });
        loadPosts();
      }
    };

    return {
      loadPosts,
      async loadPostById(id: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const post = await firstValueFrom(linkedinService.getPostById(id));
        patchState(store, {
          currentPost: {
            ...post,
            isDeleting: false,
            isPublishing: false,
            isScheduling: false,
            isArchiving: false
          },
          loading: false,
          error: null
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load post',
          loading: false
        });
        console.error('LinkedinStore: Error loading post', err);
      }
      },

      async createPost(data: CreatePostRequest): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(linkedinService.createPost(data));
        patchState(store, {
          success: 'LinkedIn post created successfully!',
          error: null,
          loading: false
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
        await loadPosts();
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to create LinkedIn post',
          loading: false
        });
        console.error('LinkedinStore: Error creating post', err);
      }
      },

      async updatePost(id: string, data: UpdatePostRequest): Promise<void> {
      patchState(store, { error: null });
      try {
        const updatedPost = await firstValueFrom(linkedinService.updatePost(id, data));
        const updatedPosts = store.posts().map((p: LinkedinPostWithUI) =>
          p.id === id ? { ...updatedPost, isDeleting: false, isPublishing: false, isScheduling: false, isArchiving: false } : p
        );
        patchState(store, {
          posts: updatedPosts,
          success: 'LinkedIn post updated successfully!',
          error: null
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to update LinkedIn post'
        });
        console.error('LinkedinStore: Error updating post', err);
      }
      },

      async deletePost(id: string): Promise<void> {
      const posts = store.posts().map((p: LinkedinPostWithUI) =>
        p.id === id ? { ...p, isDeleting: true } : p
      );
      patchState(store, { posts, error: null });

      try {
        await firstValueFrom(linkedinService.deletePost(id));
        const updatedPosts = store.posts().filter((p: LinkedinPostWithUI) => p.id !== id);
        patchState(store, {
          posts: updatedPosts,
          success: 'LinkedIn post deleted successfully!',
          error: null
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
        await loadPosts();
      } catch (err: any) {
        const errorPosts = store.posts().map((p: LinkedinPostWithUI) =>
          p.id === id ? { ...p, isDeleting: false } : p
        );
        patchState(store, {
          posts: errorPosts,
          error: err?.error?.message ?? 'Failed to delete LinkedIn post'
        });
        console.error('LinkedinStore: Error deleting post', err);
      }
      },

      async publishPost(id: string): Promise<void> {
      const posts = store.posts().map((p: LinkedinPostWithUI) =>
        p.id === id ? { ...p, isPublishing: true } : p
      );
      patchState(store, { posts, error: null });

      try {
        const updatedPost = await firstValueFrom(linkedinService.publishPost(id));
        const updatedPosts = store.posts().map((p: LinkedinPostWithUI) =>
          p.id === id ? { ...updatedPost, isPublishing: false } : p
        );
        patchState(store, {
          posts: updatedPosts,
          success: 'LinkedIn post published successfully!',
          error: null
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        const errorPosts = store.posts().map((p: LinkedinPostWithUI) =>
          p.id === id ? { ...p, isPublishing: false } : p
        );
        patchState(store, {
          posts: errorPosts,
          error: err?.error?.message ?? 'Failed to publish LinkedIn post'
        });
        console.error('LinkedinStore: Error publishing post', err);
      }
      },

      async schedulePost(id: string, scheduledAt: Date): Promise<void> {
      const posts = store.posts().map((p: LinkedinPostWithUI) =>
        p.id === id ? { ...p, isScheduling: true } : p
      );
      patchState(store, { posts, error: null });

      try {
        const updatedPost = await firstValueFrom(linkedinService.schedulePost(id, scheduledAt));
        const updatedPosts = store.posts().map((p: LinkedinPostWithUI) =>
          p.id === id ? { ...updatedPost, isScheduling: false } : p
        );
        patchState(store, {
          posts: updatedPosts,
          success: 'LinkedIn post scheduled successfully!',
          error: null
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        const errorPosts = store.posts().map((p: LinkedinPostWithUI) =>
          p.id === id ? { ...p, isScheduling: false } : p
        );
        patchState(store, {
          posts: errorPosts,
          error: err?.error?.message ?? 'Failed to schedule LinkedIn post'
        });
        console.error('LinkedinStore: Error scheduling post', err);
      }
      },

      async archivePost(id: string): Promise<void> {
      const posts = store.posts().map((p: LinkedinPostWithUI) =>
        p.id === id ? { ...p, isArchiving: true } : p
      );
      patchState(store, { posts, error: null });

      try {
        const updatedPost = await firstValueFrom(linkedinService.archivePost(id));
        const updatedPosts = store.posts().map((p: LinkedinPostWithUI) =>
          p.id === id ? { ...updatedPost, isArchiving: false } : p
        );
        patchState(store, {
          posts: updatedPosts,
          success: 'LinkedIn post archived successfully!',
          error: null
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        const errorPosts = store.posts().map((p: LinkedinPostWithUI) =>
          p.id === id ? { ...p, isArchiving: false } : p
        );
        patchState(store, {
          posts: errorPosts,
          error: err?.error?.message ?? 'Failed to archive LinkedIn post'
        });
        console.error('LinkedinStore: Error archiving post', err);
      }
    },

    /**
     * Filter by status
     */
    filterByStatus(status: PostStatus | 'all'): void {
      patchState(store, { selectedStatus: status, currentPage: 1 });
      loadPosts();
    },

    /**
     * Search posts
     */
    searchPosts(query: string): void {
      patchState(store, { searchQuery: query, currentPage: 1 });
      loadPosts();
    },

    /**
     * Clear all filters and reload
     */
    clearFilters(): void {
      patchState(store, {
        searchQuery: '',
        selectedStatus: 'all',
        currentPage: 1
      });
      loadPosts();
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
      }
    };
  })
) {
}
