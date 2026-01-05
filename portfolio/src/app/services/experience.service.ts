import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Experience Service
 * Manages work experience entries
 */
@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  private apiUrl = 'http://localhost:3001/api/experience';

  constructor(private http: HttpClient) { }

  // Read operations
  getAllExperiences(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getExperienceById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // ADMIN operations
  createExperience(experienceData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, experienceData);
  }

  updateExperience(id: string, experienceData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, experienceData);
  }

  deleteExperience(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
