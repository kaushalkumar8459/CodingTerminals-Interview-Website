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
