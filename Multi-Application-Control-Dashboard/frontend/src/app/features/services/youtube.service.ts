import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class YouTubeService {
  private apiUrl = '/api/youtube';

  constructor(private http: HttpClient) { }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`).pipe(
      catchError(() => of({
        total: 0,
        published: 0
      }))
    );
  }

  getPosts(limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/posts?limit=${limit}`).pipe(
      catchError(() => of([]))
    );
  }

  createPost(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts`, data).pipe(
      catchError(() => of(null))
    );
  }
}
