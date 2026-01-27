import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { YoutubeStore } from '../../../core/store/youtube.store';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-youtube-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './youtube-list.component.html',
  styleUrls: ['./youtube-list.component.scss']
})
export class YoutubeListComponent implements OnInit {
  // ===== INJECT STORE AND SERVICES =====
  readonly youtubeStore = inject(YoutubeStore);
  private permissionService = inject(PermissionService);

  ngOnInit(): void {
    // Load videos from store (NO direct API call)
    this.youtubeStore.loadVideos();
  }

  /**
   * Get videos from store
   */
  get videos() {
    return this.youtubeStore.videos();
  }

  /**
   * Get loading state from store
   */
  get loading() {
    return this.youtubeStore.isLoading();
  }

  /**
   * Get error state from store
   */
  get error() {
    return this.youtubeStore.hasError() ? this.youtubeStore.error() : null;
  }

  /**
   * Get success state from store
   */
  get success() {
    return this.youtubeStore.hasSuccess() ? this.youtubeStore.success() : null;
  }

  /**
   * Get empty state from store
   */
  get isEmpty() {
    return this.youtubeStore.isEmpty();
  }

  /**
   * Get status counts from store
   */
  get draftCount() {
    return this.youtubeStore.draftCount();
  }

  get publishedCount() {
    return this.youtubeStore.publishedCount();
  }

  get archivedCount() {
    return this.youtubeStore.archivedCount();
  }

  /**
   * Get category counts from store
   */
  get frontendCount() {
    return this.youtubeStore.frontendCount();
  }

  get backendCount() {
    return this.youtubeStore.backendCount();
  }

  get databaseCount() {
    return this.youtubeStore.databaseCount();
  }

  get devopsCount() {
    return this.youtubeStore.devopsCount();
  }

  /**
   * Get analytics from store
   */
  get totalViews() {
    return this.youtubeStore.totalViews();
  }

  get totalLikes() {
    return this.youtubeStore.totalLikes();
  }

  get averageViews() {
    return this.youtubeStore.averageViews();
  }

  get averageLikes() {
    return this.youtubeStore.averageLikes();
  }

  /**
   * Check if user can create videos
   */
  get canCreate(): boolean {
    return this.permissionService.canEdit();
  }

  /**
   * Delete video via store (NO direct API call)
   */
  async deleteVideo(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    // Dispatch delete to store (NO direct API call)
    await this.youtubeStore.deleteVideo(id);
  }

  /**
   * Publish video via store
   */
  async publishVideo(id: string): Promise<void> {
    await this.youtubeStore.publishVideo(id);
  }

  /**
   * Archive video via store
   */
  async archiveVideo(id: string): Promise<void> {
    await this.youtubeStore.archiveVideo(id);
  }

  /**
   * Filter by category via store
   */
  filterByCategory(category: any): void {
    this.youtubeStore.filterByCategory(category);
  }

  /**
   * Filter by status via store
   */
  filterByStatus(status: any): void {
    this.youtubeStore.filterByStatus(status);
  }

  /**
   * Search videos via store
   */
  searchVideos(query: string): void {
    this.youtubeStore.searchVideos(query);
  }

  /**
   * Clear filters via store
   */
  clearFilters(): void {
    this.youtubeStore.clearFilters();
  }

  /**
   * Navigate to page via store
   */
  goToPage(page: number): void {
    this.youtubeStore.goToPage(page);
  }

  /**
   * Get page numbers from store
   */
  get pageNumbers() {
    return this.youtubeStore.getPageNumbers();
  }

  /**
   * Get current page from store
   */
  get currentPage() {
    return this.youtubeStore.currentPage();
  }

  /**
   * Get total pages from store
   */
  get totalPages() {
    return this.youtubeStore.totalPages();
  }

  /**
   * Get pagination state from store
   */
  get hasNextPage() {
    return this.youtubeStore.hasNextPage();
  }

  get hasPreviousPage() {
    return this.youtubeStore.hasPreviousPage();
  }

  /**
   * Next page via store
   */
  nextPage(): void {
    this.youtubeStore.nextPage();
  }

  /**
   * Previous page via store
   */
  previousPage(): void {
    this.youtubeStore.previousPage();
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  /**
   * Get status badge color
   */
  getStatusBadgeClass(status: string): string {
    const baseClass = 'px-3 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'draft':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'published':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'archived':
        return `${baseClass} bg-gray-100 text-gray-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  /**
   * Get category badge color
   */
  getCategoryBadgeClass(category: string): string {
    const baseClass = 'px-3 py-1 rounded-full text-xs font-semibold';
    switch (category) {
      case 'Frontend':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case 'Backend':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'Database':
        return `${baseClass} bg-purple-100 text-purple-800`;
      case 'DevOps':
        return `${baseClass} bg-orange-100 text-orange-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category: string): string {
    switch (category) {
      case 'Frontend':
        return '🎨';
      case 'Backend':
        return '⚙️';
      case 'Database':
        return '🗄️';
      case 'DevOps':
        return '🚀';
      default:
        return '📺';
    }
  }

  /**
   * Get status icon
   */
  getStatusIcon(status: string): string {
    switch (status) {
      case 'draft':
        return '📝';
      case 'published':
        return '✅';
      case 'archived':
        return '📦';
      default:
        return '❓';
    }
  }
}
