import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { YouTubeService } from '../services/youtube.service';
import { StudyNotesService } from '../services/study-notes.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <!-- Welcome Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600 mt-2">Welcome back, {{ currentUser?.firstName }}</p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Users Card -->
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-blue-100 text-sm">Total Users</p>
              <p class="text-4xl font-bold mt-2">{{ dashboardStats.totalUsers }}</p>
            </div>
            <span class="text-4xl">👥</span>
          </div>
          <p class="text-blue-100 text-sm mt-4">Active this month</p>
        </div>

        <!-- YouTube Posts Card -->
        <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-red-100 text-sm">YouTube Posts</p>
              <p class="text-4xl font-bold mt-2">{{ dashboardStats.youtubePosts }}</p>
            </div>
            <span class="text-4xl">📹</span>
          </div>
          <p class="text-red-100 text-sm mt-4">{{ dashboardStats.youtubePublished }} published</p>
        </div>

        <!-- Study Notes Card -->
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-green-100 text-sm">Study Notes</p>
              <p class="text-4xl font-bold mt-2">{{ dashboardStats.studyNotes }}</p>
            </div>
            <span class="text-4xl">📚</span>
          </div>
          <p class="text-green-100 text-sm mt-4">{{ dashboardStats.studyNotesPublic }} public</p>
        </div>

        <!-- Admin Tasks Card -->
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-purple-100 text-sm">Applications</p>
              <p class="text-4xl font-bold mt-2">{{ dashboardStats.totalApplications }}</p>
            </div>
            <span class="text-4xl">📊</span>
          </div>
          <p class="text-purple-100 text-sm mt-4">Ready to manage</p>
        </div>
      </div>

      <!-- Charts and Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Users -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Recent Users</h2>
          <div class="space-y-3">
            <div *ngFor="let user of recentUsers" class="flex items-center justify-between py-3 border-b">
              <div>
                <p class="font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</p>
                <p class="text-sm text-gray-600">{{ user.email }}</p>
              </div>
              <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                {{ user.role }}
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div class="space-y-2">
            <button class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition text-sm font-medium">
              Add User
            </button>
            <button class="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition text-sm font-medium">
              Create YouTube Post
            </button>
            <button class="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition text-sm font-medium">
              Create Study Note
            </button>
            <button class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition text-sm font-medium">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  dashboardStats = {
    totalUsers: 0,
    youtubePosts: 0,
    youtubePublished: 0,
    studyNotes: 0,
    studyNotesPublic: 0,
    totalApplications: 0
  };
  recentUsers: any[] = [];

  constructor(
    private adminService: AdminService,
    private youtubeService: YouTubeService,
    private studyNotesService: StudyNotesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadDashboardStats();
    this.loadRecentUsers();
  }

  loadCurrentUser() {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  loadDashboardStats() {
    // Load admin stats
    this.adminService.getDashboardStats().subscribe(stats => {
      this.dashboardStats.totalUsers = stats.totalUsers;
      this.dashboardStats.totalApplications = stats.totalApplications;
    });

    // Load YouTube stats
    this.youtubeService.getStats().subscribe(stats => {
      this.dashboardStats.youtubePosts = stats.total;
      this.dashboardStats.youtubePublished = stats.published;
    });

    // Load Study Notes stats
    this.studyNotesService.getStats().subscribe(stats => {
      this.dashboardStats.studyNotes = stats.total;
      this.dashboardStats.studyNotesPublic = stats.public_notes;
    });
  }

  loadRecentUsers() {
    this.adminService.getRecentUsers(5).subscribe(users => {
      this.recentUsers = users;
    });
  }
}
