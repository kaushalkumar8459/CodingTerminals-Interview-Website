import { SetMetadata } from '@nestjs/common';
import { PermissionAction } from '../../roles/schemas/role.schema';
import { PERMISSIONS_KEY, MODULE_KEY, PermissionRequirement } from '../guards/permission.guard';

/**
 * Decorator to require specific permissions for an endpoint
 * @param permissions - Array of permission requirements (module + action)
 * 
 * @example
 * // Require view permission on Blog module
 * @Permissions({ module: 'Blog', action: PermissionAction.VIEW })
 * 
 * @example
 * // Require multiple permissions
 * @Permissions(
 *   { module: 'Blog', action: PermissionAction.CREATE },
 *   { module: 'Blog', action: PermissionAction.EDIT }
 * )
 */
export const Permissions = (...permissions: PermissionRequirement[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorator to require access to a specific module
 * @param moduleName - The name of the module required
 * 
 * @example
 * @RequireModule('Blog')
 */
export const RequireModule = (moduleName: string) =>
  SetMetadata(MODULE_KEY, moduleName);

/**
 * Helper decorators for common permission patterns
 */

// View-only permission for a module
export const CanView = (module: string) =>
  Permissions({ module, action: PermissionAction.VIEW });

// Create permission for a module
export const CanCreate = (module: string) =>
  Permissions({ module, action: PermissionAction.CREATE });

// Edit permission for a module
export const CanEdit = (module: string) =>
  Permissions({ module, action: PermissionAction.EDIT });

// Delete permission for a module
export const CanDelete = (module: string) =>
  Permissions({ module, action: PermissionAction.DELETE });

// Full CRUD permissions for a module
export const CanCRUD = (module: string) =>
  Permissions(
    { module, action: PermissionAction.VIEW },
    { module, action: PermissionAction.CREATE },
    { module, action: PermissionAction.EDIT },
    { module, action: PermissionAction.DELETE }
  );
