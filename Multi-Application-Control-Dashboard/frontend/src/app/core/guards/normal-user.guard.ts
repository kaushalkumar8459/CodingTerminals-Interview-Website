import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleType } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class NormalUserGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Check if user is a Normal User
    if (user.role === RoleType.NORMAL_USER) {
      // For certain routes that Normal Users should be redirected from to their dashboard
      // We'll allow access to profile and settings but potentially redirect from other areas
      const currentRoute = state.url;

      // If trying to access admin-like areas but they're a normal user, redirect appropriately
      if (currentRoute.startsWith('/admin')) {
        // Normal users shouldn't access admin areas
        this.router.navigate(['/access-denied']);
        return false;
      }

      // Allow access to profile and settings
      if (currentRoute === '/profile' || currentRoute === '/settings') {
        return true;
      }

      // For content modules, Normal Users might need special handling
      // But generally, they should only see public content or be redirected to their personal dashboard
      // when trying to perform admin-like actions
      
      // Allow dashboard access for Normal Users
      if (currentRoute === '/dashboard') {
        return true;
      }

      // Allow access to public content areas but restrict editing
      return true;
    }

    // For other roles, allow normal flow
    return true;
  }
}