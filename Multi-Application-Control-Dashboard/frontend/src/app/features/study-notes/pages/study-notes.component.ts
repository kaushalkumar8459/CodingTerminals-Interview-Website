import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-study-notes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './study-notes.component.html',
  styleUrl: './study-notes.component.scss',
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
