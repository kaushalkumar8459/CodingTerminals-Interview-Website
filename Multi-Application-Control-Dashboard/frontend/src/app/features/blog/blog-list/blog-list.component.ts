import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlogService, BlogPost } from '../../../core/services/blog.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss'],
})
export class BlogListComponent implements OnInit {
  private blogService = inject(BlogService);
  private fb = inject(FormBuilder);

  posts$: Observable<BlogPost[]>;
  postForm: FormGroup;
  selectedPost: BlogPost | null = null;
  isFormVisible = false;
  isEditing = false;
  filter: 'all' | 'draft' | 'published' = 'all';
  filteredPosts: BlogPost[] = [];
  loading = false;
  error: string | null = null;
  searchQuery = '';

  constructor() {
    this.posts$ = this.blogService.posts$;
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      excerpt: ['', [Validators.required, Validators.minLength(10)]],
      author: [''],
      tags: [''],
      status: ['draft'],
    });
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.blogService.getPosts().subscribe(
      () => {
        this.applyFilter();
        this.loading = false;
      },
      (error) => {
        this.error = 'Failed to load blog posts';
        this.loading = false;
      }
    );
  }

  openForm(post?: BlogPost): void {
    if (post) {
      this.isEditing = true;
      this.selectedPost = post;
      this.postForm.patchValue({
        ...post,
        tags: post.tags?.join(', ') || '',
      });
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

    const formValue = this.postForm.value;
    const postData: BlogPost = {
      ...formValue,
      tags: formValue.tags ? formValue.tags.split(',').map((t: string) => t.trim()) : [],
    };

    if (this.isEditing && this.selectedPost?.id) {
      this.blogService.updatePost(this.selectedPost.id, postData).subscribe(
        () => {
          this.closeForm();
          this.applyFilter();
        },
        (error) => {
          this.error = 'Failed to update post';
        }
      );
    } else {
      this.blogService.createPost(postData).subscribe(
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

  saveDraft(id: string): void {
    if (this.postForm.invalid) return;

    const formValue = this.postForm.value;
    const postData: BlogPost = {
      ...formValue,
      tags: formValue.tags ? formValue.tags.split(',').map((t: string) => t.trim()) : [],
    };

    this.blogService.saveDraft(id, postData).subscribe(
      () => {
        this.closeForm();
        this.applyFilter();
      },
      (error) => {
        this.error = 'Failed to save draft';
      }
    );
  }

  publishPost(id: string): void {
    if (confirm('Are you sure you want to publish this post?')) {
      this.blogService.publishPost(id).subscribe(
        () => {
          this.applyFilter();
        },
        (error) => {
          this.error = 'Failed to publish post';
        }
      );
    }
  }

  deletePost(id: string): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.blogService.deletePost(id).subscribe(
        () => {
          this.applyFilter();
        },
        (error) => {
          this.error = 'Failed to delete post';
        }
      );
    }
  }

  setFilter(status: 'all' | 'draft' | 'published'): void {
    this.filter = status;
    this.applyFilter();
  }

  searchPosts(): void {
    if (this.searchQuery.trim()) {
      this.loading = true;
      this.blogService.searchPosts(this.searchQuery).subscribe(
        (posts) => {
          this.filteredPosts = posts;
          this.loading = false;
        },
        (error) => {
          this.error = 'Failed to search posts';
          this.loading = false;
        }
      );
    } else {
      this.applyFilter();
    }
  }

  loadTrendingPosts(): void {
    this.loading = true;
    this.blogService.getTrendingPosts(5).subscribe(
      (posts) => {
        this.filteredPosts = posts;
        this.loading = false;
      },
      (error) => {
        this.error = 'Failed to load trending posts';
        this.loading = false;
      }
    );
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
      case 'draft':
        return 'badge-secondary';
      default:
        return 'badge-info';
    }
  }
}
