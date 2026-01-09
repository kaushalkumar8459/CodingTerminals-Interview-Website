import { Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

/**
 * Profile Data Model
 */
export interface ProfileData {
  profileId?: string;
  fullName: string;
  email: string;
  title: string;
  profileImage?: string;
  bio?: string;
  skills?: string[];
  experience?: any[];
  education?: any[];
  availableForWork?: boolean;
  [key: string]: any;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

/**
 * Profile Store State
 */
interface ProfileState {
  profile: ProfileData | null;
  summary: ProfileData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Profile Store - Signal-based State Management
 * Manages profile data with modern Angular signals
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileStore {
  private apiUrl = 'http://localhost:3001/api/profile';

  // Private signals for state management
  private state = signal<ProfileState>({
    profile: null,
    summary: null,
    isLoading: false,
    error: null,
    lastUpdated: null
  });

  // Public computed signals (read-only access)
  readonly profile = computed(() => this.state().profile);
  readonly summary = computed(() => this.state().summary);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);
  readonly lastUpdated = computed(() => this.state().lastUpdated);
  readonly hasProfile = computed(() => !!this.state().profile);
  readonly isAvailableForWork = computed(() => this.state().profile?.availableForWork ?? false);

  constructor(private http: HttpClient) {
    this.loadCachedProfile();
  }

  /**
   * Load complete profile information
   * @param forceRefresh - Force API call even if cached data exists
   */
  loadProfile(forceRefresh = false): void {
    const currentProfile = this.state().profile;
    
    // Return cached data if available and not forced refresh
    if (!forceRefresh && currentProfile) {
      console.log('📦 Using cached profile data');
      return;
    }

    this.updateState({ isLoading: true, error: null });

    this.http.get<ApiResponse<ProfileData>>(this.apiUrl).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.updateState({ 
            profile: response.data, 
            isLoading: false,
            error: null,
            lastUpdated: new Date()
          });
          this.cacheProfileLocally(response.data);
          console.log('✅ Profile loaded successfully');
        }
      }),
      catchError(error => this.handleError(error))
    ).subscribe({
      error: () => this.updateState({ isLoading: false })
    });
  }

  /**
   * Load lightweight profile summary
   */
  loadProfileSummary(): void {
    const currentSummary = this.state().summary;
    
    // Return cached summary if available
    if (currentSummary) {
      console.log('📦 Using cached profile summary');
      return;
    }

    this.http.get<ApiResponse<ProfileData>>(`${this.apiUrl}/summary`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.updateState({ summary: response.data });
          console.log('✅ Profile summary loaded');
        }
      }),
      catchError(error => this.handleError(error))
    ).subscribe();
  }

  /**
   * Update profile data
   * @param profileData - Partial profile data to update
   */
  updateProfile(profileData: Partial<ProfileData>): void {
    // Validation
    if (!profileData || Object.keys(profileData).length === 0) {
      this.updateState({ error: 'No data provided for update' });
      console.error('❌ Update failed: No data provided');
      return;
    }

    this.updateState({ isLoading: true, error: null });
    console.log('🔄 Updating profile...');

    this.http.put<ApiResponse<ProfileData>>(this.apiUrl, profileData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.updateState({ 
            profile: response.data, 
            isLoading: false,
            error: null,
            lastUpdated: new Date()
          });
          this.cacheProfileLocally(response.data);
          console.log('✅ Profile updated successfully');
        }
      }),
      catchError(error => {
        const errorMessage = this.extractErrorMessage(error);
        this.updateState({ error: errorMessage, isLoading: false });
        console.error('❌ Profile update failed:', errorMessage);
        return throwError(() => error);
      })
    ).subscribe();
  }

  /**
   * Clear all cached data and reset state
   */
  clearCache(): void {
    this.state.set({
      profile: null,
      summary: null,
      isLoading: false,
      error: null,
      lastUpdated: null
    });
    localStorage.removeItem('profileCache');
    console.log('🗑️ Profile cache cleared');
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.updateState({ error: null });
  }

  /**
   * Get cached profile data (synchronous)
   */
  getCachedProfile(): ProfileData | null {
    return this.state().profile;
  }

  /**
   * Private: Update state immutably
   */
  private updateState(partial: Partial<ProfileState>): void {
    this.state.update(state => ({ ...state, ...partial }));
  }

  /**
   * Private: Load cached profile from localStorage
   */
  private loadCachedProfile(): void {
    try {
      const cached = localStorage.getItem('profileCache');
      if (cached) {
        const profile = JSON.parse(cached);
        this.updateState({ profile });
        console.log('📦 Loaded profile from cache');
      }
    } catch (error) {
      console.error('❌ Error loading cached profile:', error);
      this.clearCache();
    }
  }

  /**
   * Private: Cache profile in localStorage
   */
  private cacheProfileLocally(profile: ProfileData): void {
    try {
      localStorage.setItem('profileCache', JSON.stringify(profile));
    } catch (error) {
      console.error('❌ Error caching profile:', error);
    }
  }

  /**
   * Private: Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred while processing your request';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check your network connection.';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Invalid request data';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'Profile not found.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    }

    this.updateState({ error: errorMessage, isLoading: false });
    console.error('❌ Profile Store Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Private: Extract error message from response
   */
  private extractErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.error?.errors) {
      return Object.values(error.error.errors).join(', ');
    }
    return error.message || 'An error occurred';
  }
}
