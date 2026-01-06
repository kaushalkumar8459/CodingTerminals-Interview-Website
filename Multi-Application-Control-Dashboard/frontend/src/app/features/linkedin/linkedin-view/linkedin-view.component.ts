import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LinkedInService, LinkedInPost } from '../../../core/services/linkedin.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-linkedin-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './linkedin-view.component.html',
  styleUrls: ['./linkedin-view.component.scss'],
})
export class LinkedInViewComponent implements OnInit {
  private linkedInService = inject(LinkedInService);
  private route = inject(ActivatedRoute);

  post$: Observable<LinkedInPost> | null = null;
  loading = false;
  error: string | null = null;
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
    this.post$ = this.linkedInService.getPostById(this.postId);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'published':
        return 'badge-success';
      case 'scheduled':
        return 'badge-warning';
      case 'draft':
        return 'badge-secondary';
      default:
        return 'badge-info';
    }
  }

  sharePost(platform: string): void {
    const text = 'Check out this LinkedIn post!';
    const urls: { [key: string]: string } = {
      twitter: `https://twitter.com/intent/tweet?text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  }
}
