import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { LinkedinStore } from '../../../core/store/linkedin.store';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-linkedin-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './linkedin-view.component.html',
  styleUrls: ['./linkedin-view.component.scss']
})
export class LinkedinViewComponent implements OnInit {
  // ===== INJECT STORE AND SERVICES =====
  readonly linkedinStore = inject(LinkedinStore);
  private route = inject(ActivatedRoute);
  private permissionService = inject(PermissionService);

  // ===== LOCAL UI STATE =====
  postId: string | null = null;

  ngOnInit(): void {
    // Get post ID from route parameters
    this.postId = this.route.snapshot.paramMap.get('id');
    if (this.postId) {
      // Load post through store (NO direct API call)
      this.linkedinStore.loadPostById(this.postId);
    }
  }

  // ===== EXPOSED STORE SIGNALS FOR TEMPLATE =====

  /**
   * Get current post from store
   */
  get post() {
    return this.linkedinStore.currentPost;
  }

  /**
   * Get loading state from store
   */
  get loading() {
    return this.linkedinStore.loading;
  }

  /**
   * Get error state from store
   */
  get error() {
    return this.linkedinStore.error;
  }

  /**
   * Get success state from store
   */
  get success() {
    return this.linkedinStore.success;
  }

  // ===== SOCIAL SHARING =====

  /**
   * Share on social media platform
   */
  shareOnSocial(platform: string): void {
    const post = this.linkedinStore.currentPost();
    if (!post) return;
    
    const shareText = `Check out this post: ${post.title}`;
    const shareUrl = window.location.href;
    
    const urls: { [key: string]: string } = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      email: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(shareText)}`
    };

    const url = urls[platform];
    if (url) {
      if (platform === 'email') {
        window.location.href = url;
      } else {
        window.open(url, '_blank', 'width=600,height=400');
      }
    }
  }

  /**
   * Copy post link to clipboard
   */
  copyLinkToClipboard(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Post link copied to clipboard!');
    });
  }

  // ===== UI HELPERS =====

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
   * Get engagement percentage
   */
  getEngagementPercentage(post: any): number {
    if (!post || !post.impressions || post.impressions === 0) return 0;
    const engagement = (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
    return Math.round((engagement / post.impressions) * 100 * 100) / 100;
  }

  /**
   * Get engagement metrics as object
   */
  getEngagementMetrics(post: any) {
    return {
      likes: post?.likes || 0,
      comments: post?.comments || 0,
      shares: post?.shares || 0,
      impressions: post?.impressions || 0,
      percentage: this.getEngagementPercentage(post)
    };
  }

  /**
   * Get status badge class
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
   * Format engagement as readable text
   */
  formatEngagement(metric: number): string {
    if (metric >= 1000000) return (metric / 1000000).toFixed(1) + 'M';
    if (metric >= 1000) return (metric / 1000).toFixed(1) + 'K';
    return metric.toString();
  }

  // ===== PERMISSION CHECKS =====

  /**
   * Check if user can edit this post
   */
  get canEdit(): boolean {
    return this.permissionService.canEdit();
  }

  /**
   * Check if user can delete this post
   */
  get canDelete(): boolean {
    return this.permissionService.canDelete();
  }

  /**
   * Check if user is admin
   */
  get isAdmin(): boolean {
    return this.permissionService.canManageUsers();
  }
}
