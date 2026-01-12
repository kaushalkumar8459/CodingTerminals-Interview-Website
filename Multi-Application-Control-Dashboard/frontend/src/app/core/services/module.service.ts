import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SystemModule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  usersCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ModulesResponse {
  data: SystemModule[];
  total?: number;
}

export interface ModuleUpdate {
  id: string;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  private apiUrl = `${environment.apiUrl}/modules`;
  private modulesSubject = new BehaviorSubject<SystemModule[]>([]);
  public modules$ = this.modulesSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Get all system modules
   */
  getModules(): Observable<ModulesResponse> {
    return this.http.get<ModulesResponse>(`${this.apiUrl}`).pipe(
      tap(response => {
        this.modulesSubject.next(response.data || response as any || []);
      })
    );
  }

  /**
   * Get module by ID
   */
  getModuleById(id: string): Observable<SystemModule> {
    return this.http.get<SystemModule>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update single module
   */
  updateModule(id: string, data: Partial<SystemModule>): Observable<SystemModule> {
    return this.http.put<SystemModule>(`${this.apiUrl}/${id}`, data).pipe(
      tap(updatedModule => {
        const currentModules = this.modulesSubject.value.map(m =>
          m.id === id ? updatedModule : m
        );
        this.modulesSubject.next(currentModules);
      })
    );
  }

  /**
   * Update multiple modules
   */
  updateModules(updates: ModuleUpdate[]): Observable<SystemModule[]> {
    return this.http.put<SystemModule[]>(`${this.apiUrl}/batch`, { updates }).pipe(
      tap(updatedModules => {
        this.modulesSubject.next(updatedModules);
      })
    );
  }

  /**
   * Toggle module enabled/disabled
   */
  toggleModule(id: string): Observable<SystemModule> {
    return this.http.post<SystemModule>(`${this.apiUrl}/${id}/toggle`, {}).pipe(
      tap(updatedModule => {
        const currentModules = this.modulesSubject.value.map(m =>
          m.id === id ? updatedModule : m
        );
        this.modulesSubject.next(currentModules);
      })
    );
  }

  /**
   * Check if user has access to module
   */
  hasModuleAccess(userId: string, moduleName: string): Observable<boolean> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('module', moduleName);
    return this.http.get<boolean>(`${this.apiUrl}/access`, { params });
  }

  /**
   * Get enabled modules only
   */
  getEnabledModules(): Observable<SystemModule[]> {
    return this.http.get<SystemModule[]>(`${this.apiUrl}/enabled`);
  }

  /**
   * Get module statistics
   */
  getModuleStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  /**
   * Get current modules from store
   */
  getCurrentModules(): SystemModule[] {
    return this.modulesSubject.value;
  }

  /**
   * Update modules in store
   */
  setModules(modules: SystemModule[]): void {
    this.modulesSubject.next(modules);
  }

  /**
   * Check if module is enabled
   */
  isModuleEnabled(moduleName: string): boolean {
    return this.modulesSubject.value.some(m => m.name === moduleName && m.enabled);
  }
}
