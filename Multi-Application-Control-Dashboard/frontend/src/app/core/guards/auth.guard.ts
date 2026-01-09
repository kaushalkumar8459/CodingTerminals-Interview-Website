import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.authService.getToken();
    
    if (!token) {
      this.router.navigate(['/auth']);
      return false;
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const user = this.authService.getCurrentUser();
    
    if (!user || !requiredRoles.includes(user.role)) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ModuleAccessGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredModule = route.data['module'] as string;
    
    if (!requiredModule) {
      return true;
    }

    const user = this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/auth']);
      return false;
    }

    // Super admin has access to all modules
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Check if module is assigned
    const assignedModules = this.authService.getAssignedModules();
    if (assignedModules && assignedModules.includes(requiredModule)) {
      return true;
    }

    this.router.navigate(['/dashboard']);
    return false;
  }
}
