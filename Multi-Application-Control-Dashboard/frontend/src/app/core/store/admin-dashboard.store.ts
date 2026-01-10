import { Injectable, inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { AdminDashboardService, AdminMetrics, RecentUser, ModuleStatus } from '../services/admin-dashboard.service';
import { firstValueFrom } from 'rxjs';

export interface AdminStatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

export interface AdminDashboardState {
  stats: AdminStatCard[];
  recentUsers: RecentUser[];
  recentModules: ModuleStatus[];
  metrics: AdminMetrics | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  lastUpdated: Date | null;
}

const initialState: AdminDashboardState = {
  stats: [],
  recentUsers: [],
  recentModules: [],
  metrics: null,
  loading: false,
  error: null,
  success: null,
  lastUpdated: null
};

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardStore extends signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    isLoading: computed(() => state.loading()),
    hasData: computed(() => state.stats().length > 0),
    totalUsers: computed(() => {
      const userStat = state.stats().find(s => s.title === 'Total Users');
      return userStat ? userStat.value : 0;
    }),
    activeUsers: computed(() => {
      const activeStat = state.stats().find(s => s.title === 'Active Users');
      return activeStat ? activeStat.value : 0;
    }),
    adminCount: computed(() => {
      const adminStat = state.stats().find(s => s.title === 'Admin Count');
      return adminStat ? adminStat.value : 0;
    }),
    modulesCount: computed(() => {
      const modulesStat = state.stats().find(s => s.title === 'Modules');
      return modulesStat ? modulesStat.value : 0;
    }),
    enabledModulesCount: computed(() => state.recentModules().filter(m => m.enabled).length),
    disabledModulesCount: computed(() => state.recentModules().filter(m => !m.enabled).length),
    totalUsersFromModules: computed(() => 
      state.recentModules().reduce((sum, m) => sum + (m.users || 0), 0)
    ),
    recentUsersCount: computed(() => state.recentUsers().length),
    isEmpty: computed(() => state.stats().length === 0 && !state.loading())
  })),
  withMethods((store, adminService = inject(AdminDashboardService)) => ({
    // ===== PUBLIC ACTIONS (called from components) =====

    /**
     * Load admin dashboard data - ASYNC
     */
    async loadAdminDashboardData(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const [metrics, recentUsers, moduleStatuses] = await Promise.all([
          firstValueFrom(adminService.getMetrics()),
          firstValueFrom(adminService.getRecentUsers()),
          firstValueFrom(adminService.getModuleStatuses())
        ]);

        // Transform metrics into stat cards
        const stats: AdminStatCard[] = [
          {
            title: 'Total Users',
            value: metrics.totalUsers,
            icon: '👥',
            color: 'bg-blue-50'
          },
          {
            title: 'Active Users',
            value: metrics.activeUsers,
            icon: '✅',
            color: 'bg-green-50'
          },
          {
            title: 'Admin Count',
            value: metrics.adminCount,
            icon: '⚙️',
            color: 'bg-purple-50'
          },
          {
            title: 'Modules',
            value: metrics.totalModules,
            icon: '🔧',
            color: 'bg-orange-50'
          }
        ];

        patchState(store, {
          stats,
          metrics,
          recentUsers,
          recentModules: moduleStatuses,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load admin dashboard data',
          loading: false
        });
        console.error('AdminDashboardStore: Error loading dashboard', err);
      }
    },

    /**
     * Refresh admin dashboard data - ASYNC
     */
    async refreshAdminDashboard(): Promise<void> {
      patchState(store, { error: null });
      try {
        const [metrics, recentUsers, moduleStatuses] = await Promise.all([
          firstValueFrom(adminService.getMetrics()),
          firstValueFrom(adminService.getRecentUsers()),
          firstValueFrom(adminService.getModuleStatuses())
        ]);

        const stats: AdminStatCard[] = [
          {
            title: 'Total Users',
            value: metrics.totalUsers,
            icon: '👥',
            color: 'bg-blue-50'
          },
          {
            title: 'Active Users',
            value: metrics.activeUsers,
            icon: '✅',
            color: 'bg-green-50'
          },
          {
            title: 'Admin Count',
            value: metrics.adminCount,
            icon: '⚙️',
            color: 'bg-purple-50'
          },
          {
            title: 'Modules',
            value: metrics.totalModules,
            icon: '🔧',
            color: 'bg-orange-50'
          }
        ];

        patchState(store, {
          stats,
          metrics,
          recentUsers,
          recentModules: moduleStatuses,
          success: 'Admin dashboard refreshed successfully!',
          lastUpdated: new Date()
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to refresh admin dashboard'
        });
        console.error('AdminDashboardStore: Error refreshing dashboard', err);
      }
    },

    /**
     * Load recent users - ASYNC
     */
    async loadRecentUsers(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const recentUsers = await firstValueFrom(adminService.getRecentUsers());
        patchState(store, {
          recentUsers,
          loading: false,
          error: null
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load recent users',
          loading: false
        });
        console.error('AdminDashboardStore: Error loading recent users', err);
      }
    },

    /**
     * Load module statuses - ASYNC
     */
    async loadModuleStatuses(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const recentModules = await firstValueFrom(adminService.getModuleStatuses());
        patchState(store, {
          recentModules,
          loading: false,
          error: null
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load module statuses',
          loading: false
        });
        console.error('AdminDashboardStore: Error loading modules', err);
      }
    },

    /**
     * Load admin metrics - ASYNC
     */
    async loadMetrics(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const metrics = await firstValueFrom(adminService.getMetrics());

        const stats: AdminStatCard[] = [
          {
            title: 'Total Users',
            value: metrics.totalUsers,
            icon: '👥',
            color: 'bg-blue-50'
          },
          {
            title: 'Active Users',
            value: metrics.activeUsers,
            icon: '✅',
            color: 'bg-green-50'
          },
          {
            title: 'Admin Count',
            value: metrics.adminCount,
            icon: '⚙️',
            color: 'bg-purple-50'
          },
          {
            title: 'Modules',
            value: metrics.totalModules,
            icon: '🔧',
            color: 'bg-orange-50'
          }
        ];

        patchState(store, {
          stats,
          metrics,
          loading: false,
          error: null
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load metrics',
          loading: false
        });
        console.error('AdminDashboardStore: Error loading metrics', err);
      }
    },

    /**
     * Clear admin dashboard data
     */
    clearDashboard(): void {
      patchState(store, {
        stats: [],
        recentUsers: [],
        recentModules: [],
        metrics: null,
        error: null,
        lastUpdated: null
      });
    },

    /**
     * Set error message
     */
    setError(error: string): void {
      patchState(store, { error });
    },

    /**
     * Clear error message
     */
    clearError(): void {
      patchState(store, { error: null });
    }
  }))
) {}
