import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { YoutubeStore } from '../../../core/store/youtube.store';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-youtube-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './youtube-view.component.html',
  styleUrls: ['./youtube-view.component.scss']
})
export class YoutubeViewComponent implements OnInit {
  // ===== INJECT STORE AND SERVICES =====
  readonly youtubeStore = inject(YoutubeStore);
  private route = inject(ActivatedRoute);
  private permissionService = inject(PermissionService);

  ngOnInit(): void {
    // Load video by ID from store (NO direct API call)
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.youtubeStore.loadVideoById(params['id']);
      }
    });
  }

  /**
   * Get current video from store
   */
  get video() {
    return this.youtubeStore.currentVideo();
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
   * Check if user can edit videos
   */
  get canEdit(): boolean {
    return this.permissionService.canEdit();
  }

  /**
   * Check if user can delete videos
   */
  get canDelete(): boolean {
    return this.permissionService.canDelete();
  }

  /**
   * Delete video via store (NO direct API call)
   */
  async deleteVideo(): Promise<void> {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    if (this.video) {
      await this.youtubeStore.deleteVideo(this.video.id);
    }
  }

  /**
   * Publish video via store
   */
  async publishVideo(): Promise<void> {
    if (this.video) {
      await this.youtubeStore.publishVideo(this.video.id);
    }
  }

  /**
   * Archive video via store
   */
  async archiveVideo(): Promise<void> {
    if (this.video) {
      await this.youtubeStore.archiveVideo(this.video.id);
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
   * Get status badge color
   */
  getStatusBadgeClass(status: string): string {
    const baseClass = 'px-4 py-2 rounded-lg text-sm font-semibold';
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

  /**
   * Copy video URL to clipboard
   */
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
    });
  }

  /**
   * Share video (placeholder - can be extended)
   */
  shareVideo(): void {
    if (this.video) {
      const shareText = `Check out this video: ${this.video.title}`;
      if (navigator.share) {
        navigator.share({
          title: this.video.title,
          text: shareText,
          url: window.location.href
        });
      }
    }
  }

  /**
   * Share video on social media
   */
  shareOnSocial(platform: string): void {
    if (!this.video) return;

    const videoUrl = window.location.href;
    const videoTitle = this.video.title;
    const shareText = `Check out: ${videoTitle}`;

    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(videoUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(videoUrl)}`;
        break;
      default:
        return;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  }

  /**
   * Get engagement ratio (likes/views)
   */
  getEngagementRatio(): string {
    if (!this.video || this.video.views === 0) return '0%';
    const ratio = (this.video.likes / this.video.views) * 100;
    return ratio.toFixed(2) + '%';
  }

  /**
   * Get engagement level text
   */
  getEngagementLevel(): string {
    const ratio = this.video ? (this.video.likes / (this.video.views || 1)) * 100 : 0;
    if (ratio >= 10) return 'Excellent';
    if (ratio >= 5) return 'Good';
    if (ratio >= 1) return 'Fair';
    return 'Low';
  }
}
