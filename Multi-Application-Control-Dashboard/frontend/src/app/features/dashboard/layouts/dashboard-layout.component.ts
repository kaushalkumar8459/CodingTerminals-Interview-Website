import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <app-sidebar />

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <app-header />

        <!-- Page Content -->
        <main class="flex-1 overflow-auto">
          <div class="p-6">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
})
export class DashboardLayoutComponent implements OnInit {
  currentUser$ = this.authService.currentUser$;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    console.log('Dashboard initialized');
  }
}
