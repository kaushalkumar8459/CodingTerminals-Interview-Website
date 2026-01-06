import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isSuperAdmin: boolean;
  assignedModules: string[];
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private currentUser$ = new BehaviorSubject<User | null>(null);
  private token: string | null = null;

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  /**
   * Load user and token from localStorage on app initialization
   */
  private loadFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('current_user');
    
    if (token && user) {
      this.token = token;
      this.currentUser$.next(JSON.parse(user));
    }
  }

  /**
   * Login user with email and password
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          this.token = response.accessToken;
          this.currentUser$.next(response.user);
          localStorage.setItem('auth_token', response.accessToken);
          localStorage.setItem('current_user', JSON.stringify(response.user));
        }),
      );
  }

  /**
   * Register new user (Super Admin only)
   */
  register(registerData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, registerData)
      .pipe(
        tap((response) => {
          this.token = response.accessToken;
          this.currentUser$.next(response.user);
          localStorage.setItem('auth_token', response.accessToken);
          localStorage.setItem('current_user', JSON.stringify(response.user));
        }),
      );
  }

  /**
   * Logout current user
   */
  logout(): void {
    this.token = null;
    this.currentUser$.next(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token && this.currentUser$.value !== null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser$.value;
  }

  /**
   * Get current user role
   */
  getCurrentUserRole(): string {
    return this.currentUser$.value?.role || 'viewer';
  }

  /**
   * Check if current user is super admin
   */
  isSuperAdmin(): boolean {
    return this.currentUser$.value?.isSuperAdmin || false;
  }

  /**
   * Get current user observable
   */
  getCurrentUser$(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  /**
   * Get JWT token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Check if user has access to module
   */
  hasModuleAccess(moduleId: string): boolean {
    const user = this.currentUser$.value;
    return user?.isSuperAdmin || user?.assignedModules.includes(moduleId) || false;
  }

  /**
   * Get user accessible modules
   */
  getAccessibleModules(): string[] {
    return this.currentUser$.value?.assignedModules || [];
  }

  /**
   * Refresh token (if needed)
   */
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, {})
      .pipe(
        tap((response) => {
          this.token = response.accessToken;
          this.currentUser$.next(response.user);
          localStorage.setItem('auth_token', response.accessToken);
        }),
      );
  }
}
