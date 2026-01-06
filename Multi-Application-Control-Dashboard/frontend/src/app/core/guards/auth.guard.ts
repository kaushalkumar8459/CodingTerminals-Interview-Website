import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('access_token');
    
    if (!token || !this.authService.isTokenValid(token)) {
      this.router.navigate(['/login']);
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

    const user = this.authService.getCurrentUserSync();
    
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

    const user = this.authService.getCurrentUserSync();
    
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    // Super admin has access to all modules
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Check if module is assigned
    if (user.assignedModules && user.assignedModules.includes(requiredModule)) {
      return true;
    }

    this.router.navigate(['/dashboard']);
    return false;
  }
}
