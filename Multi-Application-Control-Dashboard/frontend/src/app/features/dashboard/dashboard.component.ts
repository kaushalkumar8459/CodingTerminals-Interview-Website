import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="flex h-screen bg-slate-50">
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Navbar -->
        <nav class="bg-white shadow px-6 py-4 flex items-center justify-between">
          <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
          <div class="flex items-center gap-4">
            <span class="text-sm text-slate-600">{{ currentUser?.username }}</span>
            <span class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
              {{ currentUser?.role | titlecase }}
            </span>
          </div>
        </nav>

        <!-- Dashboard Content -->
        <div class="flex-1 overflow-auto p-6">
          <!-- Welcome Section -->
          <div class="mb-8">
            <h2 class="text-3xl font-bold text-slate-900">
              Welcome back, {{ currentUser?.firstName }}! 👋
            </h2>
            <p class="text-slate-600 mt-2">Here's an overview of your available modules</p>
          </div>

          <!-- Modules Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Study Notes Card -->
            <div
              *ngIf="canAccessModule('study_notes')"
              class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
              (click)="navigateToModule('study-notes')"
            >
              <div class="text-4xl mb-3">📚</div>
              <h3 class="text-lg font-bold text-slate-900">Study Notes</h3>
              <p class="text-sm text-slate-600 mt-2">Create and manage study materials</p>
              <div class="mt-4 flex items-center justify-between">
                <span class="text-xs text-slate-500">{{ moduleStats?.studyNotes || 0 }} notes</span>
                <span class="text-blue-600 font-semibold">→</span>
              </div>
            </div>

            <!-- YouTube Card -->
            <div
              *ngIf="canAccessModule('youtube')"
              class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
              (click)="navigateToModule('youtube')"
            >
              <div class="text-4xl mb-3">▶️</div>
              <h3 class="text-lg font-bold text-slate-900">YouTube</h3>
              <p class="text-sm text-slate-600 mt-2">Manage video content</p>
              <div class="mt-4 flex items-center justify-between">
                <span class="text-xs text-slate-500">{{ moduleStats?.videos || 0 }} videos</span>
                <span class="text-blue-600 font-semibold">→</span>
              </div>
            </div>

            <!-- LinkedIn Card -->
            <div
              *ngIf="canAccessModule('linkedin')"
              class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
              (click)="navigateToModule('linkedin')"
            >
              <div class="text-4xl mb-3">💼</div>
              <h3 class="text-lg font-bold text-slate-900">LinkedIn</h3>
              <p class="text-sm text-slate-600 mt-2">Schedule posts and track analytics</p>
              <div class="mt-4 flex items-center justify-between">
                <span class="text-xs text-slate-500">{{ moduleStats?.linkedinPosts || 0 }} posts</span>
                <span class="text-blue-600 font-semibold">→</span>
              </div>
            </div>

            <!-- Blog Card -->
            <div
              *ngIf="canAccessModule('blog')"
              class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
              (click)="navigateToModule('blog')"
            >
              <div class="text-4xl mb-3">✍️</div>
              <h3 class="text-lg font-bold text-slate-900">Blog</h3>
              <p class="text-sm text-slate-600 mt-2">Write and publish articles</p>
              <div class="mt-4 flex items-center justify-between">
                <span class="text-xs text-slate-500">{{ moduleStats?.blogPosts || 0 }} articles</span>
                <span class="text-blue-600 font-semibold">→</span>
              </div>
            </div>
          </div>

          <!-- Admin Panel Access -->
          <div *ngIf="isAdmin" class="mt-8">
            <h3 class="text-xl font-bold text-slate-900 mb-4">Admin Functions</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                class="bg-red-50 rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
                (click)="navigateToAdmin('users')"
              >
                <div class="text-4xl mb-3">👥</div>
                <h4 class="font-bold text-slate-900">User Management</h4>
                <p class="text-xs text-slate-600 mt-2">Create, edit, and manage users</p>
              </div>

              <div
                class="bg-red-50 rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
                (click)="navigateToAdmin('roles')"
              >
                <div class="text-4xl mb-3">🔐</div>
                <h4 class="font-bold text-slate-900">Role Management</h4>
                <p class="text-xs text-slate-600 mt-2">Assign roles and permissions</p>
              </div>

              <div
                class="bg-red-50 rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
                (click)="navigateToAdmin('modules')"
              >
                <div class="text-4xl mb-3">⚙️</div>
                <h4 class="font-bold text-slate-900">Module Settings</h4>
                <p class="text-xs text-slate-600 mt-2">Enable/disable modules</p>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="mt-12 bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-bold text-slate-900 mb-4">Quick Statistics</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="p-4 bg-blue-50 rounded">
                <div class="text-2xl font-bold text-blue-600">{{ moduleStats?.totalContent || 0 }}</div>
                <div class="text-sm text-slate-600">Total Content</div>
              </div>
              <div class="p-4 bg-green-50 rounded">
                <div class="text-2xl font-bold text-green-600">{{ moduleStats?.modulesEnabled || 0 }}</div>
                <div class="text-sm text-slate-600">Modules Enabled</div>
              </div>
              <div class="p-4 bg-yellow-50 rounded">
                <div class="text-2xl font-bold text-yellow-600">{{ moduleStats?.drafts || 0 }}</div>
                <div class="text-sm text-slate-600">Drafts</div>
              </div>
              <div class="p-4 bg-purple-50 rounded">
                <div class="text-2xl font-bold text-purple-600">{{ moduleStats?.published || 0 }}</div>
                <div class="text-sm text-slate-600">Published</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  isAdmin = false;
  moduleStats: any = {
    studyNotes: 0,
    videos: 0,
    linkedinPosts: 0,
    blogPosts: 0,
    totalContent: 0,
    modulesEnabled: 0,
  };

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = ['super_admin', 'admin'].includes(this.currentUser?.role);
    this.loadModuleStats();
  }

  loadModuleStats(): void {
    this.apiService.getModuleStats().subscribe({
      next: (data) => {
        this.moduleStats = data;
      },
      error: (err) => {
        console.error('Error loading module stats:', err);
      },
    });
  }

  canAccessModule(moduleName: string): boolean {
    return this.authService.hasModuleAccess(moduleName);
  }

  navigateToModule(moduleName: string): void {
    this.router.navigate([`/${moduleName}`]);
  }

  navigateToAdmin(section: string): void {
    this.router.navigate([`/admin/${section}`]);
  }
}
