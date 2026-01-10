import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { StudyNotesStore, CreateStudyNoteRequest, UpdateStudyNoteRequest, StudyNoteCategory } from '../../../core/store/study-notes.store';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-study-notes-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './study-notes-form.component.html',
  styleUrls: ['./study-notes-form.component.scss']
})
export class StudyNotesFormComponent implements OnInit {
  // ===== INJECT STORE AND SERVICES =====
  readonly studyNotesStore = inject(StudyNotesStore);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private permissionService = inject(PermissionService);

  // ===== LOCAL UI STATE =====
  form!: FormGroup;
  submitted = false;
  isEditMode = false;
  editId: string | null = null;

  // ===== CATEGORIES =====
  categories: StudyNoteCategory[] = ['Frontend', 'Backend', 'Database', 'DevOps', 'Other'];

  ngOnInit(): void {
    // Check for edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.editId = params['id'];
        this.studyNotesStore.loadNoteById(params['id']);
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
      category: ['Frontend', Validators.required],
      content: ['', [Validators.required, Validators.minLength(20)]],
      tags: ['', Validators.required]
    });

    // Auto-populate form if editing
    if (this.isEditMode) {
      const currentNote = this.studyNotesStore.currentNote();
      if (currentNote) {
        this.form.patchValue({
          title: currentNote.title,
          category: currentNote.category,
          content: currentNote.content,
          tags: currentNote.tags.join(', ')
        });
      }
    }
  }

  /**
   * Get loading state from store
   */
  get loading() {
    return this.studyNotesStore.isLoading();
  }

  /**
   * Get error state from store
   */
  get error() {
    return this.studyNotesStore.hasError() ? this.studyNotesStore.error() : null;
  }

  /**
   * Get success state from store
   */
  get success() {
    return this.studyNotesStore.hasSuccess() ? this.studyNotesStore.success() : null;
  }

  /**
   * Get form controls
   */
  get f() {
    return this.form.controls;
  }

  /**
   * Check if user can create/edit notes
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
    
    // Parse tags from comma-separated string
    const tags = formValue.tags
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0);

    if (this.isEditMode && this.editId) {
      // Update note through store (NO direct API call)
      const updateData: UpdateStudyNoteRequest = {
        title: formValue.title,
        category: formValue.category,
        content: formValue.content,
        tags
      };
      await this.studyNotesStore.updateNote(this.editId, updateData);
    } else {
      // Create note through store (NO direct API call)
      const createData: CreateStudyNoteRequest = {
        title: formValue.title,
        category: formValue.category,
        content: formValue.content,
        tags
      };
      await this.studyNotesStore.createNote(createData);
    }

    // Navigate back on success
    if (!this.studyNotesStore.hasError()) {
      setTimeout(() => {
        this.router.navigate(['/study-notes']);
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
    this.router.navigate(['/study-notes']);
  }

  /**
   * Get character count for content
   */
  get contentLength(): number {
    return this.form.get('content')?.value?.length || 0;
  }

  /**
   * Get title character count
   */
  get titleLength(): number {
    return this.form.get('title')?.value?.length || 0;
  }

  /**
   * Get tag count
   */
  get tagCount(): number {
    const tagsValue = this.form.get('tags')?.value || '';
    if (!tagsValue) return 0;
    return tagsValue.split(',').filter((t: string) => t.trim().length > 0).length;
  }
}
