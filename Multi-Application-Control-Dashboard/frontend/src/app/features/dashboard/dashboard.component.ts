import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
// import { DashboardStore } from '../../../core/store/dashboard.store';
// import { AuthStore } from '../../../core/store/auth.store';
// import { PermissionService } from '../../../core/services/permission.service';

interface User {
  firstName?: string;
  lastName?: string;
}

interface Stat {
  title: string;
  value: number | string;
  description: string;
  icon: string;
  color: string;
}

interface Activity {
  type: 'user' | 'content' | 'module';
  action: string;
  user: string;
  timestamp: Date | string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // ===== INJECT STORE AND SERVICES =====
  // readonly dashboardStore = inject(DashboardStore);
  // readonly authStore = inject(AuthStore);
  // private permissionService = inject(PermissionService);

  ngOnInit(): void {
    // Load dashboard data from store on component init (NO direct API call)
    // this.dashboardStore.loadDashboardData();
  }

  // ===== EXPOSED STORE SIGNALS FOR TEMPLATE =====

  /**
   * Get current user from auth store
   */
  get currentUser(): User | null {
    // return this.authStore.currentUser();
    return { firstName: 'User' };
  }

  /**
   * Get stats from store
   */
  /**
   * Get stats from store
   */
  readonly stats: Stat[] = [
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
      title: 'Content Items',
      value: 0,
      description: 'Total content pieces',
      icon: '📄',
      color: 'bg-purple-50'
    },
    {
      title: 'Recent Activity',
      value: 0,
      description: 'Last 24 hours',
      icon: '📊',
      color: 'bg-orange-50'
    }
  ];

  /**
   * Get recent activities from store
   */
  get recentActivities(): Activity[] {
    // return this.dashboardStore.recentActivities();
    return [];
  }

  /**
   * Get loading state from store
   */
  get loading() {
    // return this.dashboardStore.isLoading();
    return false;
  }

  /**
   * Get error state from store
   */
  get error() {
    // return this.dashboardStore.error();
    return null;
  }

  /**
   * Get success state from store
   */
  get success() {
    // return this.dashboardStore.success();
    return null;
  }

  /**
   * Get metrics from store
   */
  get metrics() {
    // return this.dashboardStore.metrics();
    return null;
  }

  /**
   * Get total users count from store
   */
  get totalUsers() {
    // return this.dashboardStore.totalUsers();
    return 0;
  }

  /**
   * Get active users count from store
   */
  get activeUsers() {
    // return this.dashboardStore.activeUsers();
    return 0;
  }

  /**
   * Get active modules count from store
   */
  get activeModules() {
    // return this.dashboardStore.activeModules();
    return 0;
  }

  /**
   * Get total content items from store
   */
  get totalContentItems() {
    // return this.dashboardStore.totalContentItems();
    return 0;
  }

  /**
   * Get recent activity count from store
   */
  get recentActivityCount() {
    // return this.dashboardStore.recentActivityCount();
    return 0;
  }

  /**
   * Get user activity count from store
   */
  get userActivityCount() {
    // return this.dashboardStore.userActivityCount();
    return 0;
  }

  /**
   * Get content activity count from store
   */
  get contentActivityCount() {
    // return this.dashboardStore.contentActivityCount();
    return 0;
  }

  /**
   * Get module activity count from store
   */
  get moduleActivityCount() {
    // return this.dashboardStore.moduleActivityCount();
    return 0;
  }

  /**
   * Get last updated time from store
   */
  get lastUpdated() {
    // return this.dashboardStore.lastUpdatedTime();
    return null;
  }

  /**
   * Get is data fresh flag from store
   */
  get isDataFresh() {
    // return this.dashboardStore.isDataFresh();
    return true;
  }

  /**
   * Check if dashboard has data from store
   */
  get hasData() {
    // return this.dashboardStore.hasData();
    return false;
  }

  /**
   * Check if has activities from store
   */
  get hasActivities() {
    // return this.dashboardStore.hasActivities();
    return false;
  }

  /**
   * Check if is empty from store
   */
  get isEmpty() {
    // return this.dashboardStore.isEmpty();
    return true;
  }

  /**
   * Check if has error from store
   */
  get hasError() {
    // return this.dashboardStore.hasError();
    return false;
  }

  /**
   * Check if has success from store
   */
  get hasSuccess() {
    // return this.dashboardStore.hasSuccess();
    return false;
  }

  // ===== STORE ACTIONS =====

  /**
   * Refresh dashboard data through store (NO direct API call)
   */
  async refreshDashboard(): Promise<void> {
    // await this.dashboardStore.refreshDashboardData();
  }

  /**
   * Load metrics only through store (NO direct API call)
   */
  async loadMetrics(): Promise<void> {
    // await this.dashboardStore.loadMetrics();
  }

  /**
   * Load activities only through store (NO direct API call)
   */
  async loadActivities(): Promise<void> {
    // await this.dashboardStore.loadRecentActivities();
  }

  /**
   * Load activities by type through store (NO direct API call)
   */
  async loadActivitiesByType(type: 'user' | 'content' | 'module'): Promise<void> {
    // await this.dashboardStore.loadActivitiesByType(type, 10);
  }

  // ===== UI HELPER METHODS =====

  /**
   * Get greeting message based on time of day
   */
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  getRelativeTime(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  /**
   * Get activity type icon
   */
  getActivityIcon(type: string): string {
    switch (type) {
      case 'user':
        return '👤';
      case 'content':
        return '📄';
      case 'module':
        return '🔧';
      default:
        return '📝';
    }
  }

  /**
   * Get activity type background color
   */
  getActivityColor(type: string): string {
    switch (type) {
      case 'user':
        return 'bg-blue-100';
      case 'content':
        return 'bg-green-100';
      case 'module':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  }

  /**
   * Format last updated timestamp
   */
  formatLastUpdated(): string {
    if (!this.lastUpdated) return 'Never';
    return this.getRelativeTime(this.lastUpdated);
  }

  // ===== PERMISSION CHECKS =====

  /**
   * Check if user has admin permissions
   */
  get isAdmin(): boolean {
    // return this.permissionService.canEdit();
    return true;
  }

  /**
   * Check if user has edit permissions
   */
  get canEdit(): boolean {
    // return this.permissionService.canEdit();
    return true;
  }

  /**
   * Check if user is viewer only
   */
  get isViewer(): boolean {
    // return this.permissionService.isViewer();
    return false;
  }
}
