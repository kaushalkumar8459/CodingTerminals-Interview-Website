import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // ==================== Study Notes ====================
  getAllStudyNotes(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/study-notes?page=${page}&limit=${limit}`);
  }

  getStudyNoteById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/study-notes/${id}`);
  }

  createStudyNote(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/study-notes`, data);
  }

  updateStudyNote(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/study-notes/${id}`, data);
  }

  deleteStudyNote(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/study-notes/${id}`);
  }

  // ==================== YouTube ====================
  getAllVideos(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/youtube?page=${page}&limit=${limit}`);
  }

  getVideoById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/youtube/${id}`);
  }

  createVideo(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/youtube`, data);
  }

  updateVideo(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/youtube/${id}`, data);
  }

  deleteVideo(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/youtube/${id}`);
  }

  getTrendingVideos(limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/youtube/trending?limit=${limit}`);
  }

  // ==================== LinkedIn ====================
  getAllLinkedInPosts(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/linkedin?page=${page}&limit=${limit}`);
  }

  getLinkedInPostById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/linkedin/${id}`);
  }

  createLinkedInPost(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/linkedin`, data);
  }

  updateLinkedInPost(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/linkedin/${id}`, data);
  }

  deleteLinkedInPost(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/linkedin/${id}`);
  }

  publishLinkedInPost(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/linkedin/${id}/publish`, {});
  }

  getLinkedInAnalytics(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/linkedin/${id}/analytics`);
  }

  // ==================== Blog ====================
  getAllBlogPosts(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/blog?page=${page}&limit=${limit}`);
  }

  getBlogPostById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/blog/${id}`);
  }

  createBlogPost(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/blog`, data);
  }

  updateBlogPost(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/blog/${id}`, data);
  }

  deleteBlogPost(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/blog/${id}`);
  }

  publishBlogPost(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/blog/${id}/publish`, {});
  }

  saveBlogDraft(id: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/blog/${id}/draft`, data);
  }

  getTrendingBlogPosts(limit: number = 5): Observable<any> {
    return this.http.get(`${this.apiUrl}/blog/trending?limit=${limit}`);
  }

  // ==================== Modules ====================
  getAllModules(): Observable<any> {
    return this.http.get(`${this.apiUrl}/modules`);
  }

  getModuleStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/modules/stats`);
  }

  getModuleById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/modules/${id}`);
  }

  // ==================== Users (Admin Only) ====================
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${id}`);
  }

  updateUserProfile(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, data);
  }

  assignModulesToUser(userId: string, moduleIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/assign-modules`, { moduleIds });
  }

  assignRoleToUser(userId: string, roleId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/assign-role`, { roleId });
  }

  promoteUserToAdmin(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/promote`, {});
  }

  deactivateUser(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/deactivate`, {});
  }

  activateUser(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/activate`, {});
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }

  changePassword(userId: string, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/change-password`, {
      oldPassword,
      newPassword,
    });
  }
}
