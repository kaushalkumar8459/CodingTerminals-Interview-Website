import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';
  status: 'Active' | 'Inactive' | 'Suspended';
  modules?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserFilters {
  searchQuery?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Get all users with optional filters
   */
  getUsers(filters?: UserFilters): Observable<UsersResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.searchQuery) params = params.set('search', filters.searchQuery);
      if (filters.role) params = params.set('role', filters.role);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<UsersResponse>(`${this.apiUrl}`, { params }).pipe(
      tap(response => {
        this.usersSubject.next(response.data || []);
      })
    );
  }

  /**
   * Get single user by ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      })
    );
  }

  /**
   * Create new user
   */
  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}`, user).pipe(
      tap(newUser => {
        const currentUsers = this.usersSubject.value;
        this.usersSubject.next([...currentUsers, newUser]);
      })
    );
  }

  /**
   * Update existing user
   */
  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user).pipe(
      tap(updatedUser => {
        const currentUsers = this.usersSubject.value.map(u =>
          u.id === id ? updatedUser : u
        );
        this.usersSubject.next(currentUsers);
        if (this.currentUserSubject.value?.id === id) {
          this.currentUserSubject.next(updatedUser);
        }
      })
    );
  }

  /**
   * Delete user
   */
  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentUsers = this.usersSubject.value.filter(u => u.id !== id);
        this.usersSubject.next(currentUsers);
      })
    );
  }

  /**
   * Assign modules to user
   */
  assignModules(userId: string, modules: string[]): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/modules`, { modules }).pipe(
      tap(updatedUser => {
        const currentUsers = this.usersSubject.value.map(u =>
          u.id === userId ? updatedUser : u
        );
        this.usersSubject.next(currentUsers);
      })
    );
  }

  /**
   * Change user role
   */
  changeUserRole(userId: string, role: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/role`, { role }).pipe(
      tap(updatedUser => {
        const currentUsers = this.usersSubject.value.map(u =>
          u.id === userId ? updatedUser : u
        );
        this.usersSubject.next(currentUsers);
      })
    );
  }

  /**
   * Change user status
   */
  changeUserStatus(userId: string, status: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/status`, { status }).pipe(
      tap(updatedUser => {
        const currentUsers = this.usersSubject.value.map(u =>
          u.id === userId ? updatedUser : u
        );
        this.usersSubject.next(currentUsers);
      })
    );
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/role/${role}`);
  }

  /**
   * Search users
   */
  searchUsers(query: string): Observable<User[]> {
    const params = new HttpParams().set('search', query);
    return this.http.get<User[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Get current users from store
   */
  getCurrentUsers(): User[] {
    return this.usersSubject.value;
  }

  /**
   * Update users in store
   */
  setUsers(users: User[]): void {
    this.usersSubject.next(users);
  }
}