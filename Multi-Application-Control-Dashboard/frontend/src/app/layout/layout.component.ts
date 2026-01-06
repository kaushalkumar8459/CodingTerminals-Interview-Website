import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Sidebar -->
      <div class="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white shadow-lg">
        <!-- Logo -->
        <div class="p-6 border-b border-gray-800">
          <h1 class="text-2xl font-bold">CodingTerminals</h1>
          <p class="text-gray-400 text-sm">Dashboard</p>
        </div>

        <!-- Navigation Menu -->
        <nav class="p-4 space-y-2">
          <a routerLink="/dashboard" routerLinkActive="bg-gray-800" class="block px-4 py-2 rounded-lg hover:bg-gray-800 transition">
            📊 Dashboard
          </a>
          <a routerLink="/admin/users" routerLinkActive="bg-gray-800" class="block px-4 py-2 rounded-lg hover:bg-gray-800 transition">
            👥 Users
          </a>
          <a routerLink="/youtube" routerLinkActive="bg-gray-800" class="block px-4 py-2 rounded-lg hover:bg-gray-800 transition">
            📹 YouTube Posts
          </a>
          <a routerLink="/study-notes" routerLinkActive="bg-gray-800" class="block px-4 py-2 rounded-lg hover:bg-gray-800 transition">
            📚 Study Notes
          </a>
          <a routerLink="/admin/applications" routerLinkActive="bg-gray-800" class="block px-4 py-2 rounded-lg hover:bg-gray-800 transition">
            📋 Applications
          </a>
          <a routerLink="/admin/reports" routerLinkActive="bg-gray-800" class="block px-4 py-2 rounded-lg hover:bg-gray-800 transition">
            📈 Reports
          </a>
        </nav>

        <!-- Settings & Logout -->
        <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 space-y-2">
          <a routerLink="/profile" routerLinkActive="bg-gray-800" class="block px-4 py-2 rounded-lg hover:bg-gray-800 transition">
            ⚙️ Profile
          </a>
          <button (click)="logout()" class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-left">
            🚪 Logout
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="ml-64">
        <!-- Top Navigation Bar -->
        <div class="bg-white shadow-sm border-b border-gray-200">
          <div class="px-8 py-4 flex justify-between items-center">
            <div class="text-gray-600">
              <p class="text-sm">{{ currentTime | date: 'full' }}</p>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-gray-700">Welcome, {{ currentUser?.firstName }}</span>
              <img [src]="currentUser?.profilePicture || 'assets/default-avatar.png'" 
                   class="w-10 h-10 rounded-full cursor-pointer" 
                   alt="Profile">
            </div>
          </div>
        </div>

        <!-- Page Content -->
        <div class="p-8">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LayoutComponent implements OnInit {
  currentUser: any;
  currentTime: Date = new Date();

  constructor(private authService: AuthService, private router: Router) {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnInit() {
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
