import { Injectable, inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { DashboardService, DashboardMetrics, RecentActivity } from '../services/dashboard.service';
import { firstValueFrom } from 'rxjs';

export interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  description: string;
}

export interface DashboardState {
  stats: StatCard[];
  recentActivities: RecentActivity[];
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  lastUpdated: Date | null;
}

const initialState: DashboardState = {
  stats: [],
  recentActivities: [],
  metrics: null,
  loading: false,
  error: null,
  success: null,
  lastUpdated: null
};

@Injectable({
  providedIn: 'root'
})
export class DashboardStore extends signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    // ===== LOADING & UI STATES =====
    isLoading: computed(() => state.loading()),
    hasError: computed(() => state.error() !== null),
    hasSuccess: computed(() => state.success() !== null),
    
    // ===== DATA PRESENCE CHECKS =====
    hasData: computed(() => state.stats().length > 0 && state.metrics() !== null),
    hasActivities: computed(() => state.recentActivities().length > 0),
    isEmpty: computed(() => state.stats().length === 0 && !state.loading()),
    
    // ===== STAT CALCULATIONS FROM METRICS =====
    totalUsers: computed(() => {
      const userStat = state.stats().find(s => s.title === 'Total Users');
      return userStat ? userStat.value : 0;
    }),
    activeUsers: computed(() => {
      const activeUserStat = state.stats().find(s => s.title === 'Active Users');
      return activeUserStat ? activeUserStat.value : 0;
    }),
    totalContentItems: computed(() => {
      const contentStat = state.stats().find(s => s.title === 'Content Items');
      return contentStat ? contentStat.value : 0;
    }),
    activeModules: computed(() => {
      const moduleStat = state.stats().find(s => s.title === 'Modules');
      return moduleStat ? moduleStat.value : 0;
    }),
    
    // ===== ACTIVITY ANALYTICS =====
    recentActivityCount: computed(() => state.recentActivities().length),
    userActivityCount: computed(() => 
      state.recentActivities().filter(a => a.type === 'user').length
    ),
    contentActivityCount: computed(() => 
      state.recentActivities().filter(a => a.type === 'content').length
    ),
    moduleActivityCount: computed(() => 
      state.recentActivities().filter(a => a.type === 'module').length
    ),
    
    // ===== TIMESTAMP UTILITIES =====
    lastUpdatedTime: computed(() => state.lastUpdated()),
    isDataFresh: computed(() => {
      if (!state.lastUpdated()) return false;
      const now = new Date();
      const diff = now.getTime() - state.lastUpdated()!.getTime();
      return diff < 300000; // Less than 5 minutes
    })
  })),
  withMethods((store, dashboardService = inject(DashboardService)) => ({
    // ===== PUBLIC ACTIONS (called from components) =====
    
    /**
     * Load dashboard data (metrics and recent activity) - ASYNC
     */
    async loadDashboardData(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const [metrics, activities] = await Promise.all([
          firstValueFrom(dashboardService.getMetrics()),
          firstValueFrom(dashboardService.getRecentActivities())
        ]);

        // Transform metrics into stat cards
        const stats: StatCard[] = [
          {
            title: 'Total Users',
            value: metrics.totalUsers,
            icon: '👥',
            color: 'bg-blue-50',
            description: 'Total registered users'
          },
          {
            title: 'Active Users',
            value: metrics.activeUsers,
            icon: '✅',
            color: 'bg-green-50',
            description: `${Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}% active today`
          },
          {
            title: 'Modules',
            value: metrics.totalModules,
            icon: '🔧',
            color: 'bg-purple-50',
            description: 'Study Notes, YouTube, LinkedIn, Blog'
          },
          {
            title: 'Content Items',
            value: metrics.totalContentItems,
            icon: '📚',
            color: 'bg-orange-50',
            description: 'Total content across all modules'
          }
        ];

        patchState(store, {
          stats,
          metrics,
          recentActivities: activities,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load dashboard data',
          loading: false
        });
        console.error('DashboardStore: Error loading dashboard data', err);
      }
    },

    /**
     * Refresh dashboard data - ASYNC
     */
    async refreshDashboardData(): Promise<void> {
      patchState(store, { error: null });
      try {
        const [metrics, activities] = await Promise.all([
          firstValueFrom(dashboardService.getMetrics()),
          firstValueFrom(dashboardService.getRecentActivities())
        ]);

        const stats: StatCard[] = [
          {
            title: 'Total Users',
            value: metrics.totalUsers,
            icon: '👥',
            color: 'bg-blue-50',
            description: 'Total registered users'
          },
          {
            title: 'Active Users',
            value: metrics.activeUsers,
            icon: '✅',
            color: 'bg-green-50',
            description: `${Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}% active today`
          },
          {
            title: 'Modules',
            value: metrics.totalModules,
            icon: '🔧',
            color: 'bg-purple-50',
            description: 'Study Notes, YouTube, LinkedIn, Blog'
          },
          {
            title: 'Content Items',
            value: metrics.totalContentItems,
            icon: '📚',
            color: 'bg-orange-50',
            description: 'Total content across all modules'
          }
        ];

        patchState(store, {
          stats,
          metrics,
          recentActivities: activities,
          success: 'Dashboard refreshed successfully!',
          lastUpdated: new Date()
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to refresh dashboard data'
        });
        console.error('DashboardStore: Error refreshing dashboard', err);
      }
    },

    /**
     * Load only recent activities - ASYNC
     */
    async loadRecentActivities(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const activities = await firstValueFrom(dashboardService.getRecentActivities());
        patchState(store, {
          recentActivities: activities,
          loading: false,
          error: null
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load recent activities',
          loading: false
        });
        console.error('DashboardStore: Error loading activities', err);
      }
    },

    /**
     * Load only metrics - ASYNC
     */
    async loadMetrics(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const metrics = await firstValueFrom(dashboardService.getMetrics());
        
        const stats: StatCard[] = [
          {
            title: 'Total Users',
            value: metrics.totalUsers,
            icon: '👥',
            color: 'bg-blue-50',
            description: 'Total registered users'
          },
          {
            title: 'Active Users',
            value: metrics.activeUsers,
            icon: '✅',
            color: 'bg-green-50',
            description: `${Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}% active today`
          },
          {
            title: 'Modules',
            value: metrics.totalModules,
            icon: '🔧',
            color: 'bg-purple-50',
            description: 'Study Notes, YouTube, LinkedIn, Blog'
          },
          {
            title: 'Content Items',
            value: metrics.totalContentItems,
            icon: '📚',
            color: 'bg-orange-50',
            description: 'Total content across all modules'
          }
        ];

        patchState(store, {
          stats,
          metrics,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load metrics',
          loading: false
        });
        console.error('DashboardStore: Error loading metrics', err);
      }
    },

    /**
     * Load activities by type - ASYNC
     */
    async loadActivitiesByType(type: 'user' | 'content' | 'module', limit: number = 10): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const activities = await firstValueFrom(dashboardService.getActivitiesByType(type, limit));
        patchState(store, {
          recentActivities: activities,
          loading: false,
          error: null
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? `Failed to load ${type} activities`,
          loading: false
        });
        console.error(`DashboardStore: Error loading ${type} activities`, err);
      }
    },

    /**
     * Load activity logs with pagination - ASYNC
     */
    async loadActivityLogs(page: number = 1, limit: number = 20): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const result = await firstValueFrom(dashboardService.getActivityLogs(page, limit));
        patchState(store, {
          recentActivities: result.data,
          loading: false,
          error: null
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load activity logs',
          loading: false
        });
        console.error('DashboardStore: Error loading activity logs', err);
      }
    },

    /**
     * Clear dashboard data
     */
    clearDashboard(): void {
      patchState(store, {
        stats: [],
        recentActivities: [],
        metrics: null,
        error: null,
        success: null,
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
    },

    /**
     * Set success message
     */
    setSuccess(success: string): void {
      patchState(store, { success });
      setTimeout(() => patchState(store, { success: null }), 3000);
    }
  }))
) {}
