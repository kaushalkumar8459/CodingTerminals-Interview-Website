import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { StudyNotesStore } from '../../../core/store/study-notes.store';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-study-notes-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './study-notes-view.component.html',
  styleUrls: ['./study-notes-view.component.scss']
})
export class StudyNotesViewComponent implements OnInit {
  // ===== INJECT STORE AND SERVICES =====
  readonly studyNotesStore = inject(StudyNotesStore);
  private route = inject(ActivatedRoute);
  private permissionService = inject(PermissionService);

  ngOnInit(): void {
    // Load note by ID from store (NO direct API call)
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.studyNotesStore.loadNoteById(params['id']);
      }
    });
  }

  /**
   * Get current note from store
   */
  get note() {
    return this.studyNotesStore.currentNote();
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
   * Check if user can edit notes
   */
  get canEdit(): boolean {
    return this.permissionService.canEdit();
  }

  /**
   * Check if user can delete notes
   */
  get canDelete(): boolean {
    return this.permissionService.canDelete();
  }

  /**
   * Delete note via store (NO direct API call)
   */
  async deleteNote(): Promise<void> {
    if (!confirm('Are you sure you want to delete this study note?')) {
      return;
    }

    if (this.note) {
      await this.studyNotesStore.deleteNote(this.note.id);
    }
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format time for display
   */
  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get category badge color
   */
  getCategoryBadgeClass(category: string): string {
    const baseClass = 'px-4 py-2 rounded-lg text-sm font-semibold';
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

  /**
   * Get tag badge color
   */
  getTagBadgeClass(): string {
    return 'px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800';
  }

  /**
   * Copy text to clipboard
   */
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
      console.log('Copied to clipboard');
    });
  }

  /**
   * Share note (placeholder - can be extended)
   */
  shareNote(): void {
    if (this.note) {
      const shareText = `Check out this study note: ${this.note.title}`;
      if (navigator.share) {
        navigator.share({
          title: this.note.title,
          text: shareText,
          url: window.location.href
        });
      }
    }
  }
}
