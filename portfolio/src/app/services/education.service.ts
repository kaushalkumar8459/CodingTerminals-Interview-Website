import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Education Service
 * Manages education entries
 */
@Injectable({
  providedIn: 'root'
})
export class EducationService {
  private apiUrl = 'http://localhost:3001/api/education';

  constructor(private http: HttpClient) { }

  // Read operations
  getAllEducation(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getEducationById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // ADMIN operations
  createEducation(educationData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, educationData);
  }

  updateEducation(id: string, educationData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, educationData);
  }

  deleteEducation(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
