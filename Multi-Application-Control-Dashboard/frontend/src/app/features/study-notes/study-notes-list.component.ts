import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { StudyNotesService } from '../services/study-notes.service';

@Component({
  selector: 'app-study-notes-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Study Notes</h1>
        <button (click)="openCreateModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
          + New Note
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-gray-600 text-sm">Total Notes</p>
          <p class="text-3xl font-bold text-blue-600">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-gray-600 text-sm">Public Notes</p>
          <p class="text-3xl font-bold text-green-600">{{ stats.public_notes }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-gray-600 text-sm">Private Notes</p>
          <p class="text-3xl font-bold text-purple-600">{{ stats.private_notes }}</p>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-6">
        <input
          type="text"
          placeholder="Search notes..."
          (keyup)="onSearch($event)"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <!-- Notes Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-100 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Privacy</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Author</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let note of notes" class="border-b hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-900 font-medium">{{ note.title }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ note.subject }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ note.category }}</td>
              <td class="px-6 py-4 text-sm">
                <span [class]="note.isPublic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-3 py-1 rounded-full text-xs font-semibold">
                  {{ note.isPublic ? 'Public' : 'Private' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ note.author.firstName }} {{ note.author.lastName }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ note.createdAt | date: 'short' }}</td>
              <td class="px-6 py-4 text-sm space-x-2">
                <button (click)="viewNote(note)" class="text-blue-600 hover:text-blue-700">View</button>
                <button (click)="editNote(note)" class="text-blue-600 hover:text-blue-700">Edit</button>
                <button (click)="deleteNote(note._id)" class="text-red-600 hover:text-red-700">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class StudyNotesListComponent implements OnInit {
  notes: any[] = [];
  stats = { total: 0, public_notes: 0, private_notes: 0 };
  searchQuery = '';

  constructor(private studyNotesService: StudyNotesService) {}

  ngOnInit() {
    this.loadNotes();
    this.loadStats();
  }

  loadNotes() {
    this.studyNotesService.findAll().subscribe(data => {
      this.notes = data;
    });
  }

  loadStats() {
    this.studyNotesService.getStats().subscribe(data => {
      this.stats = data;
    });
  }

  onSearch(event: any) {
    this.searchQuery = event.target.value;
    if (this.searchQuery.trim().length > 0) {
      this.studyNotesService.search(this.searchQuery).subscribe(data => {
        this.notes = data;
      });
    } else {
      this.loadNotes();
    }
  }

  openCreateModal() {
    // Implementation for create modal
  }

  viewNote(note: any) {
    // Implementation for view
  }

  editNote(note: any) {
    // Implementation for edit
  }

  deleteNote(id: string) {
    if (confirm('Are you sure you want to delete this note?')) {
      this.studyNotesService.delete(id).subscribe(() => {
        this.loadNotes();
        this.loadStats();
      });
    }
  }
}