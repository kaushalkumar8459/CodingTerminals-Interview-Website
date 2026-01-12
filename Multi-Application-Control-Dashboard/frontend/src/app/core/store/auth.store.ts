import { Injectable, inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { AuthService, User, LoginRequest, LoginResponse } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  success: string | null;
  token: string | null;
  refreshToken: string | null;
  isRefreshing: boolean;
  lastTokenRefresh: Date | null;
}

const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  success: null,
  token: null,
  refreshToken: null,
  isRefreshing: false,
  lastTokenRefresh: null
};

@Injectable({
  providedIn: 'root'
})
export class AuthStore extends signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    isLoading: computed(() => state.loading()),
    isRefreshingToken: computed(() => state.isRefreshing()),
    hasToken: computed(() => !!state.token()),
    userEmail: computed(() => state.currentUser()?.email || ''),
    userName: computed(() => {
      const user = state.currentUser();
      return user ? `${user.firstName} ${user.lastName}` : '';
    }),
    userRole: computed(() => state.currentUser()?.role || ''),
    assignedModules: computed(() => state.currentUser()?.assignedModules || []),
    isAdmin: computed(() => {
      const role = state.currentUser()?.role;
      return role === 'admin' || role === 'super_admin';
    }),
    isSuperAdmin: computed(() => state.currentUser()?.role === 'super_admin'),
    isViewer: computed(() => state.currentUser()?.role === 'viewer'),
    userIsActive: computed(() => state.currentUser()?.isActive || false)
  })),
  withMethods((store, authService = inject(AuthService), router = inject(Router)) => ({
    // ===== PUBLIC ACTIONS (called from components) =====

    /**
     * Initialize auth state from localStorage - ASYNC
     */
    async initializeAuth(): Promise<void> {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('currentUser');

      if (token && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          patchState(store, {
            token,
            refreshToken,
            currentUser: user,
            isAuthenticated: true
          });
        } catch (e) {
          console.error('Error parsing stored user:', e);
          (store as any)['clearAuth']();
        }
      }
    },

    /**
     * Login user with email and password - ASYNC
     */
    async login(credentials: LoginRequest): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const response = await firstValueFrom(authService.login(credentials));
        patchState(store, {
          currentUser: response.user,
          token: response.accessToken,
          refreshToken: response.refreshToken || null,
          isAuthenticated: true,
          success: 'Login successful!',
          loading: false,
          error: null
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
        router.navigate(['/dashboard']);
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Login failed. Please check your credentials.',
          loading: false,
          isAuthenticated: false
        });
        console.error('AuthStore: Error logging in', err);
      }
    },

    /**
     * Register new user - ASYNC
     */
    async register(userData: any): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const response = await firstValueFrom(authService.register(userData));
        patchState(store, {
          currentUser: response.user,
          token: response.accessToken,
          refreshToken: response.refreshToken || null,
          isAuthenticated: true,
          success: 'Registration successful!',
          loading: false,
          error: null
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
        router.navigate(['/dashboard']);
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Registration failed. Please try again.',
          loading: false,
          isAuthenticated: false
        });
        console.error('AuthStore: Error registering', err);
      }
    },

    /**
     * Logout user
     */
    logout(): void {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      patchState(store, {
        currentUser: null,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        error: null,
        success: 'Logged out successfully!'
      });
      setTimeout(() => patchState(store, { success: null }), 3000);
      router.navigate(['/auth/login']);
    },

    /**
     * Refresh access token - ASYNC
     */
    async refreshAccessToken(): Promise<void> {
      patchState(store, { isRefreshing: true, error: null });
      try {
        const response = await firstValueFrom(authService.refreshToken());
        localStorage.setItem('accessToken', response.accessToken);
        patchState(store, {
          token: response.accessToken,
          isRefreshing: false,
          lastTokenRefresh: new Date()
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to refresh token',
          isRefreshing: false
        });
        // Auto-logout on refresh failure
        (store as any)['logout']();
        console.error('AuthStore: Error refreshing token', err);
      }
    },

    /**
     * Get user profile - ASYNC
     */
    async loadProfile(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const user = await firstValueFrom(authService.getProfile());
        patchState(store, {
          currentUser: user,
          loading: false,
          error: null
        });
        localStorage.setItem('currentUser', JSON.stringify(user));
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load profile',
          loading: false
        });
        console.error('AuthStore: Error loading profile', err);
      }
    },

    /**
     * Clear auth state
     */
    clearAuth(): void {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      patchState(store, {
        currentUser: null,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        error: null
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
     * Check if user has specific role
     */
    hasRole(role: string): boolean {
      return store.currentUser()?.role === role;
    },

    /**
     * Check if user has module access
     */
    hasModuleAccess(moduleName: string): boolean {
      return store.assignedModules().includes(moduleName);
    },

    /**
     * Update current user (after profile change)
     */
    updateCurrentUser(user: Partial<User>): void {
      const currentUser = store.currentUser();
      if (currentUser) {
        const updated = { ...currentUser, ...user };
        patchState(store, { currentUser: updated });
        localStorage.setItem('currentUser', JSON.stringify(updated));
      }
    }
  }))
) {
}
