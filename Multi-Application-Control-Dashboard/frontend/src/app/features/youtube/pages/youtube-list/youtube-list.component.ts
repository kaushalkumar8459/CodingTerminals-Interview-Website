import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { YouTubeService } from '../../services/youtube.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-youtube-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './youtube-list.component.html',
  styleUrls: ['./youtube-list.component.scss']
})
export class YouTubeListComponent implements OnInit, OnDestroy {
  posts: any[] = [];
  stats = { total: 0, published: 0, draft: 0, totalViews: 0 };
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private youtubeService: YouTubeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPosts();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPosts(): void {
    this.isLoading = true;
    this.youtubeService.findAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.posts = data;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load posts';
          this.isLoading = false;
          console.error('Error loading posts:', error);
        }
      });
  }

  loadStats(): void {
    this.youtubeService.getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stats = data;
        },
        error: (error) => {
          console.error('Error loading stats:', error);
        }
      });
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  createPost(): void {
    this.router.navigate(['/youtube/create']);
  }

  editPost(post: any): void {
    this.router.navigate(['/youtube/edit', post._id]);
  }

  deletePost(id: string): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.youtubeService.delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadPosts();
            this.loadStats();
          },
          error: (error) => {
            this.errorMessage = 'Failed to delete post';
            console.error('Error deleting post:', error);
          }
        });
    }
  }
}
