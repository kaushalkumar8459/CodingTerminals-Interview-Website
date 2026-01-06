import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <aside class="w-64 bg-gray-900 text-white shadow-lg">
        <div class="p-6 border-b border-gray-700">
          <h1 class="text-2xl font-bold text-blue-400">Dashboard</h1>
        </div>
        <nav class="mt-6">
          <ul class="space-y-2 px-3">
            <li>
              <a routerLink="/dashboard/home" class="block px-4 py-2 rounded hover:bg-gray-800 transition">
                <span class="inline-block mr-3">🏠</span>Home
              </a>
            </li>
            <li>
              <a routerLink="/dashboard/users" class="block px-4 py-2 rounded hover:bg-gray-800 transition">
                <span class="inline-block mr-3">👥</span>Users
              </a>
            </li>
            <li>
              <a routerLink="/dashboard/blog" class="block px-4 py-2 rounded hover:bg-gray-800 transition">
                <span class="inline-block mr-3">📝</span>Blog
              </a>
            </li>
            <li>
              <a routerLink="/dashboard/linkedin" class="block px-4 py-2 rounded hover:bg-gray-800 transition">
                <span class="inline-block mr-3">💼</span>LinkedIn
              </a>
            </li>
            <li>
              <a routerLink="/dashboard/youtube" class="block px-4 py-2 rounded hover:bg-gray-800 transition">
                <span class="inline-block mr-3">📺</span>YouTube
              </a>
            </li>
            <li>
              <a routerLink="/dashboard/study-notes" class="block px-4 py-2 rounded hover:bg-gray-800 transition">
                <span class="inline-block mr-3">📚</span>Study Notes
              </a>
            </li>
            <li>
              <a routerLink="/dashboard/roles" class="block px-4 py-2 rounded hover:bg-gray-800 transition">
                <span class="inline-block mr-3">🔐</span>Roles
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col">
        <!-- Header -->
        <header class="bg-white shadow-md px-6 py-4 flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-800">Multi-Application Dashboard</h2>
          <div class="flex items-center space-x-4">
            <span class="text-gray-700" *ngIf="currentUser$ | async as user">
              {{ user.firstName }} {{ user.lastName }}
            </span>
            <button 
              (click)="logout()"
              class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </header>

        <!-- Content Area -->
        <main class="flex-1 overflow-auto p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class LayoutComponent implements OnInit {
  currentUser$ = this.authService.currentUser$;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {}

  logout(): void {
    this.authService.logout();
  }
}
