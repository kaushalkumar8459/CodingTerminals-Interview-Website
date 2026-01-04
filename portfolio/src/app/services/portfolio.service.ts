import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Portfolio Service
 * Handles all API communications for portfolio items
 * NO HARD-CODED DATA - All data from backend API
 */
@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = 'http://localhost:3001/api/portfolio';

  constructor(private http: HttpClient) { }

  // ==================== VIEWER & ADMIN ACCESS ====================

  /**
   * Get all portfolios with optional filters
   * @param filters - category, featured, status
   */
  getAllPortfolios(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Get portfolio by ID
   */
  getPortfolioById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get portfolio statistics
   */
  getPortfolioStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  // ==================== ADMIN ONLY ACCESS ====================

  /**
   * Create new portfolio item
   * ADMIN ONLY
   */
  createPortfolio(portfolioData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, portfolioData);
  }

  /**
   * Update existing portfolio item
   * ADMIN ONLY
   */
  updatePortfolio(id: string, portfolioData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, portfolioData);
  }

  /**
   * Delete portfolio item
   * ADMIN ONLY
   */
  deletePortfolio(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
