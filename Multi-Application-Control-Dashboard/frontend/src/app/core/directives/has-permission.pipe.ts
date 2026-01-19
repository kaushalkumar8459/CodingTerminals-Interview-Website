import { Pipe, PipeTransform } from '@angular/core';
import { PermissionService } from '../services/permission.service';

/**
 * Pipe to check if user has specific permission
 * Usage: 
 * <button [disabled]="!('Blog' | hasPermission:'create')">Create Post</button>
 * <div *ngIf="'Profile' | hasPermission:'edit'">Editable Profile Section</div>
 */
@Pipe({
  name: 'hasPermission',
  standalone: true
})
export class HasPermissionPipe implements PipeTransform {
  constructor(private permissionService: PermissionService) { }

  transform(module: string, action: string = 'view'): boolean {
    return this.permissionService.hasPermission(module, action);
  }
}