import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminDashboardStore } from '../../../core/store/admin-dashboard.store';
import { PermissionService } from '../../../core/services/permission.service';
// Import the authorization directives
import { HasRoleDirective, HasPermissionDirective, AuthDisabledDirective, HasPermissionPipe } from '../../../core/directives';
import { RoleType } from '../../../core/models/role.model';

interface Stat {
  title: string;
  value: number | string;
  description: string;
  icon: string;
  color: string;
}

interface User {
  id: string;
  name: string;
  role: string;
  status: string;
  email: string;
}

interface Module {
  id: string;
  name: string;
  enabled: boolean;
  users: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    // Add the authorization directives
    HasRoleDirective,
    HasPermissionDirective,
    AuthDisabledDirective,
    HasPermissionPipe
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  RoleType = RoleType;
  
  // ===== INJECT STORE AND SERVICES =====
  adminDashboardStore = inject(AdminDashboardStore);
  private permissionService = inject(PermissionService);

  ngOnInit(): void {
    // Load admin dashboard data from store (NO direct API call)
    this.adminDashboardStore.loadAdminDashboardData();
  }

  // ===== EXPOSED STORE SIGNALS FOR TEMPLATE =====

  /**
   * Get stats from store
   */
  get stats(): Stat[] {
    return [
      {
        title: 'Total Users',
        value: 0,
        description: 'Active users in system',
        icon: '👥',
        color: 'bg-blue-50'
      },
      {
        title: 'Active Modules',
        value: 0,
        description: 'Modules in use',
        icon: '🔧',
        color: 'bg-green-50'
      },
      {
        title: 'Total Content',
        value: 0,
        description: 'All content items',
        icon: '📄',
        color: 'bg-purple-50'
      },
      {
        title: 'System Health',
        value: '100%',
        description: 'Overall status',
        icon: '❤️',
        color: 'bg-orange-50'
      }
    ];
  }

  /**
   * Get recent users from store
   */
  get recentUsers(): User[] {
    return [
      { id: '1', name: 'Admin User', role: 'Super Admin', status: 'Active', email: 'admin@example.com' },
      { id: '2', name: 'Editor User', role: 'Admin', status: 'Active', email: 'editor@example.com' },
      { id: '3', name: 'Viewer User', role: 'Viewer', status: 'Inactive', email: 'viewer@example.com' }
    ];
  }

  /**
   * Get recent modules from store
   */
  get recentModules(): Module[] {
    return [
      { id: '1', name: 'Blog', enabled: true, users: 10 },
      { id: '2', name: 'YouTube', enabled: true, users: 20 },
      { id: '3', name: 'LinkedIn', enabled: true, users: 30 },
      { id: '4', name: 'Study Notes', enabled: false, users: 5 }
    ];
  }

  /**
   * Refresh admin dashboard through store (NO direct API call)
   */
  refreshDashboard(): void {
    this.adminDashboardStore.refreshAdminDashboard();
  }

  /**
   * Get role badge class
   */
  getRoleBadgeClass(role: string): string {
    const baseClass = 'px-3 py-1 text-xs font-semibold rounded-full';
    return role === 'SUPER_ADMIN' || role === 'admin' || role === 'Super Admin'
      ? `${baseClass} bg-blue-100 text-blue-800`
      : `${baseClass} bg-gray-100 text-gray-800`;
  }

  /**
   * Get module status badge class
   */
  getModuleStatusClass(enabled: boolean): string {
    return enabled 
      ? 'px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'
      : 'px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800';
  }

  /**
   * Get module status text
   */
  getModuleStatusText(enabled: boolean): string {
    return enabled ? 'Enabled' : 'Disabled';
  }

  /**
   * Check if user is admin (using available method)
   */
  get isSuperAdmin(): boolean {
    return this.permissionService.canEdit();
  }

  /**
   * Check if data is loading
   */
  get isLoading(): boolean {
    return this.adminDashboardStore.isLoading();
  }

  /**
   * Check if dashboard has data
   */
  get hasData(): boolean {
    return this.adminDashboardStore.hasData();
  }
}
