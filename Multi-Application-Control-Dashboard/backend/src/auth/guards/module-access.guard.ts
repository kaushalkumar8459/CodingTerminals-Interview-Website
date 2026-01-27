import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(private requiredModule: string) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Super Admin has access to all modules
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Check if module is assigned to user
    if (!user.assignedModules || !user.assignedModules.includes(this.requiredModule)) {
      throw new ForbiddenException(`Access to ${this.requiredModule} module denied`);
    }

    return true;
  }
}
