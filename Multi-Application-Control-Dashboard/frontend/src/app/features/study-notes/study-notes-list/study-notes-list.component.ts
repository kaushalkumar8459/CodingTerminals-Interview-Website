import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudyNotesStore } from '../../../core/store/study-notes.store';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-study-notes-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './study-notes-list.component.html',
  styleUrls: ['./study-notes-list.component.scss']
})
export class StudyNotesListComponent implements OnInit {
  // ===== INJECT STORE AND SERVICES =====
  readonly studyNotesStore = inject(StudyNotesStore);
  private permissionService = inject(PermissionService);

  ngOnInit(): void {
    // Load study notes from store (NO direct API call)
    this.studyNotesStore.loadNotes();
  }

  /**
   * Get notes from store
   */
  get studyNotes() {
    return this.studyNotesStore.notes();
  }

  /**
   * Get notes from store (alternate name)
   */
  get notes() {
    return this.studyNotesStore.notes();
  }

  /**
   * Get loading state from store
   */
  get loading() {
    return this.studyNotesStore.isLoading();
  }

  /**
   * Get error state from store
   */
  get error() {
    return this.studyNotesStore.hasError() ? this.studyNotesStore.error() : null;
  }

  /**
   * Get success state from store
   */
  get success() {
    return this.studyNotesStore.hasSuccess() ? this.studyNotesStore.success() : null;
  }

  /**
   * Get empty state from store
   */
  get isEmpty() {
    return this.studyNotesStore.isEmpty();
  }

  /**
   * Get category counts from store
   */
  get frontendCount() {
    return this.studyNotesStore.frontendCount();
  }

  get backendCount() {
    return this.studyNotesStore.backendCount();
  }

  get databaseCount() {
    return this.studyNotesStore.databaseCount();
  }

  get devopsCount() {
    return this.studyNotesStore.devopsCount();
  }

  /**
   * Check if user can create notes
   */
  get canCreate(): boolean {
    return this.permissionService.canEdit();
  }

  /**
   * Delete note via store (NO direct API call)
   */
  async deleteNote(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this study note?')) {
      return;
    }

    // Dispatch delete to store (NO direct API call)
    await this.studyNotesStore.deleteNote(id);
  }

  /**
   * Filter by category via store
   */
  async filterByCategory(category: any): Promise<void> {
    this.studyNotesStore.filterByCategory(category);
  }

  /**
   * Search notes via store
   */
  async searchNotes(query: string): Promise<void> {
    this.studyNotesStore.searchNotes(query);
  }

  /**
   * Clear filters via store
   */
  async clearFilters(): Promise<void> {
    this.studyNotesStore.clearFilters();
  }

  /**
   * Navigate to page via store
   */
  goToPage(page: number): void {
    this.studyNotesStore.goToPage(page);
  }

  /**
   * Get page numbers from store
   */
  get pageNumbers() {
    return this.studyNotesStore.getPageNumbers();
  }

  /**
   * Get current page from store
   */
  get currentPage() {
    return this.studyNotesStore.currentPage();
  }

  /**
   * Get total pages from store
   */
  get totalPages() {
    return this.studyNotesStore.totalPages();
  }

  /**
   * Get pagination state from store
   */
  get hasNextPage() {
    return this.studyNotesStore.hasNextPage();
  }

  get hasPreviousPage() {
    return this.studyNotesStore.hasPreviousPage();
  }

  /**
   * Next page via store
   */
  nextPage(): void {
    this.studyNotesStore.nextPage();
  }

  /**
   * Previous page via store
   */
  previousPage(): void {
    this.studyNotesStore.previousPage();
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
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
        return '📝';
    }
  }
}
