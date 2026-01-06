import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-study-notes-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="flex h-screen bg-slate-50">
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Navbar -->
        <nav class="bg-white shadow px-6 py-4 flex items-center justify-between">
          <h1 class="text-2xl font-bold text-slate-900">📚 Study Notes</h1>
          <button
            (click)="openCreateModal()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            + New Note
          </button>
        </nav>

        <!-- Content Area -->
        <div class="flex-1 overflow-auto p-6">
          <!-- Loading State -->
          <div *ngIf="isLoading" class="text-center py-12">
            <div class="inline-block animate-spin">⏳</div>
            <p class="text-slate-600 mt-2">Loading notes...</p>
          </div>

          <!-- Notes Grid -->
          <div *ngIf="!isLoading && notes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              *ngFor="let note of notes"
              class="bg-white rounded-lg shadow hover:shadow-lg transition p-4 cursor-pointer"
              (click)="openEditModal(note)"
            >
              <h3 class="font-bold text-slate-900 line-clamp-2">{{ note.title }}</h3>
              <p class="text-sm text-slate-600 mt-2 line-clamp-3">{{ note.content }}</p>
              <div class="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>{{ note.category }}</span>
                <div class="flex gap-2">
                  <button (click)="deleteNote(note._id)" class="text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoading && notes.length === 0" class="text-center py-12">
            <div class="text-5xl mb-4">📝</div>
            <p class="text-slate-600 text-lg">No study notes yet</p>
            <button
              (click)="openCreateModal()"
              class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Create your first note
            </button>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6">
          <h2 class="text-2xl font-bold text-slate-900 mb-4">
            {{ editingNote ? 'Edit Note' : 'Create New Note' }}
          </h2>

          <form [formGroup]="noteForm" (ngSubmit)="saveNote()" class="space-y-4">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Title</label>
              <input
                type="text"
                formControlName="title"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <input
                type="text"
                formControlName="category"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <!-- Content -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Content</label>
              <textarea
                formControlName="content"
                rows="6"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>

            <!-- Buttons -->
            <div class="flex gap-2 justify-end">
              <button
                type="button"
                (click)="closeModal()"
                class="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="isSaving"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-400"
              >
                {{ isSaving ? 'Saving...' : 'Save Note' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class StudyNotesListComponent implements OnInit {
  notes: any[] = [];
  isLoading = false;
  isSaving = false;
  showModal = false;
  editingNote: any = null;
  noteForm!: FormGroup;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadNotes();
  }

  initializeForm(): void {
    this.noteForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      category: [''],
      tags: [''],
    });
  }

  loadNotes(): void {
    this.isLoading = true;
    this.apiService.getAllStudyNotes().subscribe({
      next: (response) => {
        this.notes = response.notes || response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading notes:', err);
        this.isLoading = false;
      },
    });
  }

  openCreateModal(): void {
    this.editingNote = null;
    this.noteForm.reset();
    this.showModal = true;
  }

  openEditModal(note: any): void {
    this.editingNote = note;
    this.noteForm.patchValue({
      title: note.title,
      content: note.content,
      category: note.category,
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingNote = null;
    this.noteForm.reset();
  }

  saveNote(): void {
    if (this.noteForm.invalid) return;

    this.isSaving = true;
    const data = this.noteForm.value;

    if (this.editingNote) {
      this.apiService.updateStudyNote(this.editingNote._id, data).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadNotes();
        },
        error: (err) => {
          console.error('Error updating note:', err);
          this.isSaving = false;
        },
      });
    } else {
      this.apiService.createStudyNote(data).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadNotes();
        },
        error: (err) => {
          console.error('Error creating note:', err);
          this.isSaving = false;
        },
      });
    }
  }

  deleteNote(noteId: string): void {
    if (confirm('Are you sure you want to delete this note?')) {
      this.apiService.deleteStudyNote(noteId).subscribe({
        next: () => {
          this.loadNotes();
        },
        error: (err) => {
          console.error('Error deleting note:', err);
        },
      });
    }
  }
}
