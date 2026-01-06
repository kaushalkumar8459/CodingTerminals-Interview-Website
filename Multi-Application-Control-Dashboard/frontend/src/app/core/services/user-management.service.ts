import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  assignedModules?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  profileImage?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  private apiUrl = 'http://localhost:3000/api/users';
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<User[]>(this.apiUrl).subscribe((users) => {
      this.usersSubject.next(users);
    });
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      tap(() => this.loadUsers())
    );
  }

  updateUser(id: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user).pipe(
      tap(() => this.loadUsers())
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadUsers())
    );
  }

  assignModulesToUser(userId: string, moduleIds: string[]): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/assign-modules`, { moduleIds }).pipe(
      tap(() => this.loadUsers())
    );
  }

  assignRole(userId: string, role: 'admin' | 'user' | 'moderator'): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/assign-role`, { role }).pipe(
      tap(() => this.loadUsers())
    );
  }

  promoteToAdmin(userId: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/promote`, {}).pipe(
      tap(() => this.loadUsers())
    );
  }

  deactivateUser(userId: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/deactivate`, {}).pipe(
      tap(() => this.loadUsers())
    );
  }

  activateUser(userId: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/activate`, {}).pipe(
      tap(() => this.loadUsers())
    );
  }

  suspendUser(userId: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/suspend`, {}).pipe(
      tap(() => this.loadUsers())
    );
  }

  changePassword(userId: string, oldPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/change-password`, {
      oldPassword,
      newPassword,
    });
  }

  resetPassword(userId: string): Observable<{ temporaryPassword: string }> {
    return this.http.post<{ temporaryPassword: string }>(`${this.apiUrl}/${userId}/reset-password`, {});
  }

  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/search?q=${query}`);
  }

  getUserStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}
