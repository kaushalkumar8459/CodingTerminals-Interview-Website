import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalModules: number;
  totalContentItems: number;
  moduleBreakdown: {
    [key: string]: number;
  };
}

export interface RecentActivity {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  type: 'user' | 'content' | 'module';
  metadata?: any;
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  activities: RecentActivity[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  /**
   * Get dashboard metrics (statistics)
   */
  getMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/metrics`);
  }

  /**
   * Get recent activities
   */
  getRecentActivities(limit: number = 5): Observable<RecentActivity[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<RecentActivity[]>(`${this.apiUrl}/activities`, { params });
  }

  /**
   * Get full dashboard data (metrics + activities)
   */
  getDashboardData(limit: number = 5): Observable<DashboardResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<DashboardResponse>(`${this.apiUrl}`, { params });
  }

  /**
   * Get user metrics
   */
  getUserMetrics(): Observable<{ totalUsers: number; activeUsers: number; inactiveUsers: number }> {
    return this.http.get<any>(`${this.apiUrl}/users/metrics`);
  }

  /**
   * Get content metrics
   */
  getContentMetrics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/content/metrics`);
  }

  /**
   * Get module metrics
   */
  getModuleMetrics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/modules/metrics`);
  }

  /**
   * Get activity by type
   */
  getActivitiesByType(type: 'user' | 'content' | 'module', limit: number = 10): Observable<RecentActivity[]> {
    const params = new HttpParams()
      .set('type', type)
      .set('limit', limit.toString());
    return this.http.get<RecentActivity[]>(`${this.apiUrl}/activities/type`, { params });
  }

  /**
   * Get activity logs (paginated)
   */
  getActivityLogs(page: number = 1, limit: number = 20): Observable<{ data: RecentActivity[]; total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<any>(`${this.apiUrl}/activities/logs`, { params });
  }
}
