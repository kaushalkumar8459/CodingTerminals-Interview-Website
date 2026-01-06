import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private requiredRoles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (!this.requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

export function Roles(...roles: string[]) {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    const guard = new RolesGuard(roles);
    if (descriptor) {
      const originalMethod = descriptor.value;
      descriptor.value = function (...args: any[]) {
        if (guard.canActivate(args[0])) {
          return originalMethod.apply(this, args);
        }
      };
    }
    return target;
  };
}
