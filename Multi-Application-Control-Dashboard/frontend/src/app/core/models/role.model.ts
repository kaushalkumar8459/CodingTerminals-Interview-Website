// Role types enum - must match backend RoleType enum
export enum RoleType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  NORMAL_USER = 'normal_user',
  VIEWER = 'viewer',
}

// Permission actions enum - must match backend PermissionAction enum
export enum PermissionAction {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
}

// Module permission structure
export interface ModulePermission {
  moduleId: string;
  moduleName: string;
  actions: PermissionAction[];
}

// Role interface
export interface Role {
  id: string;
  name: string;
  type: RoleType;
  description?: string;
  modulePermissions: ModulePermission[];
  isSystemRole: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// User status enum
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// User interface with RBAC fields
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: RoleType;
  customRoleId?: string;
  status: UserStatus;
  assignedModules: string[];
  emailVerified: boolean;
  lastLogin?: Date;
  phoneNumber?: string;
  avatarUrl?: string;
  preferences?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper functions for role checks
export function isSuperAdmin(role: RoleType): boolean {
  return role === RoleType.SUPER_ADMIN;
}

export function isAdmin(role: RoleType): boolean {
  return role === RoleType.ADMIN;
}

export function isNormalUser(role: RoleType): boolean {
  return role === RoleType.NORMAL_USER;
}

export function isViewer(role: RoleType): boolean {
  return role === RoleType.VIEWER;
}

export function canManageUsers(role: RoleType): boolean {
  return role === RoleType.SUPER_ADMIN;
}

export function canManageRoles(role: RoleType): boolean {
  return role === RoleType.SUPER_ADMIN;
}

export function canManageModules(role: RoleType): boolean {
  return role === RoleType.SUPER_ADMIN;
}

export function canCreateContent(role: RoleType): boolean {
  return role === RoleType.SUPER_ADMIN || role === RoleType.ADMIN;
}

export function canEditContent(role: RoleType): boolean {
  return role === RoleType.SUPER_ADMIN || role === RoleType.ADMIN;
}

export function canDeleteContent(role: RoleType): boolean {
  return role === RoleType.SUPER_ADMIN || role === RoleType.ADMIN;
}

// Role display names for UI
export const RoleDisplayNames: Record<RoleType, string> = {
  [RoleType.SUPER_ADMIN]: 'Super Admin',
  [RoleType.ADMIN]: 'Admin',
  [RoleType.NORMAL_USER]: 'Normal User',
  [RoleType.VIEWER]: 'Viewer',
};

// Status display names for UI
export const StatusDisplayNames: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'Active',
  [UserStatus.INACTIVE]: 'Inactive',
  [UserStatus.SUSPENDED]: 'Suspended',
};
