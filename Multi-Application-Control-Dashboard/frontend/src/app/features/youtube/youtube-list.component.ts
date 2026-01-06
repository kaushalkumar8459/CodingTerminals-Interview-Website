import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { YouTubeService } from '../services/youtube.service';

@Component({
  selector: 'app-youtube-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">YouTube Posts</h1>
        <button (click)="openCreateModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
          + New Post
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-gray-600 text-sm">Total Posts</p>
          <p class="text-3xl font-bold text-blue-600">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-gray-600 text-sm">Published</p>
          <p class="text-3xl font-bold text-green-600">{{ stats.published }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-gray-600 text-sm">Drafts</p>
          <p class="text-3xl font-bold text-yellow-600">{{ stats.draft }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-gray-600 text-sm">Total Views</p>
          <p class="text-3xl font-bold text-purple-600">{{ stats.totalViews }}</p>
        </div>
      </div>

      <!-- Posts Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-100 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Views</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Author</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let post of posts" class="border-b hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-900">{{ post.title }}</td>
              <td class="px-6 py-4 text-sm">
                <span [class]="getStatusClass(post.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
                  {{ post.status | uppercase }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ post.views }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ post.author.firstName }} {{ post.author.lastName }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ post.createdAt | date: 'short' }}</td>
              <td class="px-6 py-4 text-sm space-x-2">
                <button (click)="editPost(post)" class="text-blue-600 hover:text-blue-700">Edit</button>
                <button (click)="deletePost(post._id)" class="text-red-600 hover:text-red-700">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class YouTubeListComponent implements OnInit {
  posts: any[] = [];
  stats = { total: 0, published: 0, draft: 0, totalViews: 0 };

  constructor(private youtubeService: YouTubeService) {}

  ngOnInit() {
    this.loadPosts();
    this.loadStats();
  }

  loadPosts() {
    this.youtubeService.findAll().subscribe(data => {
      this.posts = data;
    });
  }

  loadStats() {
    this.youtubeService.getStats().subscribe(data => {
      this.stats = data;
    });
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  openCreateModal() {
    // Implementation for create modal
  }

  editPost(post: any) {
    // Implementation for edit
  }

  deletePost(id: string) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.youtubeService.delete(id).subscribe(() => {
        this.loadPosts();
        this.loadStats();
      });
    }
  }
}