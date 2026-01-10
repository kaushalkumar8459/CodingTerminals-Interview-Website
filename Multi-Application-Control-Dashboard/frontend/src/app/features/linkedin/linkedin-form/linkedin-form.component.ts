import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { LinkedinStore } from '../../../core/store/linkedin.store';
import { CreatePostRequest, UpdatePostRequest } from '../../../core/services/linkedin.service';

@Component({
  selector: 'app-linkedin-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './linkedin-form.component.html',
  styleUrls: ['./linkedin-form.component.scss']
})
export class LinkedinFormComponent implements OnInit {
  // ===== INJECT STORE AND SERVICES =====
  readonly linkedinStore = inject(LinkedinStore);
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
      content: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: [''],
      hashtags: [''],
      status: ['draft', Validators.required],
      scheduledAt: ['']
    });
  }

  /**
   * Check if in edit mode and load post data through store (NO direct API call)
   */
  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.postId = id;
      // Load post data through store (NO direct API call)
      this.linkedinStore.loadPostById(id);
    }
  }

  /**
   * Submit form - Create or Update through store (NO direct API call)
   */
  async onSubmit(): Promise<void> {
    this.submitted = true;
    if (this.form.invalid) return;

    const formValue = this.form.value;
    const hashtags = formValue.hashtags 
      ? formValue.hashtags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
      : [];

    if (this.isEditMode && this.postId) {
      // Update post through store (NO direct API call)
      const updateData: UpdatePostRequest = {
        title: formValue.title,
        content: formValue.content,
        imageUrl: formValue.imageUrl || undefined,
        hashtags,
        status: formValue.status
      };
      await this.linkedinStore.updatePost(this.postId, updateData);
    } else {
      // Create new post through store (NO direct API call)
      const createData: CreatePostRequest = {
        title: formValue.title,
        content: formValue.content,
        imageUrl: formValue.imageUrl || undefined,
        hashtags,
        scheduledAt: formValue.scheduledAt ? new Date(formValue.scheduledAt) : undefined
      };
      await this.linkedinStore.createPost(createData);
    }

    // Navigate back after success (with small delay for UX feedback)
    setTimeout(() => {
      this.router.navigate(['/linkedin']);
    }, 1000);
  }

  /**
   * Cancel and navigate back
   */
  cancel(): void {
    this.router.navigate(['/linkedin']);
  }

  /**
   * Get form controls for template
   */
  get f() {
    return this.form.controls;
  }

  /**
   * Check if field has validation error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched || this.submitted));
  }

  /**
   * Get error message for field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field) return '';
    
    if (field.hasError('required')) return `${fieldName} is required`;
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength')?.requiredLength;
      return `${fieldName} must be at least ${minLength} characters`;
    }
    return 'Invalid value';
  }

  /**
   * Parse hashtags from comma-separated string
   */
  getHashtagArray(): string[] {
    const hashtagsValue = this.form.get('hashtags')?.value || '';
    return hashtagsValue
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0);
  }

  /**
   * Get character count for content
   */
  getContentCharCount(): number {
    return this.form.get('content')?.value?.length || 0;
  }

  /**
   * Get title character count
   */
  getTitleCharCount(): number {
    return this.form.get('title')?.value?.length || 0;
  }

  // ===== EXPOSED STORE SIGNALS FOR TEMPLATE =====

  /**
   * Get loading state from store
   */
  get loading() {
    return this.linkedinStore.isLoading();
  }

  /**
   * Get error state from store
   */
  get error() {
    return this.linkedinStore.error();
  }

  /**
   * Get success state from store
   */
  get success() {
    return this.linkedinStore.success();
  }

  /**
   * Get current post being edited from store
   */
  get currentPost() {
    return this.linkedinStore.currentPost();
  }
}
