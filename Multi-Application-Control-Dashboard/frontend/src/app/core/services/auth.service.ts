import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoleType, UserStatus } from '../models/role.model';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleType;
  customRoleId?: string;
  assignedModules: string[];
  status: UserStatus;
  isActive: boolean;
  lastLogin?: Date;
  phoneNumber?: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
  }

  /**
   * Load user from localStorage if available
   */
  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
  }

  /**
   * Check if current user is a Normal User
   */
  isNormalUser(): boolean {
    const user = this.getCurrentUser();
    return user?.role === RoleType.NORMAL_USER;
  }

  /**
   * Check if current user is trying to access admin functionality
   * and redirect to personal dashboard if needed
   */
  checkNormalUserRedirection(currentRoute: string): boolean {
    const user = this.getCurrentUser();
    
    if (user?.role === RoleType.NORMAL_USER) {
      // Define routes that Normal Users should not access
      const adminRoutes = ['/admin', '/blog', '/youtube', '/linkedin', '/study-notes'];
      
      // Check if current route starts with any of the admin routes
      const isTryingAdminRoute = adminRoutes.some(route => currentRoute.startsWith(route));
      
      if (isTryingAdminRoute) {
        // Redirect to personal dashboard
        this.router.navigate(['/personal-dashboard']);
        return false; // Indicate that access should be blocked
      }
    }
    
    return true; // Allow access for other users or allowed routes
  }

  /**
   * Login user with email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return new Observable(observer => {
      this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).subscribe({
        next: (response) => {
          this.setSession(response);
          observer.next(response);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Register new user
   */
  register(userData: any): Observable<LoginResponse> {
    return new Observable(observer => {
      this.http.post<LoginResponse>(`${this.apiUrl}/register`, userData).subscribe({
        next: (response) => {
          this.setSession(response);
          observer.next(response);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Store session data
   */
  private setSession(response: LoginResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Check if user has valid token
   */
  hasToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    return new Observable(observer => {
      this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, { refreshToken }).subscribe({
        next: (response) => {
          localStorage.setItem('accessToken', response.accessToken);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          this.logout();
          observer.error(error);
        }
      });
    });
  }

  /**
   * Get user profile details
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }
}