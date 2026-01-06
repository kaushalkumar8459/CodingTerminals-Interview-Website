import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ModuleSettingsService } from '../../features/admin/services/module-settings.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="w-64 bg-gray-900 text-white h-screen overflow-y-auto">
      <!-- User Info -->
      <div class="p-4 border-b border-gray-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            {{ userInitial }}
          </div>
          <div>
            <p class="text-sm font-semibold">{{ userName }}</p>
            <p class="text-xs text-gray-400">{{ userRole }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="p-4">
        <!-- Dashboard -->
        <a routerLink="/dashboard" routerLinkActive="bg-blue-600" class="block px-3 py-2 rounded-lg hover:bg-gray-800 transition mb-2">
          <span class="text-lg">📊</span> Dashboard
        </a>

        <!-- Modules Section -->
        <div class="mt-6">
          <p class="text-xs font-semibold text-gray-400 px-3 mb-3 uppercase">Modules</p>
          
          <!-- LinkedIn -->
          <a *ngIf="hasModuleAccess('linkedin')" routerLink="/linkedin" routerLinkActive="bg-blue-600" 
             class="block px-3 py-2 rounded-lg hover:bg-gray-800 transition mb-2 text-sm">
            <span class="text-lg">💼</span> LinkedIn Posts
          </a>

          <!-- Blog -->
          <a *ngIf="hasModuleAccess('blog')" routerLink="/blog" routerLinkActive="bg-blue-600" 
             class="block px-3 py-2 rounded-lg hover:bg-gray-800 transition mb-2 text-sm">
            <span class="text-lg">📝</span> Blog
          </a>

          <!-- YouTube -->
          <a *ngIf="hasModuleAccess('youtube')" routerLink="/youtube" routerLinkActive="bg-blue-600" 
             class="block px-3 py-2 rounded-lg hover:bg-gray-800 transition mb-2 text-sm">
            <span class="text-lg">🎥</span> YouTube
          </a>

          <!-- Study Notes -->
          <a *ngIf="hasModuleAccess('study-notes')" routerLink="/study-notes" routerLinkActive="bg-blue-600" 
             class="block px-3 py-2 rounded-lg hover:bg-gray-800 transition mb-2 text-sm">
            <span class="text-lg">📚</span> Study Notes
          </a>
        </div>

        <!-- Admin Section -->
        <div *ngIf="isSuperAdmin() || isAdmin()" class="mt-6">
          <p class="text-xs font-semibold text-gray-400 px-3 mb-3 uppercase">Admin</p>
          
          <a routerLink="/admin/users" routerLinkActive="bg-blue-600" 
             class="block px-3 py-2 rounded-lg hover:bg-gray-800 transition mb-2 text-sm">
            <span class="text-lg">👥</span> Users
          </a>

          <a *ngIf="isSuperAdmin()" routerLink="/admin/modules" routerLinkActive="bg-blue-600" 
             class="block px-3 py-2 rounded-lg hover:bg-gray-800 transition mb-2 text-sm">
            <span class="text-lg">⚙️</span> Modules
          </a>
        </div>
      </nav>
    </div>
  `,
  styles: []
})
export class SidebarComponent implements OnInit {
  userRole = 'Admin';
  userName = 'John Doe';
  userInitial = 'JD';
  assignedModules: string[] = [];

  constructor(
    private authService: AuthService,
    private moduleService: ModuleSettingsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userName = `${user.firstName} ${user.lastName}`;
        this.userInitial = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        this.userRole = user.role;
        this.assignedModules = user.assignedModules || [];
      }
    });
  }

  hasModuleAccess(moduleName: string): boolean {
    if (this.isSuperAdmin()) return true;
    return this.assignedModules.includes(moduleName);
  }

  isSuperAdmin(): boolean {
    return this.userRole === 'SUPER_ADMIN';
  }

  isAdmin(): boolean {
    return this.userRole === 'ADMIN' || this.userRole === 'SUPER_ADMIN';
  }
}