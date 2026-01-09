import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = '/api/admin';

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard-stats`).pipe(
      // Fallback with mock data if API fails
      ((res: any) => res.catch(() => of({
        totalUsers: 150,
        totalApplications: 45
      })))
    );
  }

  getRecentUsers(limit: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recent-users?limit=${limit}`).pipe(
      ((res: any) => res.catch(() => of([])))
    );
  }
}
