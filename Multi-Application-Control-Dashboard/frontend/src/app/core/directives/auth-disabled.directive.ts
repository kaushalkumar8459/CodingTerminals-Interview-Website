import { Directive, Input, ElementRef, Renderer2 } from '@angular/core';
import { PermissionService } from '../services/permission.service';

/**
 * Attribute directive to disable elements based on permissions
 * Usage: 
 * <button appAuthDisabled="Blog" action="create">Create Post</button>
 * <input appAuthDisabled="Profile" action="edit" />
 */
@Directive({
  selector: '[appAuthDisabled]'
})
export class AuthDisabledDirective {
  private module: string = '';
  private action: string = 'view';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private permissionService: PermissionService
  ) { }

  @Input() set appAuthDisabled(module: string) {
    this.module = module;
    this.updateElementState();
  }

  @Input() set appAuthDisabledAction(action: string) {
    this.action = action;
    this.updateElementState();
  }

  private updateElementState(): void {
    if (this.module) {
      const hasPermission = this.permissionService.hasPermission(this.module, this.action);
      
      if (hasPermission) {
        this.renderer.removeAttribute(this.el.nativeElement, 'disabled');
        this.renderer.removeClass(this.el.nativeElement, 'cursor-not-allowed');
        this.renderer.removeClass(this.el.nativeElement, 'opacity-50');
      } else {
        this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');
        this.renderer.addClass(this.el.nativeElement, 'cursor-not-allowed');
        this.renderer.addClass(this.el.nativeElement, 'opacity-50');
      }
    }
  }
}