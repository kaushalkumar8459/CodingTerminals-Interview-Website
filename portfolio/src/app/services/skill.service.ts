import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Skill Service
 * Manages skills with proficiency tracking
 */
@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private apiUrl = 'http://localhost:3001/api/skills';

  constructor(private http: HttpClient) { }

  // Read operations
  getAllSkills(category?: string): Observable<any> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  getSkillById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // ADMIN operations
  createSkill(skillData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, skillData);
  }

  updateSkill(id: string, skillData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, skillData);
  }

  deleteSkill(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
