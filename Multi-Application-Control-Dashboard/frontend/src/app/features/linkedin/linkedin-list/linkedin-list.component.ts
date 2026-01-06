import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LinkedInService, LinkedInPost } from '../../../core/services/linkedin.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-linkedin-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './linkedin-list.component.html',
  styleUrls: ['./linkedin-list.component.scss'],
})
export class LinkedInListComponent implements OnInit {
  private linkedInService = inject(LinkedInService);
  private fb = inject(FormBuilder);

  posts$: Observable<LinkedInPost[]>;
  postForm: FormGroup;
  selectedPost: LinkedInPost | null = null;
  isFormVisible = false;
  isEditing = false;
  filter: 'all' | 'draft' | 'scheduled' | 'published' = 'all';
  filteredPosts: LinkedInPost[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    this.posts$ = this.linkedInService.posts$;
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      scheduledDate: [''],
      status: ['draft'],
    });
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.linkedInService.getPosts().subscribe(
      (posts) => {
        this.applyFilter();
        this.loading = false;
      },
      (error) => {
        this.error = 'Failed to load posts';
        this.loading = false;
      }
    );
  }

  openForm(post?: LinkedInPost): void {
    if (post) {
      this.isEditing = true;
      this.selectedPost = post;
      this.postForm.patchValue(post);
    } else {
      this.isEditing = false;
      this.selectedPost = null;
      this.postForm.reset({ status: 'draft' });
    }
    this.isFormVisible = true;
  }

  closeForm(): void {
    this.isFormVisible = false;
    this.postForm.reset();
    this.selectedPost = null;
  }

  savePost(): void {
    if (this.postForm.invalid) return;

    const postData: LinkedInPost = this.postForm.value;

    if (this.isEditing && this.selectedPost?.id) {
      this.linkedInService.updatePost(this.selectedPost.id, postData).subscribe(
        () => {
          this.closeForm();
          this.applyFilter();
        },
        (error) => {
          this.error = 'Failed to update post';
        }
      );
    } else {
      this.linkedInService.createPost(postData).subscribe(
        () => {
          this.closeForm();
          this.applyFilter();
        },
        (error) => {
          this.error = 'Failed to create post';
        }
      );
    }
  }

  deletePost(id: string): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.linkedInService.deletePost(id).subscribe(
        () => {
          this.applyFilter();
        },
        (error) => {
          this.error = 'Failed to delete post';
        }
      );
    }
  }

  publishPost(id: string): void {
    this.linkedInService.publishPost(id).subscribe(
      () => {
        this.applyFilter();
      },
      (error) => {
        this.error = 'Failed to publish post';
      }
    );
  }

  schedulePost(id: string): void {
    const scheduledDate = prompt('Enter scheduled date (YYYY-MM-DD):');
    if (scheduledDate) {
      this.linkedInService.schedulePost(id, new Date(scheduledDate)).subscribe(
        () => {
          this.applyFilter();
        },
        (error) => {
          this.error = 'Failed to schedule post';
        }
      );
    }
  }

  viewAnalytics(id: string): void {
    this.linkedInService.getAnalytics(id).subscribe(
      (analytics) => {
        alert(`Likes: ${analytics.likes}, Comments: ${analytics.comments}, Shares: ${analytics.shares}`);
      },
      (error) => {
        this.error = 'Failed to load analytics';
      }
    );
  }

  setFilter(status: 'all' | 'draft' | 'scheduled' | 'published'): void {
    this.filter = status;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.posts$.subscribe((posts) => {
      if (this.filter === 'all') {
        this.filteredPosts = posts;
      } else {
        this.filteredPosts = posts.filter((post) => post.status === this.filter);
      }
    });
  }

  getStatusClass(status: string): string {
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
}
