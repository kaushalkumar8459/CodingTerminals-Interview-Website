import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, shareReplay } from 'rxjs/operators';

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
 * Profile Service
 * Manages personal profile and resume information with caching and error handling
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:3001/api/profile';
  
  // Cache management
  private profileCache$ = new BehaviorSubject<ProfileData | null>(null);
  private profileSubject$ = new BehaviorSubject<ProfileData | null>(null);
  private summaryCache$ = new BehaviorSubject<ProfileData | null>(null);
  private isLoadingSubject$ = new BehaviorSubject<boolean>(false);
  private errorSubject$ = new BehaviorSubject<string | null>(null);

  // Public observables
  public profile$ = this.profileSubject$.asObservable();
  public isLoading$ = this.isLoadingSubject$.asObservable();
  public error$ = this.errorSubject$.asObservable();

  constructor(private http: HttpClient) {
    this.loadCachedProfile();
  }

  /**
   * Get complete profile information
   * Uses cache if available to reduce API calls
   */
  getProfile(forceRefresh = false): Observable<ApiResponse<ProfileData>> {
    // Return cached data if available and not forced refresh
    if (!forceRefresh && this.profileCache$.value) {
      return new Observable(observer => {
        observer.next({
          success: true,
          message: 'Profile (cached)',
          data: this.profileCache$.value!
        });
        observer.complete();
      });
    }

    this.isLoadingSubject$.next(true);
    this.errorSubject$.next(null);

    return this.http.get<ApiResponse<ProfileData>>(this.apiUrl).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.profileCache$.next(response.data);
          this.profileSubject$.next(response.data);
          this.cacheProfileLocally(response.data);
          this.errorSubject$.next(null);
        }
      }),
      catchError(error => this.handleError(error)),
      tap(() => this.isLoadingSubject$.next(false))
    );
  }

  /**
   * Get lightweight profile summary
   * Returns only essential profile information
   */
  getProfileSummary(): Observable<ApiResponse<ProfileData>> {
    // Return cached summary if available
    if (this.summaryCache$.value) {
      return new Observable(observer => {
        observer.next({
          success: true,
          message: 'Profile summary (cached)',
          data: this.summaryCache$.value!
        });
        observer.complete();
      });
    }

    return this.http.get<ApiResponse<ProfileData>>(`${this.apiUrl}/summary`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.summaryCache$.next(response.data);
        }
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Update profile with validation
   * @param profileData - The profile data to update
   */
  updateProfile(profileData: Partial<ProfileData>): Observable<ApiResponse<ProfileData>> {
    // Validation
    if (!profileData || Object.keys(profileData).length === 0) {
      this.errorSubject$.next('No data provided for update');
      return throwError(() => new Error('No data provided for update'));
    }

    this.isLoadingSubject$.next(true);
    this.errorSubject$.next(null);

    return this.http.put<ApiResponse<ProfileData>>(this.apiUrl, profileData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.profileCache$.next(response.data);
          this.profileSubject$.next(response.data);
          this.cacheProfileLocally(response.data);
          this.errorSubject$.next(null);
        }
      }),
      catchError(error => {
        const errorMessage = this.extractErrorMessage(error);
        this.errorSubject$.next(errorMessage);
        return throwError(() => error);
      }),
      tap(() => this.isLoadingSubject$.next(false))
    );
  }

  /**
   * Get cached profile from memory
   */
  getCachedProfile(): ProfileData | null {
    return this.profileCache$.value;
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.profileCache$.next(null);
    this.summaryCache$.next(null);
    this.profileSubject$.next(null);
    this.errorSubject$.next(null);
    localStorage.removeItem('profileCache');
  }

  /**
   * Private: Load cached profile from localStorage
   */
  private loadCachedProfile(): void {
    try {
      const cached = localStorage.getItem('profileCache');
      if (cached) {
        const profile = JSON.parse(cached);
        this.profileCache$.next(profile);
        this.profileSubject$.next(profile);
      }
    } catch (error) {
      console.error('Error loading cached profile:', error);
      this.clearCache();
    }
  }

  /**
   * Private: Cache profile locally
   */
  private cacheProfileLocally(profile: ProfileData): void {
    try {
      localStorage.setItem('profileCache', JSON.stringify(profile));
    } catch (error) {
      console.error('Error caching profile:', error);
    }
  }

  /**
   * Private: Handle HTTP errors with detailed messages
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred while processing your request';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
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

    this.errorSubject$.next(errorMessage);
    console.error('Profile Service Error:', errorMessage);
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
