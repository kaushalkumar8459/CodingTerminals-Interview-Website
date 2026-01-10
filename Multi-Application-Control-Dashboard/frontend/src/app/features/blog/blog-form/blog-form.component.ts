import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { BlogStore } from '../../../core/store/blog.store';
import { CreateBlogPostRequest, UpdateBlogPostRequest } from '../../../core/services/blog.service';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './blog-form.component.html',
  styleUrls: ['./blog-form.component.scss']
})
export class BlogFormComponent implements OnInit {
  // ===== INJECT STORE AND SERVICES =====
  readonly blogStore = inject(BlogStore);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // ===== LOCAL UI STATE =====
  form!: FormGroup;
  submitted = false;
  isEditMode = false;
  postId: string | null = null;

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  /**
   * Initialize form with validators
   */
  private initForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      excerpt: ['', Validators.minLength(10)],
      tags: [''],
      author: ['', Validators.required],
      featuredImage: [''],
      status: ['draft', Validators.required]
    });
  }

  /**
   * Check if in edit mode and load post data
   */
  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.postId = id;
      // Load post data into form through store (NO direct API call)
      this.blogStore.loadPostById(id);
    }
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
   * Get success state from store
   */
  get success() {
    return this.blogStore.success();
  }

  /**
   * Get current post from store (for edit mode)
   */
  get currentPost() {
    return this.blogStore.currentPost();
  }

  /**
   * Submit form - Create or Update through store (NO direct API call)
   */
  async onSubmit(): Promise<void> {
    this.submitted = true;
    if (this.form.invalid) return;

    const formValue = this.form.value;
    const tags = formValue.tags 
      ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
      : [];

    if (this.isEditMode && this.postId) {
      // Update post through store (NO direct API call)
      const updateData: UpdateBlogPostRequest = {
        title: formValue.title,
        content: formValue.content,
        excerpt: formValue.excerpt || undefined,
        tags,
        featuredImage: formValue.featuredImage || undefined,
        status: formValue.status
      };
      await this.blogStore.updatePost(this.postId, updateData);
    } else {
      // Create new post through store (NO direct API call)
      const createData: CreateBlogPostRequest = {
        title: formValue.title,
        content: formValue.content,
        excerpt: formValue.excerpt || undefined,
        author: formValue.author,
        tags,
        featuredImage: formValue.featuredImage || undefined
      };
      await this.blogStore.createPost(createData);
    }

    // Navigate back after success
    setTimeout(() => {
      this.router.navigate(['/blog']);
    }, 1000);
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    this.router.navigate(['/blog']);
  }

  /**
   * Get form control for template
   */
  get f() {
    return this.form.controls;
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched || this.submitted));
  }

  /**
   * Parse tags from comma-separated string
   */
  getTagArray(): string[] {
    const tagsValue = this.form.get('tags')?.value || '';
    return tagsValue
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0);
  }
}
