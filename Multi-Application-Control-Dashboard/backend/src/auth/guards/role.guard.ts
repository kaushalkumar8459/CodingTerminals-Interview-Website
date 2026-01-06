import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType } from '../../roles/schemas/role.schema';

export const ROLES_KEY = 'roles';

export const RequireRole = (...roles: RoleType[]) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    Reflector.createDecorator()(target, propertyName);
    Reflect.setMetadata(ROLES_KEY, roles, descriptor.value);
  };
};

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user?.role === role);
  }
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}

export const SuperAdminOnly = () => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    Reflect.setMetadata(ROLES_KEY, [RoleType.SUPER_ADMIN], descriptor.value);
  };
};

export const AdminOnly = () => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    Reflect.setMetadata(ROLES_KEY, [RoleType.SUPER_ADMIN, RoleType.ADMIN], descriptor.value);
  };
};
