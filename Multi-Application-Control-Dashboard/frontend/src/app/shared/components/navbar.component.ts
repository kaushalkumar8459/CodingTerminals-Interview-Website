import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="bg-white shadow-lg border-b border-gray-200">
      <div class="px-6 py-4 flex justify-between items-center">
        <!-- Logo -->
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">📊</span>
          </div>
          <h1 class="text-xl font-bold text-gray-900">Control Dashboard</h1>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-6">
          <!-- Role Badge -->
          <div class="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
            <span class="text-xs font-semibold text-blue-700">{{ userRole | uppercase }}</span>
          </div>

          <!-- User Menu -->
          <div class="relative group">
            <button class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {{ userInitial }}
              </div>
              <span class="text-sm font-medium text-gray-700">{{ userName }}</span>
            </button>

            <!-- Dropdown Menu -->
            <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block z-50">
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
              <hr class="my-2" />
              <button (click)="logout()" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class NavbarComponent implements OnInit {
  userRole = 'Admin';
  userName = 'John Doe';
  userInitial = 'JD';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Get user info from auth service
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userName = `${user.firstName} ${user.lastName}`;
        this.userInitial = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        this.userRole = user.role;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}