import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 bg-slate-900 text-white flex flex-col h-screen shadow-xl">
      <!-- Logo -->
      <div class="p-6 border-b border-slate-700">
        <h2 class="text-2xl font-bold">🎯 Control Hub</h2>
        <p class="text-xs text-slate-400 mt-1">{{ currentUser?.role | titlecase }}</p>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 overflow-y-auto">
        <!-- Main Modules -->
        <div class="mb-8">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">Modules</p>

          <!-- Dashboard -->
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-blue-600"
            class="block px-4 py-2 rounded hover:bg-slate-700 transition mb-2"
          >
            📊 Dashboard
          </a>

          <!-- Study Notes -->
          <a
            *ngIf="canAccess('study_notes')"
            routerLink="/study-notes"
            routerLinkActive="bg-blue-600"
            class="block px-4 py-2 rounded hover:bg-slate-700 transition mb-2"
          >
            📚 Study Notes
          </a>

          <!-- YouTube -->
          <a
            *ngIf="canAccess('youtube')"
            routerLink="/youtube"
            routerLinkActive="bg-blue-600"
            class="block px-4 py-2 rounded hover:bg-slate-700 transition mb-2"
          >
            ▶️ YouTube
          </a>

          <!-- LinkedIn -->
          <a
            *ngIf="canAccess('linkedin')"
            routerLink="/linkedin"
            routerLinkActive="bg-blue-600"
            class="block px-4 py-2 rounded hover:bg-slate-700 transition mb-2"
          >
            💼 LinkedIn
          </a>

          <!-- Blog -->
          <a
            *ngIf="canAccess('blog')"
            routerLink="/blog"
            routerLinkActive="bg-blue-600"
            class="block px-4 py-2 rounded hover:bg-slate-700 transition mb-2"
          >
            ✍️ Blog
          </a>
        </div>

        <!-- Admin Section -->
        <div *ngIf="isAdmin" class="mb-8">
          <p class="text-xs font-bold text-red-400 uppercase tracking-widest mb-4 px-4">Admin Panel</p>

          <a
            routerLink="/admin/users"
            routerLinkActive="bg-red-600"
            class="block px-4 py-2 rounded hover:bg-slate-700 transition mb-2"
          >
            👥 User Management
          </a>

          <a
            routerLink="/admin/roles"
            routerLinkActive="bg-red-600"
            class="block px-4 py-2 rounded hover:bg-slate-700 transition mb-2"
          >
            🔐 Role Management
          </a>

          <a
            routerLink="/admin/modules"
            routerLinkActive="bg-red-600"
            class="block px-4 py-2 rounded hover:bg-slate-700 transition mb-2"
          >
            ⚙️ Module Settings
          </a>
        </div>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-slate-700 space-y-2">
        <button
          (click)="openProfile()"
          class="w-full text-left px-4 py-2 rounded hover:bg-slate-700 transition text-sm"
        >
          ⚙️ Settings
        </button>
        <button
          (click)="onLogout()"
          class="w-full text-left px-4 py-2 rounded hover:bg-red-600 transition text-sm"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  `,
  styles: [],
})
export class SidebarComponent {
  currentUser: any;
  isAdmin = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = ['super_admin', 'admin'].includes(this.currentUser?.role);
  }

  canAccess(moduleName: string): boolean {
    return this.authService.hasModuleAccess(moduleName);
  }

  openProfile(): void {
    this.router.navigate(['/settings']);
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }
  }
}
