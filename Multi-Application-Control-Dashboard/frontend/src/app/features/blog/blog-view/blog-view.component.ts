import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { BlogStore } from '../../../core/store/blog.store';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-blog-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-view.component.html',
  styleUrls: ['./blog-view.component.scss']
})
export class BlogViewComponent implements OnInit {
  // ===== INJECT STORE AND SERVICES =====
  readonly blogStore = inject(BlogStore);
  private route = inject(ActivatedRoute);
  private permissionService = inject(PermissionService);

  // ===== LOCAL UI STATE =====
  postId: string | null = null;
  copied = false;

  ngOnInit(): void {
    // Get post ID from route parameters
    this.postId = this.route.snapshot.paramMap.get('id');
    if (this.postId) {
      // Load post through store (NO direct API call)
      this.blogStore.loadPostById(this.postId);
    }
  }

  // ===== EXPOSED STORE SIGNALS FOR TEMPLATE =====

  /**
   * Get current post from store
   */
  get post() {
    return this.blogStore.currentPost();
  }

  /**
   * Get current post from store (alias)
   */
  get currentPost() {
    return this.blogStore.currentPost();
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
   * Share on social media
   */
  shareOnSocial(platform: string): void {
    if (!this.blogStore.currentPost()) return;
    
    const post = this.blogStore.currentPost()!;
    const shareUrl = `https://www.${platform}.com/share?url=${window.location.href}&title=${post.title}`;
    window.open(shareUrl, '_blank');
  }

  /**
   * Copy link to clipboard
   */
  copyLink(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
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
   * Get engagement percentage
   */
  getEngagementPercentage(post: any): number {
    if (!post.views || post.views === 0) return 0;
    const engagement = (post.likes || 0) + (post.comments || 0);
    return Math.round((engagement / post.views) * 100 * 100) / 100;
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
}
