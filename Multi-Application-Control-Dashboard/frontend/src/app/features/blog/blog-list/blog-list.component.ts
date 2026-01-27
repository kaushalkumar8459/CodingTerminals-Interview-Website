import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogStore } from '../../../core/store/blog.store';
import { PermissionService } from '../../../core/services/permission.service';
import { HasRoleDirective, HasPermissionDirective, AuthDisabledDirective, HasPermissionPipe } from '../../../core/directives';
import { RoleType } from '../../../core/models/role.model';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HasRoleDirective,
    HasPermissionDirective,
    AuthDisabledDirective,
    HasPermissionPipe],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss']
})
export class BlogListComponent implements OnInit {
   RoleType = RoleType;
  // ===== INJECT STORE AND SERVICES =====
  readonly blogStore = inject(BlogStore);
  private permissionService = inject(PermissionService);

  // ===== LOCAL UI STATE (not in store) =====
  showPublishConfirm = false;
  postToPublish: any = null;
  showUnpublishConfirm = false;
  postToUnpublish: any = null;
  showDeleteConfirm = false;
  postToDelete: any = null;

  ngOnInit(): void {
    // Load blog posts from store on component init (NO direct API call)
    this.blogStore.loadPosts();
  }

  // ===== EXPOSED STORE SIGNALS FOR TEMPLATE =====

  /**
   * Get posts list from store
   */
  get posts() {
    return this.blogStore.posts();
  }

  /**
   * Get loading state from store
   */
  get loading() {
    return this.blogStore.isLoading();
  }

  /**
   * Get error state from store
   */
  get error() {
    return this.blogStore.error();
  }

  /**
   * Get success state from store
   */
  get success() {
    return this.blogStore.success();
  }

  /**
   * Get current page from store
   */
  get currentPage() {
    return this.blogStore.currentPage();
  }

  /**
   * Get total pages from store
   */
  get totalPages() {
    return this.blogStore.totalPages();
  }

  /**
   * Get draft count from store
   */
  get draftCount() {
    return this.blogStore.draftCount();
  }

  /**
   * Get published count from store
   */
  get publishedCount() {
    return this.blogStore.publishedCount();
  }

  /**
   * Get current filter status from store
   */
  get selectedStatus() {
    return this.blogStore.selectedStatus();
  }

  /**
   * Get search query from store
   */
  get searchQuery() {
    return this.blogStore.searchQuery();
  }

  /**
   * Get has filters flag from store
   */
  get hasFilters() {
    return this.blogStore.hasFilters();
  }

  /**
   * Get filtered count from store
   */
  get filteredCount() {
    return this.blogStore.filteredCount();
  }

  /**
   * Get total posts count from store
   */
  get totalPosts() {
    return this.blogStore.posts().length;
  }

  // ===== PUBLISH/UNPUBLISH ACTIONS =====

  /**
   * Open publish confirmation modal
   */
  confirmPublish(post: any): void {
    this.postToPublish = post;
    this.showPublishConfirm = true;
  }

  /**
   * Publish post through store (NO direct API call)
   */
  publishPost(): void {
    if (!this.postToPublish) return;
    this.blogStore.publishPost(this.postToPublish.id);
    this.cancelPublish();
  }

  /**
   * Cancel publish confirmation
   */
  cancelPublish(): void {
    this.showPublishConfirm = false;
    this.postToPublish = null;
  }

  /**
   * Open unpublish confirmation modal
   */
  confirmUnpublish(post: any): void {
    this.postToUnpublish = post;
    this.showUnpublishConfirm = true;
  }

  /**
   * Unpublish post through store (NO direct API call)
   */
  unpublishPost(): void {
    if (!this.postToUnpublish) return;
    this.blogStore.unpublishPost(this.postToUnpublish.id);
    this.cancelUnpublish();
  }

  /**
   * Cancel unpublish confirmation
   */
  cancelUnpublish(): void {
    this.showUnpublishConfirm = false;
    this.postToUnpublish = null;
  }

  // ===== DELETE ACTIONS =====

  /**
   * Open delete confirmation modal
   */
  confirmDelete(post: any): void {
    this.postToDelete = post;
    this.showDeleteConfirm = true;
  }

  /**
   * Delete post through store (NO direct API call)
   */
  deletePost(): void {
    if (!this.postToDelete) return;
    this.blogStore.deletePost(this.postToDelete.id);
    this.cancelDelete();
  }

  /**
   * Cancel delete confirmation
   */
  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.postToDelete = null;
  }

  // ===== FILTER/SEARCH ACTIONS =====

  /**
   * Filter by status through store (NO direct API call)
   */
  filterByStatus(status: 'all' | 'draft' | 'published'): void {
    this.blogStore.filterByStatus(status);
  }

  /**
   * Search posts through store (NO direct API call)
   */
  onSearch(): void {
    this.blogStore.searchPosts(this.searchQuery);
  }

  /**
   * Clear all filters through store (NO direct API call)
   */
  clearFilters(): void {
    this.blogStore.clearFilters();
  }

  // ===== PAGINATION ACTIONS =====

  /**
   * Navigate to specific page through store (NO direct API call)
   */
  goToPage(page: number): void {
    this.blogStore.goToPage(page);
  }

  /**
   * Go to previous page through store (NO direct API call)
   */
  previousPage(): void {
    this.blogStore.previousPage();
  }

  /**
   * Go to next page through store (NO direct API call)
   */
  nextPage(): void {
    this.blogStore.nextPage();
  }

  /**
   * Get page numbers for pagination UI
   */
  getPageNumbers(): number[] {
    return this.blogStore.getPageNumbers();
  }

  // ===== UI HELPERS =====

  /**
   * Get status badge CSS classes
   */
  getStatusBadgeClass(status: string): string {
    const baseClass = 'px-3 py-1 rounded-full text-sm font-semibold';
    return status === 'published'
      ? `${baseClass} bg-green-100 text-green-800`
      : `${baseClass} bg-yellow-100 text-yellow-800`;
  }

  /**
   * Get status icon emoji
   */
  getStatusIcon(status: string): string {
    return status === 'published' ? '✅' : '📝';
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  }

  // ===== PERMISSION CHECKS =====

  /**
   * Check if user can create posts
   */
  get canCreate(): boolean {
    return this.permissionService.canEdit();
  }

  /**
   * Check if user can edit posts
   */
  get canEdit(): boolean {
    return this.permissionService.canEdit();
  }

  /**
   * Check if user can delete posts
   */
  get canDelete(): boolean {
    return this.permissionService.canDelete();
  }

  /**
   * Check if user can publish posts
   */
  get canPublish(): boolean {
    return this.permissionService.canEdit();
  }

  /**
   * Check if user is viewer only
   */
  get isViewer(): boolean {
    return this.permissionService.isViewer();
  }
}
