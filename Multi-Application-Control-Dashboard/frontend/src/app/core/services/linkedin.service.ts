import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface LinkedinPost {
  id: string;
  title: string;
  content: string;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
  scheduledAt?: Date;
  publishedAt?: Date;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  createdBy: string;
  imageUrl?: string;
  hashtags: string[];
}

export interface CreatePostRequest {
  title: string;
  content: string;
  imageUrl?: string;
  hashtags: string[];
  scheduledAt?: Date;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  status?: PostStatus;
}

export interface PostFilter {
  status?: PostStatus;
  searchQuery?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedPostsResponse {
  data: LinkedinPost[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class LinkedinService {
  private apiUrl = `${environment.apiUrl}/linkedin`;
  private postsSubject = new BehaviorSubject<LinkedinPost[]>([]);
  public posts$ = this.postsSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Get all posts with optional filters
   */
  getPosts(filters?: PostFilter): Observable<PaginatedPostsResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.searchQuery) params = params.set('search', filters.searchQuery);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<PaginatedPostsResponse>(`${this.apiUrl}/posts`, { params });
  }

  /**
   * Get single post by ID
   */
  getPostById(id: string): Observable<LinkedinPost> {
    return this.http.get<LinkedinPost>(`${this.apiUrl}/posts/${id}`);
  }

  /**
   * Create new LinkedIn post
   */
  createPost(data: CreatePostRequest): Observable<LinkedinPost> {
    return this.http.post<LinkedinPost>(`${this.apiUrl}/posts`, data);
  }

  /**
   * Update existing LinkedIn post
   */
  updatePost(id: string, data: UpdatePostRequest): Observable<LinkedinPost> {
    return this.http.put<LinkedinPost>(`${this.apiUrl}/posts/${id}`, data);
  }

  /**
   * Delete LinkedIn post
   */
  deletePost(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/posts/${id}`);
  }

  /**
   * Publish a scheduled post
   */
  publishPost(id: string): Observable<LinkedinPost> {
    return this.http.post<LinkedinPost>(`${this.apiUrl}/posts/${id}/publish`, {});
  }

  /**
   * Schedule a post for later
   */
  schedulePost(id: string, scheduledAt: Date): Observable<LinkedinPost> {
    return this.http.post<LinkedinPost>(`${this.apiUrl}/posts/${id}/schedule`, { scheduledAt });
  }

  /**
   * Archive a post
   */
  archivePost(id: string): Observable<LinkedinPost> {
    return this.http.post<LinkedinPost>(`${this.apiUrl}/posts/${id}/archive`, {});
  }

  /**
   * Get posts by status
   */
  getPostsByStatus(status: PostStatus): Observable<LinkedinPost[]> {
    return this.http.get<LinkedinPost[]>(`${this.apiUrl}/posts/status/${status}`);
  }

  /**
   * Search posts
   */
  searchPosts(query: string): Observable<LinkedinPost[]> {
    const params = new HttpParams().set('search', query);
    return this.http.get<LinkedinPost[]>(`${this.apiUrl}/posts/search`, { params });
  }

  /**
   * Get posts analytics
   */
  getPostAnalytics(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/posts/${id}/analytics`);
  }

  /**
   * Update local posts in subject
   */
  setLocalPosts(posts: LinkedinPost[]): void {
    this.postsSubject.next(posts);
  }

  /**
   * Get current posts from subject
   */
  getLocalPosts(): LinkedinPost[] {
    return this.postsSubject.value;
  }
}
