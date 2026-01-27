import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService, User } from '../services/auth.service';
import { ModuleService } from '../services/module.service';
import { RoleType } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
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

    // Check for Normal User specific behavior
    // If a Normal User tries to access certain content creation/editing routes,
    // they might need to be redirected to a personal dashboard
    if (user.role === RoleType.NORMAL_USER) {
      const currentRoute = state.url;
      
      // Check if this is a content editing route that should redirect Normal Users
      const contentEditRoutes = ['/blog', '/youtube', '/linkedin', '/study-notes'];
      const isContentRoute = contentEditRoutes.some(route => currentRoute.startsWith(route));
      
      // If accessing content routes but not for viewing purposes, redirect or deny
      if (isContentRoute && !currentRoute.includes('view') && !currentRoute.includes('read')) {
        // For Normal Users, redirect to a personal dashboard or deny access
        // Since Normal Users should have limited content creation rights
        this.router.navigate(['/dashboard']); // Redirect to dashboard instead of content creation
        return false;
      }
    }

    // Super admin bypasses all role checks
    if (user.role === RoleType.SUPER_ADMIN) {
      return true;
    }

    // Check if route requires specific roles
    const requiredRoles: RoleType[] = route.data['roles'];
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (this.hasRequiredRole(user, requiredRoles)) {
      return true;
    }

    // User doesn't have required role
    this.router.navigate(['/access-denied']);
    return false;
  }

  /**
   * Check if user has one of the required roles
   */
  private hasRequiredRole(user: User, requiredRoles: RoleType[]): boolean {
    return requiredRoles.includes(user.role);
  }
}

@Injectable({
  providedIn: 'root'
})
export class ModuleGuard implements CanActivate {
  // ✅ Cache module access to avoid repeated API calls
  private moduleAccessCache = new Map<string, boolean>();
  private cacheExpiry = new Map<string, number>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(
    private authService: AuthService,
    private moduleService: ModuleService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Check if route requires specific module access
    const requiredModule: string = route.data['module'];
    if (!requiredModule) {
      return true;
    }

    // Super admins have access to all modules
    if (user.role === RoleType.SUPER_ADMIN) {
      return true;
    }

    // Special handling for Normal Users
    if (user.role === RoleType.NORMAL_USER) {
      // Normal Users have limited access - they can only access their profile/settings
      // For content modules, they might need special handling
      if (['Blog', 'YouTube', 'LinkedIn', 'Study Notes'].includes(requiredModule)) {
        // For content modules, Normal Users should typically not have access
        // unless they have specific permissions (which they normally don't)
        this.router.navigate(['/dashboard']);
        return false;
      }
    }

    // ✅ Check cache first
    const cacheKey = `${user.id}:${requiredModule}`;
    if (this.isCacheValid(cacheKey)) {
      const cachedAccess = this.moduleAccessCache.get(cacheKey);
      if (cachedAccess) {
        return true;
      }
      this.router.navigate(['/access-denied']);
      return false;
    }

    // ✅ Only call API if cache miss or expired
    return this.moduleService.hasModuleAccess(user.id, requiredModule)
      .pipe(
        map(hasAccess => {
          // ✅ Cache the result
          this.setCache(cacheKey, hasAccess);

          if (hasAccess) {
            return true;
          }
          this.router.navigate(['/access-denied']);
          return false;
        })
      );
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry) {
      return false;
    }
    return Date.now() < expiry;
  }

  /**
   * Set cache with expiry
   */
  private setCache(key: string, value: boolean): void {
    this.moduleAccessCache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  /**
   * Clear cache (call after login/logout)
   */
  public clearCache(): void {
    this.moduleAccessCache.clear();
    this.cacheExpiry.clear();
  }
}

@Injectable({
  providedIn: 'root'
})
export class NormalUserRedirectGuard implements CanActivate {
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

    // If user is a Normal User and is trying to access admin-like functionality,
    // redirect them to their personal dashboard
    if (user.role === RoleType.NORMAL_USER) {
      const currentPath = state.url;
      
      // If trying to edit profile or update personal details, allow access to profile route
      if (currentPath.includes('/edit-profile') || currentPath.includes('/account-settings')) {
        return true; // Allow access to profile editing
      }
      
      // For other admin-like routes, redirect to dashboard
      if (currentPath.includes('/admin') || currentPath.includes('/manage')) {
        this.router.navigate(['/dashboard']);
        return false;
      }
    }

    return true;
  }
}