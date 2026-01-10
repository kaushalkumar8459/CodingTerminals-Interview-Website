import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type BlogPostStatus = 'draft' | 'published';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  status: BlogPostStatus;
  author: string;
  tags: string[];
  featuredImage?: string;
  views: number;
  likes: number;
  comments: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface CreateBlogPostRequest {
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  tags: string[];
  featuredImage?: string;
}

export interface UpdateBlogPostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  tags?: string[];
  featuredImage?: string;
  status?: BlogPostStatus;
}

export interface BlogPostFilter {
  status?: BlogPostStatus;
  searchQuery?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedBlogResponse {
  data: BlogPost[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = `${environment.apiUrl}/blog`;

  constructor(private http: HttpClient) { }

  /**
   * Get all blog posts with optional filters
   */
  getPosts(filters?: BlogPostFilter): Observable<PaginatedBlogResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.searchQuery) params = params.set('search', filters.searchQuery);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<PaginatedBlogResponse>(`${this.apiUrl}`, { params });
  }

  /**
   * Get single blog post by ID
   */
  getPostById(id: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new blog post
   */
  createPost(data: CreateBlogPostRequest): Observable<BlogPost> {
    return this.http.post<BlogPost>(`${this.apiUrl}`, data);
  }

  /**
   * Update existing blog post
   */
  updatePost(id: string, data: UpdateBlogPostRequest): Observable<BlogPost> {
    return this.http.put<BlogPost>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Delete blog post
   */
  deletePost(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Publish a draft post
   */
  publishPost(id: string): Observable<BlogPost> {
    return this.http.post<BlogPost>(`${this.apiUrl}/${id}/publish`, {});
  }

  /**
   * Unpublish a published post
   */
  unpublishPost(id: string): Observable<BlogPost> {
    return this.http.post<BlogPost>(`${this.apiUrl}/${id}/unpublish`, {});
  }

  /**
   * Get posts by status
   */
  getPostsByStatus(status: BlogPostStatus): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(`${this.apiUrl}/status/${status}`);
  }

  /**
   * Search blog posts
   */
  searchPosts(query: string): Observable<BlogPost[]> {
    const params = new HttpParams().set('search', query);
    return this.http.get<BlogPost[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Get blog post analytics
   */
  getPostAnalytics(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/analytics`);
  }
}
