import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RoleType } from '../models/role.model';

/**
 * Structural directive to show/hide elements based on user roles
 * Usage: 
 * <div *appHasRole="['admin', 'super_admin']">Admin Content</div>
 * <button *appHasRole="['super_admin']">Super Admin Only</button>
 */
@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective {
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) { }

  @Input() set appHasRole(allowedRoles: RoleType[]) {
    this.updateView(allowedRoles);
  }

  private updateView(allowedRoles: RoleType[]): void {
    const currentUser = this.authService.getCurrentUser();
    const userHasRole = currentUser && allowedRoles.includes(currentUser.role as RoleType);
    
    if (userHasRole && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!userHasRole && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}