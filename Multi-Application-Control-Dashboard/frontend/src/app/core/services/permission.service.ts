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
   * Check if user has specific permission for a module and action
   */
  hasPermission(module: string, action: string = 'view'): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    // Super admin has all permissions
    if (user.role === 'super_admin') return true;

    // Viewer can only view
    if (user.role === 'viewer' && action !== 'view') {
      return false;
    }

    // Normal user has limited permissions
    if (user.role === 'normal_user') {
      // Normal users can only access profile and settings
      const allowedModules = ['Profile', 'Settings', 'Dashboard'];
      if (!allowedModules.includes(module)) {
        return false;
      }
      // Within allowed modules, they can view and edit their own data
      return ['view', 'edit'].includes(action);
    }

    // For Admin, check assigned modules
    if (user.role === 'admin') {
      return user.assignedModules.includes(module.toLowerCase());
    }

    return false;
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
