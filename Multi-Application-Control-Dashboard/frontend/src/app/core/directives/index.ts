import { HasPermissionDirective } from './has-permission.directive';
import { HasRoleDirective } from './has-role.directive';
import { AuthDisabledDirective } from './auth-disabled.directive';
import { HasPermissionPipe } from './has-permission.pipe';

// Export all authorization directives and pipes
export const AUTH_DIRECTIVES = [
  HasPermissionDirective,
  HasRoleDirective,
  AuthDisabledDirective,
  HasPermissionPipe
];

// Individual exports for selective importing
export {
  HasPermissionDirective,
  HasRoleDirective,
  AuthDisabledDirective,
  HasPermissionPipe
};