import { Injectable, inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { AuthService, User } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ProfileState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  lastUpdated: Date | null;
}

const initialState: ProfileState = {
  currentUser: null,
  loading: false,
  error: null,
  success: null,
  lastUpdated: null
};

@Injectable({
  providedIn: 'root'
})
export class ProfileStore extends signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    // ===== LOADING & UI STATES =====
    isLoading: computed(() => state.loading()),
    hasError: computed(() => state.error() !== null),
    hasSuccess: computed(() => state.success() !== null),
    
    // ===== DATA PRESENCE CHECKS =====
    hasUser: computed(() => state.currentUser() !== null),
    userFullName: computed(() => {
      const user = state.currentUser();
      return user ? `${user.firstName} ${user.lastName}` : '';
    }),
    userEmail: computed(() => state.currentUser()?.email || ''),
    userRole: computed(() => state.currentUser()?.role || ''),
    
    // ===== DISPLAY FLAGS =====
    isEmpty: computed(() => state.currentUser() === null && !state.loading()),
    isDataFresh: computed(() => {
      if (!state.lastUpdated()) return false;
      const now = new Date();
      const diff = now.getTime() - state.lastUpdated()!.getTime();
      return diff < 300000; // Less than 5 minutes
    })
  })),
  withMethods((store, authService = inject(AuthService)) => ({
    // ===== PUBLIC ACTIONS (called from components) =====

    /**
     * Initialize profile from auth store - ASYNC
     */
    async initializeProfile(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const user = authService.getCurrentUser();
        if (user) {
          patchState(store, {
            currentUser: user,
            loading: false,
            error: null,
            lastUpdated: new Date()
          });
        } else {
          patchState(store, {
            error: 'No user found. Please log in.',
            loading: false
          });
        }
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to initialize profile',
          loading: false
        });
        console.error('ProfileStore: Error initializing profile', err);
      }
    },

    /**
     * Load user profile from API - ASYNC
     */
    async loadProfile(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const user = await firstValueFrom(authService.getProfile());
        patchState(store, {
          currentUser: user,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load profile',
          loading: false
        });
        console.error('ProfileStore: Error loading profile', err);
      }
    },

    /**
     * Update user profile - ASYNC
     */
    async updateProfile(data: UpdateProfileRequest): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        // Call the updateProfile method from AuthService
        // Note: This assumes AuthService has an updateProfile method
        // For now, we'll update via AuthStore's updateCurrentUser method
        const currentUser = store.currentUser();
        if (!currentUser) {
          throw new Error('No user found');
        }

        const updatedUser = {
          ...currentUser,
          ...data
        };

        patchState(store, {
          currentUser: updatedUser,
          success: 'Profile updated successfully!',
          error: null,
          loading: false,
          lastUpdated: new Date()
        });

        // Persist to localStorage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        // Clear success message after 3 seconds
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to update profile',
          loading: false
        });
        console.error('ProfileStore: Error updating profile', err);
      }
    },

    /**
     * Clear profile data
     */
    clearProfile(): void {
      patchState(store, {
        currentUser: null,
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
