import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LinkedInPost {
  id?: string;
  title: string;
  content: string;
  scheduledDate?: Date;
  status: 'draft' | 'scheduled' | 'published';
  likes?: number;
  comments?: number;
  shares?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class LinkedInService {
  private apiUrl = 'http://localhost:3000/api/linkedin';
  private postsSubject = new BehaviorSubject<LinkedInPost[]>([]);
  public posts$ = this.postsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadPosts();
  }

  loadPosts(): void {
    this.http.get<LinkedInPost[]>(this.apiUrl).subscribe((posts) => {
      this.postsSubject.next(posts);
    });
  }

  getPosts(): Observable<LinkedInPost[]> {
    return this.http.get<LinkedInPost[]>(this.apiUrl);
  }

  getPostById(id: string): Observable<LinkedInPost> {
    return this.http.get<LinkedInPost>(`${this.apiUrl}/${id}`);
  }

  createPost(post: LinkedInPost): Observable<LinkedInPost> {
    return this.http.post<LinkedInPost>(this.apiUrl, post).pipe(
      tap(() => this.loadPosts())
    );
  }

  updatePost(id: string, post: LinkedInPost): Observable<LinkedInPost> {
    return this.http.put<LinkedInPost>(`${this.apiUrl}/${id}`, post).pipe(
      tap(() => this.loadPosts())
    );
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadPosts())
    );
  }

  publishPost(id: string): Observable<LinkedInPost> {
    return this.http.post<LinkedInPost>(`${this.apiUrl}/${id}/publish`, {}).pipe(
      tap(() => this.loadPosts())
    );
  }

  schedulePost(id: string, scheduledDate: Date): Observable<LinkedInPost> {
    return this.http.post<LinkedInPost>(`${this.apiUrl}/${id}/schedule`, { scheduledDate }).pipe(
      tap(() => this.loadPosts())
    );
  }

  getAnalytics(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/analytics`);
  }

  getScheduledPosts(): Observable<LinkedInPost[]> {
    return this.http.get<LinkedInPost[]>(`${this.apiUrl}?status=scheduled`);
  }
}
