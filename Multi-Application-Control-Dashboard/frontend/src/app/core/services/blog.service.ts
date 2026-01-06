import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface BlogPost {
  id?: string;
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
  status: 'draft' | 'published';
  views?: number;
  likes?: number;
  comments?: number;
  publishedDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = 'http://localhost:3000/api/blog';
  private postsSubject = new BehaviorSubject<BlogPost[]>([]);
  public posts$ = this.postsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadPosts();
  }

  loadPosts(): void {
    this.http.get<BlogPost[]>(this.apiUrl).subscribe((posts) => {
      this.postsSubject.next(posts);
    });
  }

  getPosts(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(this.apiUrl);
  }

  getPostById(id: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/${id}`);
  }

  createPost(post: BlogPost): Observable<BlogPost> {
    return this.http.post<BlogPost>(this.apiUrl, post).pipe(
      tap(() => this.loadPosts())
    );
  }

  updatePost(id: string, post: BlogPost): Observable<BlogPost> {
    return this.http.put<BlogPost>(`${this.apiUrl}/${id}`, post).pipe(
      tap(() => this.loadPosts())
    );
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadPosts())
    );
  }

  saveDraft(id: string, post: BlogPost): Observable<BlogPost> {
    return this.http.post<BlogPost>(`${this.apiUrl}/${id}/draft`, post).pipe(
      tap(() => this.loadPosts())
    );
  }

  publishPost(id: string): Observable<BlogPost> {
    return this.http.post<BlogPost>(`${this.apiUrl}/${id}/publish`, {}).pipe(
      tap(() => this.loadPosts())
    );
  }

  getDraftPosts(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(`${this.apiUrl}?status=draft`);
  }

  getPublishedPosts(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(`${this.apiUrl}?status=published`);
  }

  searchPosts(query: string): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(`${this.apiUrl}/search?q=${query}`);
  }

  getTrendingPosts(limit: number = 5): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(`${this.apiUrl}/trending?limit=${limit}`);
  }
}
