import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Module {
  id?: string;
  name: string;
  description?: string;
  enabled: boolean;
  icon?: string;
  category?: string;
  usersCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ModuleSettingsService {
  private apiUrl = 'http://localhost:3000/api/modules';
  private modulesSubject = new BehaviorSubject<Module[]>([]);
  public modules$ = this.modulesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadModules();
  }

  loadModules(): void {
    this.http.get<Module[]>(this.apiUrl).subscribe((modules) => {
      this.modulesSubject.next(modules);
    });
  }

  getAllModules(): Observable<Module[]> {
    return this.http.get<Module[]>(this.apiUrl);
  }

  getModuleById(id: string): Observable<Module> {
    return this.http.get<Module>(`${this.apiUrl}/${id}`);
  }

  createModule(module: Module): Observable<Module> {
    return this.http.post<Module>(this.apiUrl, module).pipe(
      tap(() => this.loadModules())
    );
  }

  updateModule(id: string, module: Module): Observable<Module> {
    return this.http.put<Module>(`${this.apiUrl}/${id}`, module).pipe(
      tap(() => this.loadModules())
    );
  }

  deleteModule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadModules())
    );
  }

  enableModule(id: string): Observable<Module> {
    return this.http.post<Module>(`${this.apiUrl}/${id}/enable`, {}).pipe(
      tap(() => this.loadModules())
    );
  }

  disableModule(id: string): Observable<Module> {
    return this.http.post<Module>(`${this.apiUrl}/${id}/disable`, {}).pipe(
      tap(() => this.loadModules())
    );
  }

  toggleModule(id: string, enabled: boolean): Observable<Module> {
    return this.http.post<Module>(`${this.apiUrl}/${id}/toggle`, { enabled }).pipe(
      tap(() => this.loadModules())
    );
  }

  getModuleStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  getEnabledModules(): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.apiUrl}?enabled=true`);
  }

  getModulesByCategory(category: string): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.apiUrl}/category/${category}`);
  }

  assignModuleToUsers(moduleId: string, userIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${moduleId}/assign-users`, { userIds }).pipe(
      tap(() => this.loadModules())
    );
  }

  removeModuleFromUsers(moduleId: string, userIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${moduleId}/remove-users`, { userIds }).pipe(
      tap(() => this.loadModules())
    );
  }
}
