import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-study-notes-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './study-notes-list.component.html',  // ✅ SEPARATE FILE
  styleUrls: ['./study-notes-list.component.scss']   // ✅ SEPARATE FILE
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
