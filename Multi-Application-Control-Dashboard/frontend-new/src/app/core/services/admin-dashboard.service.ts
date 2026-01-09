import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
  totalModules: number;
  suspendedUsers: number;
  inactiveUsers: number;
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: Date;
  lastLogin?: Date;
}

export interface ModuleStatus {
  id: string;
  name: string;
  enabled: boolean;
  users: number;
  status: 'operational' | 'maintenance' | 'disabled';
  lastUpdated: Date;
}

export interface AdminDashboardResponse {
  metrics: AdminMetrics;
  recentUsers: RecentUser[];
  moduleStatuses: ModuleStatus[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private apiUrl = `${environment.apiUrl}/admin/dashboard`;

  constructor(private http: HttpClient) { }

  /**
   * Get admin dashboard metrics
   */
  getMetrics(): Observable<AdminMetrics> {
    return this.http.get<AdminMetrics>(`${this.apiUrl}/metrics`);
  }

  /**
   * Get recent users
   */
  getRecentUsers(limit: number = 10): Observable<RecentUser[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<RecentUser[]>(`${this.apiUrl}/recent-users`, { params });
  }

  /**
   * Get module statuses
   */
  getModuleStatuses(): Observable<ModuleStatus[]> {
    return this.http.get<ModuleStatus[]>(`${this.apiUrl}/modules`);
  }

  /**
   * Get full admin dashboard data
   */
  getAdminDashboardData(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(`${this.apiUrl}`);
  }

  /**
   * Get user statistics
   */
  getUserStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics/users`);
  }

  /**
   * Get system health
   */
  getSystemHealth(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/system/health`);
  }

  /**
   * Get activity logs
   */
  getActivityLogs(limit: number = 20): Observable<any> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any>(`${this.apiUrl}/logs`, { params });
  }

  /**
   * Get module performance
   */
  getModulePerformance(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/modules/performance`);
  }

  /**
   * Get user distribution by role
   */
  getUserDistribution(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics/distribution`);
  }
}
