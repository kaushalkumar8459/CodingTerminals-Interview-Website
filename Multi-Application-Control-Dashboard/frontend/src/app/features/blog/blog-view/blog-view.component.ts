import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService, BlogPost } from '../../../core/services/blog.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-blog-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-view.component.html',
  styleUrls: ['./blog-view.component.scss'],
})
export class BlogViewComponent implements OnInit {
  private blogService = inject(BlogService);
  private route = inject(ActivatedRoute);

  post$: Observable<BlogPost> | null = null;
  loading = false;
  postId: string = '';

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.postId = params['id'];
      if (this.postId) {
        this.loadPost();
      }
    });
  }

  loadPost(): void {
    this.loading = true;
    this.post$ = this.blogService.getPostById(this.postId);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'published':
        return 'badge-success';
      case 'draft':
        return 'badge-secondary';
      default:
        return 'badge-info';
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  }
}
