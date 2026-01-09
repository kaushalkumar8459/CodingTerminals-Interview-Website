import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StudyNotesService {
  private apiUrl = '/api/study-notes';

  constructor(private http: HttpClient) { }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`).pipe(
      catchError(() => of({
        total: 0,
        public_notes: 0
      }))
    );
  }

  getNotes(limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notes?limit=${limit}`).pipe(
      catchError(() => of([]))
    );
  }

  createNote(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/notes`, data).pipe(
      catchError(() => of(null))
    );
  }
}
