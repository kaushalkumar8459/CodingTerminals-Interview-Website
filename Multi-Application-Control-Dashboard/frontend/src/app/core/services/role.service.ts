import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Role, RoleType, ModulePermission, PermissionAction } from '../models/role.model';

export interface CreateRoleDto {
  name: string;
  type: RoleType;
  description?: string;
  modulePermissions?: ModulePermission[];
  isSystemRole?: boolean;
  isActive?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  modulePermissions?: ModulePermission[];
  isActive?: boolean;
}

export interface AssignModulePermissionsDto {
  modulePermissions: ModulePermission[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`;
  private rolesSubject = new BehaviorSubject<Role[]>([]);
  public roles$ = this.rolesSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all roles
   */
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl).pipe(
      tap(roles => this.rolesSubject.next(roles))
    );
  }

  /**
   * Get role by ID
   */
  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get roles by type
   */
  getRolesByType(type: RoleType): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/type/${type}`);
  }

  /**
   * Create new role
   */
  createRole(roleData: CreateRoleDto): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, roleData).pipe(
      tap(newRole => {
        const currentRoles = this.rolesSubject.value;
        this.rolesSubject.next([...currentRoles, newRole]);
      })
    );
  }

  /**
   * Update role
   */
  updateRole(id: string, roleData: UpdateRoleDto): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, roleData).pipe(
      tap(updatedRole => {
        const currentRoles = this.rolesSubject.value.map(r =>
          r.id === id ? updatedRole : r
        );
        this.rolesSubject.next(currentRoles);
      })
    );
  }

  /**
   * Delete role
   */
  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentRoles = this.rolesSubject.value.filter(r => r.id !== id);
        this.rolesSubject.next(currentRoles);
      })
    );
  }

  /**
   * Assign module permissions to role
   */
  assignModulePermissions(roleId: string, dto: AssignModulePermissionsDto): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/${roleId}/module-permissions`, dto).pipe(
      tap(updatedRole => {
        const currentRoles = this.rolesSubject.value.map(r =>
          r.id === roleId ? updatedRole : r
        );
        this.rolesSubject.next(currentRoles);
      })
    );
  }

  /**
   * Add single module permission to role
   */
  addModulePermission(roleId: string, modulePermission: ModulePermission): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/${roleId}/module-permission`, modulePermission);
  }

  /**
   * Remove module permission from role
   */
  removeModulePermission(roleId: string, moduleId: string): Observable<Role> {
    return this.http.delete<Role>(`${this.apiUrl}/${roleId}/module-permission/${moduleId}`);
  }

  /**
   * Check if role has permission
   */
  hasPermission(roleId: string, moduleId: string, action: PermissionAction): Observable<{ hasPermission: boolean }> {
    return this.http.get<{ hasPermission: boolean }>(
      `${this.apiUrl}/${roleId}/has-permission?moduleId=${moduleId}&action=${action}`
    );
  }

  /**
   * Get module permissions for role
   */
  getModulePermissions(roleId: string, moduleId: string): Observable<{ permissions: PermissionAction[] }> {
    return this.http.get<{ permissions: PermissionAction[] }>(
      `${this.apiUrl}/${roleId}/module-permissions/${moduleId}`
    );
  }
}
