import { Injectable } from '@angular/core';
import { AuthService, User } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  constructor(private authService: AuthService) { }

  /**
   * Check if current user has access to a specific module
   */
  hasModuleAccess(moduleId: string): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    // Super admin has access to all modules
    if (user.role === 'super_admin') return true;

    // Check if module is in assigned modules
    return user.assignedModules.includes(moduleId);
  }

  /**
   * Check if user can perform action based on role
   */
  canEdit(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    return user.role === 'super_admin' || user.role === 'admin';
  }

  /**
   * Check if user can delete content
   */
  canDelete(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    return user.role === 'super_admin' || user.role === 'admin';
  }

  /**
   * Check if user can manage users (super admin only)
   */
  canManageUsers(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    return user.role === 'super_admin';
  }

  /**
   * Check if user can manage modules (super admin only)
   */
  canManageModules(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    return user.role === 'super_admin';
  }

  /**
   * Check if user is viewer (read-only)
   */
  isViewer(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    return user.role === 'viewer';
  }

  /**
   * Get all accessible modules for current user
   */
  getAccessibleModules(): string[] {
    const user = this.authService.getCurrentUser();
    if (!user) return [];

    if (user.role === 'super_admin') {
      // Return all module IDs (will be populated from backend)
      return ['study_notes', 'youtube', 'linkedin', 'blog'];
    }

    return user.assignedModules;
  }
}
