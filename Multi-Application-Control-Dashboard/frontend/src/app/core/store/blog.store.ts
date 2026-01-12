import { Injectable, inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { BlogService, BlogPost, CreateBlogPostRequest, UpdateBlogPostRequest } from '../services/blog.service';
import { firstValueFrom } from 'rxjs';

export interface BlogPostWithUI extends BlogPost {
  isPublishing?: boolean;
  isDeleting?: boolean;
}

export interface BlogState {
  posts: BlogPostWithUI[];
  currentPost: BlogPostWithUI | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  currentPage: number;
  pageSize: number;
  totalPosts: number;
  selectedStatus: 'all' | 'draft' | 'published';
  searchQuery: string;
}

const initialState: BlogState = {
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
export class BlogStore extends signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    totalPages: computed(() => Math.ceil(state.totalPosts() / state.pageSize())),
    hasFilters: computed(() => state.selectedStatus() !== 'all' || state.searchQuery() !== ''),
    filteredCount: computed(() => state.posts().length),
    isLoading: computed(() => state.loading()),
    draftCount: computed(() => state.posts().filter(p => p.status === 'draft').length),
    publishedCount: computed(() => state.posts().filter(p => p.status === 'published').length),
    isEmpty: computed(() => state.posts().length === 0 && !state.loading())
  })),
  withMethods((store, blogService = inject(BlogService)) => ({
    // ===== PUBLIC ACTIONS (called from components) =====
    
    /**
     * Load blog posts with current filters - ASYNC
     */
    async loadPosts(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const selectedStatus = store.selectedStatus();
        const filters: any = {
          status: selectedStatus === 'all' ? undefined : selectedStatus,
          searchQuery: store.searchQuery() || undefined,
          page: store.currentPage(),
          limit: store.pageSize()
        };

        const response = await firstValueFrom(blogService.getPosts(filters));
        const posts = response.data.map(p => ({
          ...p,
          isPublishing: false,
          isDeleting: false
        }));
        patchState(store, {
          posts,
          totalPosts: response.total || 0,
          loading: false,
          error: null
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load blog posts',
          loading: false
        });
        console.error('BlogStore: Error loading posts', err);
      }
    },

    /**
     * Load single blog post by ID - ASYNC
     */
    async loadPostById(id: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const post = await firstValueFrom(blogService.getPostById(id));
        patchState(store, {
          currentPost: {
            ...post,
            isPublishing: false,
            isDeleting: false
          },
          loading: false,
          error: null
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load post',
          loading: false
        });
        console.error('BlogStore: Error loading post', err);
      }
    },

    /**
     * Create new blog post - ASYNC
     */
    async createPost(data: CreateBlogPostRequest): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(blogService.createPost(data));
        patchState(store, {
          success: 'Blog post created successfully!',
          error: null,
          loading: false
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
        await (store as any)['loadPosts']();
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to create blog post',
          loading: false
        });
        console.error('BlogStore: Error creating post', err);
      }
    },

    /**
     * Update existing blog post - ASYNC
     */
    async updatePost(id: string, data: UpdateBlogPostRequest): Promise<void> {
      patchState(store, { error: null });
      try {
        const updatedPost = await firstValueFrom(blogService.updatePost(id, data));
        const updatedPosts = (store as any)['posts']().map((p: BlogPostWithUI) =>
          p.id === id ? { ...updatedPost, isPublishing: false, isDeleting: false } : p
        );
        patchState(store, {
          posts: updatedPosts,
          currentPost: { ...updatedPost, isPublishing: false, isDeleting: false },
          success: 'Blog post updated successfully!',
          error: null
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to update blog post'
        });
        console.error('BlogStore: Error updating post', err);
      }
    },

    /**
     * Publish a draft post - ASYNC
     */
    async publishPost(postId: string): Promise<void> {
      // Set publishing state for UI
      const posts = (store as any)['posts']().map((p: BlogPostWithUI) =>
        p.id === postId ? { ...p, isPublishing: true } : p
      );
      patchState(store, { posts, error: null });

      try {
        await firstValueFrom(blogService.publishPost(postId));
        // Update post status and clear publishing flag
        const updatedPosts = (store as any)['posts']().map((p: BlogPostWithUI) =>
          p.id === postId ? { ...p, status: 'published' as const, isPublishing: false } : p
        );
        patchState(store, {
          posts: updatedPosts,
          success: 'Post published successfully!',
          error: null
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
        await (store as any)['loadPosts']();
      } catch (err: any) {
        // Clear publishing flag on error
        const errorPosts = (store as any)['posts']().map((p: BlogPostWithUI) =>
          p.id === postId ? { ...p, isPublishing: false } : p
        );
        patchState(store, {
          posts: errorPosts,
          error: err?.error?.message ?? 'Failed to publish post'
        });
        console.error('BlogStore: Error publishing post', err);
      }
    },

    /**
     * Unpublish a published post - ASYNC
     */
    async unpublishPost(postId: string): Promise<void> {
      const posts = (store as any)['posts']().map((p: BlogPostWithUI) =>
        p.id === postId ? { ...p, isPublishing: true } : p
      );
      patchState(store, { posts, error: null });

      try {
        await firstValueFrom(blogService.unpublishPost(postId));
        const updatedPosts = (store as any)['posts']().map((p: BlogPostWithUI) =>
          p.id === postId ? { ...p, status: 'draft' as const, isPublishing: false } : p
        );
        patchState(store, {
          posts: updatedPosts,
          success: 'Post unpublished successfully!',
          error: null
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
        await (store as any)['loadPosts']();
      } catch (err: any) {
        const errorPosts = (store as any)['posts']().map((p: BlogPostWithUI) =>
          p.id === postId ? { ...p, isPublishing: false } : p
        );
        patchState(store, {
          posts: errorPosts,
          error: err?.error?.message ?? 'Failed to unpublish post'
        });
        console.error('BlogStore: Error unpublishing post', err);
      }
    },

    /**
     * Delete a blog post - ASYNC
     */
    async deletePost(postId: string): Promise<void> {
      const posts = (store as any)['posts']().map((p: BlogPostWithUI) =>
        p.id === postId ? { ...p, isDeleting: true } : p
      );
      patchState(store, { posts, error: null });

      try {
        await firstValueFrom(blogService.deletePost(postId));
        const updatedPosts = (store as any)['posts']().filter((p: BlogPostWithUI) => p.id !== postId);
        patchState(store, {
          posts: updatedPosts,
          success: 'Post deleted successfully!',
          error: null
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
        await (store as any)['loadPosts']();
      } catch (err: any) {
        const errorPosts = (store as any)['posts']().map((p: BlogPostWithUI) =>
          p.id === postId ? { ...p, isDeleting: false } : p
        );
        patchState(store, {
          posts: errorPosts,
          error: err?.error?.message ?? 'Failed to delete post'
        });
        console.error('BlogStore: Error deleting post', err);
      }
    },

    /**
     * Filter by status
     */
    filterByStatus(status: 'all' | 'draft' | 'published'): void {
      patchState(store, { selectedStatus: status, currentPage: 1 });
      (store as any)['loadPosts']();
    },

    /**
     * Search posts
     */
    searchPosts(query: string): void {
      patchState(store, { searchQuery: query, currentPage: 1 });
      (store as any)['loadPosts']();
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
      (store as any)['loadPosts']();
    },

    /**
     * Navigate to specific page
     */
    goToPage(page: number): void {
      if (page >= 1 && page <= store.totalPages()) {
        patchState(store, { currentPage: page });
        (store as any)['loadPosts']();
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
     * Clear current post
     */
    clearCurrentPost(): void {
      patchState(store, { currentPost: null });
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