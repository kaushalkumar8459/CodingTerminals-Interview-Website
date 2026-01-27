import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionService } from '../services/permission.service';

/**
 * Structural directive to show/hide elements based on user permissions
 * Usage: 
 * <button *appHasPermission="'Blog'">Create Post</button>
 * <div *appHasPermission="'YouTube'; action: 'edit'">Edit Content</div>
 */
@Directive({
  selector: '[appHasPermission]'
})
export class HasPermissionDirective {
  private hasView = false;
  private currentModule: string = '';
  private currentAction: string = 'view';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) { }

  @Input() set appHasPermission(module: string) {
    this.currentModule = module;
    this.updateView();
  }

  @Input() set appHasPermissionAction(action: string) {
    this.currentAction = action;
    this.updateView();
  }

  private updateView(): void {
    if (!this.currentModule) return;

    const hasPermission = this.permissionService.hasPermission(this.currentModule, this.currentAction);
    
    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}