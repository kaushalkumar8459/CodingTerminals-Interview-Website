import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { UserManagementService, User } from '../../../core/services/user-management.service';
import { ModuleSettingsService, Module } from '../../../core/services/module-settings.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalModules: number;
  enabledModules: number;
  adminCount: number;
  moderatorCount: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  private userService = inject(UserManagementService);
  private moduleService = inject(ModuleSettingsService);

  stats$: Observable<AdminStats> | null = null;
  recentUsers$: Observable<User[]> | null = null;
  recentModules$: Observable<Module[]> | null = null;
  loading = false;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Combine data from multiple services
    this.stats$ = combineLatest([
      this.userService.getAllUsers(),
      this.moduleService.getAllModules(),
    ]).pipe(
      map(([users, modules]) => {
        const stats: AdminStats = {
          totalUsers: users.length,
          activeUsers: users.filter(u => u.status === 'active').length,
          suspendedUsers: users.filter(u => u.status === 'suspended').length,
          totalModules: modules.length,
          enabledModules: modules.filter(m => m.enabled).length,
          adminCount: users.filter(u => u.role === 'admin').length,
          moderatorCount: users.filter(u => u.role === 'moderator').length,
        };
        this.loading = false;
        return stats;
      })
    );

    // Get recent users (last 5)
    this.recentUsers$ = this.userService.getAllUsers().pipe(
      map(users => users.slice(-5).reverse())
    );

    // Get recent modules (last 5)
    this.recentModules$ = this.moduleService.getAllModules().pipe(
      map(modules => modules.slice(-5).reverse())
    );
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'inactive':
        return 'badge-secondary';
      case 'suspended':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'badge-danger';
      case 'moderator':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  }

  getModuleStatusClass(enabled: boolean): string {
    return enabled ? 'badge-success' : 'badge-secondary';
  }
}
