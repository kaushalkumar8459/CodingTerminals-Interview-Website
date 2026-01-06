import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-youtube-list',
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
          <h1 class="text-2xl font-bold text-slate-900">▶️ YouTube Content</h1>
          <button
            (click)="openCreateModal()"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            + New Video
          </button>
        </nav>

        <!-- Content Area -->
        <div class="flex-1 overflow-auto p-6">
          <!-- Loading State -->
          <div *ngIf="isLoading" class="text-center py-12">
            <div class="inline-block animate-spin">⏳</div>
            <p class="text-slate-600 mt-2">Loading videos...</p>
          </div>

          <!-- Videos Table -->
          <div *ngIf="!isLoading && videos.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
            <table class="w-full">
              <thead class="bg-slate-100">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">Title</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">Category</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">Views</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr *ngFor="let video of videos" class="hover:bg-slate-50">
                  <td class="px-6 py-3 text-sm text-slate-900">{{ video.title }}</td>
                  <td class="px-6 py-3 text-sm text-slate-600">{{ video.category }}</td>
                  <td class="px-6 py-3 text-sm text-slate-600">{{ video.views }}</td>
                  <td class="px-6 py-3 text-sm">
                    <button
                      (click)="openEditModal(video)"
                      class="text-blue-600 hover:underline mr-4"
                    >
                      Edit
                    </button>
                    <button
                      (click)="deleteVideo(video._id)"
                      class="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoading && videos.length === 0" class="text-center py-12">
            <div class="text-5xl mb-4">🎬</div>
            <p class="text-slate-600 text-lg">No videos yet</p>
            <button
              (click)="openCreateModal()"
              class="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Create your first video
            </button>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6 max-h-96 overflow-y-auto">
          <h2 class="text-2xl font-bold text-slate-900 mb-4">
            {{ editingVideo ? 'Edit Video' : 'Create New Video' }}
          </h2>

          <form [formGroup]="videoForm" (ngSubmit)="saveVideo()" class="space-y-4">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Title</label>
              <input
                type="text"
                formControlName="title"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <!-- Video URL -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Video URL</label>
              <input
                type="url"
                formControlName="videoUrl"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <input
                type="text"
                formControlName="category"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                formControlName="description"
                rows="4"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
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
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:bg-gray-400"
              >
                {{ isSaving ? 'Saving...' : 'Save Video' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class YouTubeListComponent implements OnInit {
  videos: any[] = [];
  isLoading = false;
  isSaving = false;
  showModal = false;
  editingVideo: any = null;
  videoForm!: FormGroup;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadVideos();
  }

  initializeForm(): void {
    this.videoForm = this.fb.group({
      title: ['', Validators.required],
      videoUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      category: [''],
      description: [''],
    });
  }

  loadVideos(): void {
    this.isLoading = true;
    this.apiService.getAllVideos().subscribe({
      next: (response) => {
        this.videos = response.videos || response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading videos:', err);
        this.isLoading = false;
      },
    });
  }

  openCreateModal(): void {
    this.editingVideo = null;
    this.videoForm.reset();
    this.showModal = true;
  }

  openEditModal(video: any): void {
    this.editingVideo = video;
    this.videoForm.patchValue(video);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingVideo = null;
    this.videoForm.reset();
  }

  saveVideo(): void {
    if (this.videoForm.invalid) return;

    this.isSaving = true;
    const data = this.videoForm.value;

    if (this.editingVideo) {
      this.apiService.updateVideo(this.editingVideo._id, data).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadVideos();
        },
        error: (err) => {
          console.error('Error updating video:', err);
          this.isSaving = false;
        },
      });
    } else {
      this.apiService.createVideo(data).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadVideos();
        },
        error: (err) => {
          console.error('Error creating video:', err);
          this.isSaving = false;
        },
      });
    }
  }

  deleteVideo(videoId: string): void {
    if (confirm('Are you sure you want to delete this video?')) {
      this.apiService.deleteVideo(videoId).subscribe({
        next: () => {
          this.loadVideos();
        },
        error: (err) => {
          console.error('Error deleting video:', err);
        },
      });
    }
  }
}
