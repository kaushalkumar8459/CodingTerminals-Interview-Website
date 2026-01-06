import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-study-notes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-3xl font-bold text-gray-800">Study Notes</h2>
        <button 
          (click)="toggleForm()"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {{ showForm ? 'Cancel' : 'New Note' }}
        </button>
      </div>

      <!-- Filter Section -->
      <div class="bg-white rounded-lg shadow-md p-4 flex gap-4">
        <input 
          type="text"
          placeholder="Search notes..."
          (input)="searchTerm = $event.target.value; filterNotes()"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select 
          (change)="selectedDifficulty = $event.target.value; filterNotes()"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <!-- Form Section -->
      <div *ngIf="showForm" class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold mb-4">{{ editingId ? 'Edit' : 'Create' }} Study Note</h3>
        <form [formGroup]="noteForm" (ngSubmit)="submitForm()" class="space-y-4">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">Title</label>
            <input 
              type="text"
              formControlName="title"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 font-semibold mb-2">Subject</label>
              <input 
                type="text"
                formControlName="subject"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-gray-700 font-semibold mb-2">Category</label>
              <input 
                type="text"
                formControlName="category"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">Content</label>
            <textarea 
              formControlName="content"
              rows="6"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 font-semibold mb-2">Difficulty</label>
              <select 
                formControlName="difficulty"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select difficulty</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-700 font-semibold mb-2">Priority</label>
              <select 
                formControlName="priority"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">Tags (comma-separated)</label>
            <input 
              type="text"
              formControlName="tags"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            type="submit"
            [disabled]="noteForm.invalid || isSubmitting"
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
          >
            {{ isSubmitting ? 'Saving...' : 'Save Note' }}
          </button>
        </form>
      </div>

      <!-- Notes List -->
      <div class="space-y-4">
        <div *ngFor="let note of filteredNotes$ | async" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="text-xl font-semibold text-gray-800">{{ note.title }}</h3>
              <p class="text-sm text-gray-600">{{ note.subject }} • {{ note.category }}</p>
            </div>
            <span [ngClass]="{
              'bg-green-100 text-green-800': note.difficulty === 'beginner',
              'bg-yellow-100 text-yellow-800': note.difficulty === 'intermediate',
              'bg-red-100 text-red-800': note.difficulty === 'advanced'
            }" class="px-3 py-1 rounded-full text-sm font-semibold">
              {{ note.difficulty }}
            </span>
          </div>
          
          <p class="text-gray-700 my-4 line-clamp-3">{{ note.content }}</p>
          
          <div class="flex flex-wrap gap-2 mb-4">
            <span *ngFor="let tag of note.tags" class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              {{ tag }}
            </span>
          </div>

          <div class="flex gap-2">
            <button 
              (click)="editNote(note)"
              class="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
            >
              Edit
            </button>
            <button 
              (click)="deleteNote(note.id)"
              class="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="(filteredNotes$ | async)?.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">No study notes found. Create one to get started!</p>
      </div>
    </div>
  `
})
export class StudyNotesComponent implements OnInit {
  noteForm: FormGroup;
  showForm = false;
  isSubmitting = false;
  editingId: string | null = null;
  notes$ = this.http.get<any[]>('http://localhost:3000/api/study-notes');
  filteredNotes$ = this.notes$;
  searchTerm = '';
  selectedDifficulty = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.noteForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      subject: ['', [Validators.required]],
      category: [''],
      difficulty: ['', [Validators.required]],
      priority: [''],
      tags: ['']
    });
  }

  ngOnInit(): void {}

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.noteForm.reset();
      this.editingId = null;
    }
  }

  submitForm(): void {
    if (this.noteForm.valid) {
      this.isSubmitting = true;
      const formData = {
        ...this.noteForm.value,
        tags: this.noteForm.value.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
      };

      const request = this.editingId
        ? this.http.put(`http://localhost:3000/api/study-notes/${this.editingId}`, formData)
        : this.http.post('http://localhost:3000/api/study-notes', formData);

      request.subscribe({
        next: () => {
          this.isSubmitting = false;
          this.noteForm.reset();
          this.showForm = false;
          this.editingId = null;
          this.notes$ = this.http.get<any[]>('http://localhost:3000/api/study-notes');
          this.filterNotes();
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error saving note:', err);
        }
      });
    }
  }

  editNote(note: any): void {
    this.editingId = note.id;
    this.noteForm.patchValue({
      ...note,
      tags: note.tags?.join(', ') || ''
    });
    this.showForm = true;
  }

  deleteNote(id: string): void {
    if (confirm('Are you sure you want to delete this note?')) {
      this.http.delete(`http://localhost:3000/api/study-notes/${id}`).subscribe({
        next: () => {
          this.notes$ = this.http.get<any[]>('http://localhost:3000/api/study-notes');
          this.filterNotes();
        },
        error: (err) => console.error('Error deleting note:', err)
      });
    }
  }

  filterNotes(): void {
    this.filteredNotes$ = this.notes$.pipe(
      // This would need RxJS operators in a real implementation
    );
  }
}
