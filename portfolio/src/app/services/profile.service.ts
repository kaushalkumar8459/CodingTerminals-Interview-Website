import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Profile Service
 * Manages personal profile and resume information
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:3001/api/profile';

  constructor(private http: HttpClient) { }

  /**
   * Get profile (single profile for the user)
   */
  getProfile(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  /**
   * Update profile
   * ADMIN ONLY
   */
  updateProfile(profileData: any): Observable<any> {
    return this.http.put<any>(this.apiUrl, profileData);
  }
}
