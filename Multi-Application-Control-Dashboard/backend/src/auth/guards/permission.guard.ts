import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType, PermissionAction } from '../../roles/schemas/role.schema';

// Metadata keys
export const PERMISSIONS_KEY = 'permissions';
export const MODULE_KEY = 'module';

// Interface for permission requirement
export interface PermissionRequirement {
  module: string;
  action: PermissionAction;
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from decorator metadata
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionRequirement[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Super Admin bypasses all permission checks
    if (user.role === RoleType.SUPER_ADMIN) {
      return true;
    }

    // Viewer can only have VIEW permission
    if (user.role === RoleType.VIEWER) {
      const hasNonViewPermission = requiredPermissions.some(
        (perm) => perm.action !== PermissionAction.VIEW
      );
      if (hasNonViewPermission) {
        throw new ForbiddenException(
          'Viewer role is read-only. Cannot perform this action.'
        );
      }
    }

    // Normal User can only access their own data (profile, settings)
    if (user.role === RoleType.NORMAL_USER) {
      const allowedModules = ['Profile', 'Settings'];
      const hasRestrictedModule = requiredPermissions.some(
        (perm) => !allowedModules.includes(perm.module)
      );
      if (hasRestrictedModule) {
        throw new ForbiddenException(
          'Normal users can only access their profile and settings.'
        );
      }
    }

    // For Admin role, check module permissions
    if (user.role === RoleType.ADMIN) {
      // Check if user has all required permissions
      for (const required of requiredPermissions) {
        const hasPermission = this.checkUserPermission(user, required);
        if (!hasPermission) {
          throw new ForbiddenException(
            `Access denied: Missing ${required.action} permission for ${required.module} module`
          );
        }
      }
    }

    return true;
  }

  /**
   * Check if user has a specific permission
   */
  private checkUserPermission(user: any, required: PermissionRequirement): boolean {
    // Check if user has the module assigned
    if (!user.assignedModules || user.assignedModules.length === 0) {
      return false;
    }

    // Check if module is in user's assigned modules
    const moduleNames = user.assignedModules.map((m: any) => 
      typeof m === 'string' ? m : m.name || m.toString()
    );
    
    const hasModule = moduleNames.some((name: string) => 
      name.toLowerCase() === required.module.toLowerCase()
    );

    if (!hasModule) {
      return false;
    }

    // If user has custom role with module permissions, check those
    if (user.modulePermissions && Array.isArray(user.modulePermissions)) {
      const modulePermission = user.modulePermissions.find(
        (mp: any) => mp.moduleName.toLowerCase() === required.module.toLowerCase()
      );
      
      if (modulePermission) {
        return modulePermission.actions.includes(required.action);
      }
    }

    // Default: Admin with assigned module gets all CRUD permissions
    return true;
  }
}

/**
 * Module Access Guard - checks if user has access to a specific module
 */
@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredModule = this.reflector.getAllAndOverride<string>(MODULE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredModule) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Super Admin has access to all modules
    if (user.role === RoleType.SUPER_ADMIN) {
      return true;
    }

    // Check if user has the module assigned
    if (!user.assignedModules || user.assignedModules.length === 0) {
      throw new ForbiddenException(`Access denied: You don't have access to ${requiredModule} module`);
    }

    const moduleNames = user.assignedModules.map((m: any) =>
      typeof m === 'string' ? m : m.name || m.toString()
    );

    const hasAccess = moduleNames.some(
      (name: string) => name.toLowerCase() === requiredModule.toLowerCase()
    );

    if (!hasAccess) {
      throw new ForbiddenException(`Access denied: You don't have access to ${requiredModule} module`);
    }

    return true;
  }
}
