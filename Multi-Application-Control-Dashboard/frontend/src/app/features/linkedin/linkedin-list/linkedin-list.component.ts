import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LinkedinStore } from '../../../core/store/linkedin.store';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-linkedin-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './linkedin-list.component.html',
  styleUrls: ['./linkedin-list.component.scss']
})
export class LinkedinListComponent implements OnInit {
  // ===== INJECT STORE AND SERVICES =====
  readonly linkedinStore = inject(LinkedinStore);
  private permissionService = inject(PermissionService);

  // ===== LOCAL UI STATE (not in store) =====
  showDeleteConfirm = false;
  postToDelete: any = null;
  showScheduleModal = false;
  postToSchedule: any = null;
  scheduleDateTime: string = '';

  statusOptions = ['draft', 'scheduled', 'published', 'archived'] as const;

  ngOnInit(): void {
    // Load posts from store on component init (NO direct API call)
    this.linkedinStore.loadPosts();
  }

  // ===== EXPOSED STORE SIGNALS FOR TEMPLATE =====

  /**
   * Get posts list from store
   */
  get posts() {
    return this.linkedinStore.posts();
  }

  /**
   * Get loading state from store
   */
  get loading() {
    return this.linkedinStore.isLoading();
  }

  /**
   * Get error state from store
   */
  get error() {
    return this.linkedinStore.error();
  }

  /**
   * Get success state from store
   */
  get success() {
    return this.linkedinStore.success();
  }

  /**
   * Get current page from store
   */
  get currentPage() {
    return this.linkedinStore.currentPage();
  }

  /**
   * Get total pages from store
   */
  get totalPages() {
    return this.linkedinStore.totalPages();
  }

  /**
   * Get draft count from store
   */
  get draftCount() {
    return this.linkedinStore.draftCount();
  }

  /**
   * Get scheduled count from store
   */
  get scheduledCount() {
    return this.linkedinStore.scheduledCount();
  }

  /**
   * Get published count from store
   */
  get publishedCount() {
    return this.linkedinStore.publishedCount();
  }

  /**
   * Get archived count from store
   */
  get archivedCount() {
    return this.linkedinStore.archivedCount();
  }

  /**
   * Get total impressions from store
   */
  get totalImpressions() {
    return this.linkedinStore.totalImpressions();
  }

  /**
   * Get total engagement from store
   */
  get totalEngagement() {
    return this.linkedinStore.totalEngagement();
  }

  /**
   * Get current filter status from store
   */
  get selectedStatus() {
    return this.linkedinStore.selectedStatus();
  }

  /**
   * Get search query from store
   */
  get searchQuery() {
    return this.linkedinStore.searchQuery();
  }

  /**
   * Get has filters flag from store
   */
  get hasFilters() {
    return this.linkedinStore.hasFilters();
  }

  /**
   * Get filtered count from store
   */
  get filteredCount() {
    return this.linkedinStore.filteredCount();
  }

  /**
   * Get is empty flag from store
   */
  get isEmpty() {
    return this.linkedinStore.isEmpty();
  }

  /**
   * Get total posts count
   */
  get totalPosts() {
    return this.linkedinStore.posts().length;
  }

  // ===== POST ACTIONS =====

  /**
   * Filter posts by status through store (NO direct API call)
   */
  filterByStatus(status: 'draft' | 'scheduled' | 'published' | 'archived' | 'all'): void {
    this.linkedinStore.filterByStatus(status as any);
  }

  /**
   * Search posts through store (NO direct API call)
   */
  onSearch(query: string): void {
    this.linkedinStore.searchPosts(query);
  }

  /**
   * Clear filters through store (NO direct API call)
   */
  clearFilters(): void {
    this.linkedinStore.clearFilters();
  }

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
    this.linkedinStore.deletePost(this.postToDelete.id);
    this.cancelDelete();
  }

  /**
   * Cancel delete confirmation
   */
  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.postToDelete = null;
  }

  /**
   * Open schedule modal
   */
  openScheduleModal(post: any): void {
    this.postToSchedule = post;
    this.scheduleDateTime = '';
    this.showScheduleModal = true;
  }

  /**
   * Close schedule modal
   */
  closeScheduleModal(): void {
    this.showScheduleModal = false;
    this.postToSchedule = null;
    this.scheduleDateTime = '';
  }

  /**
   * Schedule post through store (NO direct API call)
   */
  schedulePostAction(): void {
    if (!this.postToSchedule || !this.scheduleDateTime) {
      return;
    }

    const scheduledDate = new Date(this.scheduleDateTime);
    if (scheduledDate <= new Date()) {
      return;
    }

    this.linkedinStore.schedulePost(this.postToSchedule.id, scheduledDate);
    this.closeScheduleModal();
  }

  /**
   * Publish post immediately through store (NO direct API call)
   */
  publishPost(post: any): void {
    if (!post) return;
    this.linkedinStore.publishPost(post.id);
  }

  /**
   * Archive post through store (NO direct API call)
   */
  archivePost(post: any): void {
    if (!post) return;
    this.linkedinStore.archivePost(post.id);
  }

  // ===== PAGINATION ACTIONS =====

  /**
   * Navigate to specific page through store (NO direct API call)
   */
  goToPage(page: number): void {
    this.linkedinStore.goToPage(page);
  }

  /**
   * Go to previous page through store (NO direct API call)
   */
  previousPage(): void {
    this.linkedinStore.previousPage();
  }

  /**
   * Go to next page through store (NO direct API call)
   */
  nextPage(): void {
    this.linkedinStore.nextPage();
  }

  /**
   * Get page numbers for pagination UI
   */
  getPageNumbers(): number[] {
    return this.linkedinStore.getPageNumbers();
  }

  // ===== UI HELPERS =====

  /**
   * Get status badge CSS classes
   */
  getStatusBadgeClass(status: string): string {
    const baseClass = 'px-3 py-1 rounded-full text-sm font-semibold inline-block';
    switch (status) {
      case 'published':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'scheduled':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case 'draft':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'archived':
        return `${baseClass} bg-gray-100 text-gray-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  /**
   * Get status icon
   */
  getStatusIcon(status: string): string {
    switch (status) {
      case 'published':
        return '✅';
      case 'scheduled':
        return '⏰';
      case 'draft':
        return '📝';
      case 'archived':
        return '📦';
      default:
        return '📄';
    }
  }

  /**
   * Format date for display
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    return this.formatDate(date);
  }

  /**
   * Calculate engagement rate
   */
  calculateEngagementRate(post: any): number {
    if (!post.impressions || post.impressions === 0) return 0;
    const engagement = (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
    return Math.round((engagement / post.impressions) * 100 * 100) / 100;
  }

  /**
   * Get minimum datetime string for schedule input (current time)
   */
  getMinDateTime(): string {
    return new Date().toISOString().slice(0, 16);
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
   * Check if user is viewer only
   */
  get isViewer(): boolean {
    return this.permissionService.isViewer();
  }
}
