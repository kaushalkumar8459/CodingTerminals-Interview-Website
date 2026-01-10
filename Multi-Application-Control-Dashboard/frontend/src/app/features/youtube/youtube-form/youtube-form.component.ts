import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { YoutubeStore, CreateYoutubeVideoRequest, UpdateYoutubeVideoRequest, YoutubeCategory, YoutubeVideoStatus } from '../../../core/store/youtube.store';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-youtube-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './youtube-form.component.html',
  styleUrls: ['./youtube-form.component.scss']
})
export class YoutubeFormComponent implements OnInit {
  // ===== INJECT STORE AND SERVICES =====
  readonly youtubeStore = inject(YoutubeStore);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private permissionService = inject(PermissionService);

  // ===== LOCAL UI STATE =====
  form!: FormGroup;
  submitted = false;
  isEditMode = false;
  editId: string | null = null;

  // ===== CATEGORIES & STATUSES =====
  categories: YoutubeCategory[] = ['Frontend', 'Backend', 'Database', 'DevOps', 'Other'];
  statuses: YoutubeVideoStatus[] = ['draft', 'published'];

  ngOnInit(): void {
    // Check for edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.editId = params['id'];
        this.youtubeStore.loadVideoById(params['id']);
      }
    });

    this.initForm();
  }

  /**
   * Initialize form with validators
   */
  private initForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      videoUrl: ['', [Validators.required, this.youtubeUrlValidator]],
      category: ['Frontend', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['draft', Validators.required]
    });

    // Auto-populate form if editing
    if (this.isEditMode) {
      const currentVideo = this.youtubeStore.currentVideo();
      if (currentVideo) {
        this.form.patchValue({
          title: currentVideo.title,
          videoUrl: currentVideo.videoUrl,
          category: currentVideo.category,
          description: currentVideo.description,
          status: currentVideo.status
        });
      }
    }
  }

  /**
   * Custom validator for YouTube URL
   */
  private youtubeUrlValidator(control: any): any {
    if (!control.value) {
      return null;
    }
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\//;
    return youtubeRegex.test(control.value) ? null : { invalidYoutubeUrl: true };
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
   * Get form controls
   */
  get f() {
    return this.form.controls;
  }

  /**
   * Check if user can create/edit videos
   */
  get canEdit(): boolean {
    return this.permissionService.canEdit();
  }

  /**
   * Submit form - Create or update through store (NO direct API call)
   */
  async onSubmit(): Promise<void> {
    this.submitted = true;
    if (this.form.invalid) return;

    const formValue = this.form.value;

    if (this.isEditMode && this.editId) {
      // Update video through store (NO direct API call)
      const updateData: UpdateYoutubeVideoRequest = {
        title: formValue.title,
        videoUrl: formValue.videoUrl,
        category: formValue.category,
        description: formValue.description,
        status: formValue.status
      };
      await this.youtubeStore.updateVideo(this.editId, updateData);
    } else {
      // Create video through store (NO direct API call)
      const createData: CreateYoutubeVideoRequest = {
        title: formValue.title,
        videoUrl: formValue.videoUrl,
        category: formValue.category,
        description: formValue.description,
        status: formValue.status
      };
      await this.youtubeStore.createVideo(createData);
    }

    // Navigate back on success
    if (!this.youtubeStore.hasError()) {
      setTimeout(() => {
        this.router.navigate(['/youtube']);
      }, 1500);
    }
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched || this.submitted));
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    this.router.navigate(['/youtube']);
  }

  /**
   * Get character count for description
   */
  get descriptionLength(): number {
    return this.form.get('description')?.value?.length || 0;
  }

  /**
   * Get title character count
   */
  get titleLength(): number {
    return this.form.get('title')?.value?.length || 0;
  }

  /**
   * Get form mode label
   */
  get formModeLabel(): string {
    return this.isEditMode ? 'Edit YouTube Video' : 'Create YouTube Video';
  }

  /**
   * Get submit button label
   */
  get submitButtonLabel(): string {
    return this.loading ? (this.isEditMode ? 'Updating...' : 'Creating...') : (this.isEditMode ? 'Update Video' : 'Create Video');
  }
}
