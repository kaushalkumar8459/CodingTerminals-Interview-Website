import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModuleStore } from '../../../core/store/module.store';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-module-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './module-settings.component.html',
  styleUrls: ['./module-settings.component.scss']
})
export class ModuleSettingsComponent implements OnInit {
  // ===== INJECT STORE AND SERVICES =====
  readonly moduleStore = inject(ModuleStore);
  private permissionService = inject(PermissionService);

  ngOnInit(): void {
    // Load modules from store on component init
    this.moduleStore['loadModules']();
  }

  // ===== EXPOSED STORE SIGNALS FOR TEMPLATE =====

  /**
   * Get modules list from store
   */
  get modules() {
    return this.moduleStore.modules();
  }

  /**
   * Get loading state from store
   */
  get loading() {
    return this.moduleStore.isLoading();
  }

  /**
   * Get error state from store
   */
  get error() {
    return this.moduleStore.error();
  }

  /**
   * Get success state from store
   */
  get success() {
    return this.moduleStore.success();
  }

  /**
   * Get isSaving state from store
   */
  get isSaving() {
    return this.moduleStore.isSavingState();
  }

  /**
   * Get active modules count from store
   */
  get activeModulesCount() {
    return this.moduleStore.activeModulesCount();
  }

  /**
   * Get changed modules count from store
   */
  get changedModulesCount() {
    return this.moduleStore.changedModulesCount();
  }

  /**
   * Get has changes flag from store
   */
  get hasChanges() {
    return this.moduleStore.hasChanges();
  }

  // ===== MODULE ACTIONS =====

  /**
   * Toggle module enabled/disabled state
   * Dispatches action to store (NO direct API call)
   */
  toggleModule(module: any): void {
    this.moduleStore['toggleModule'](module);
  }

  /**
   * Save all module changes to backend
   * Dispatches action to store (NO direct API call)
   */
  saveModuleChanges(): void {
    this.moduleStore['saveModuleChanges']();
  }

  /**
   * Reset all changes back to previous state
   * Dispatches action to store (NO direct API call)
   */
  resetChanges(): void {
    this.moduleStore['resetChanges']();
  }

  // ===== UI HELPERS =====

  /**
   * Get module icon emoji
   */
  getModuleIcon(name: string): string {
    const icons: { [key: string]: string } = {
      'Blog': '✍️',
      'YouTube': '📺',
      'LinkedIn': '💼',
      'Study Notes': '📚',
      'admin': '⚙️',
      'default': '📦'
    };
    return icons[name] || icons['default'];
  }

  /**
   * Get status badge CSS classes
   */
  getStatusBadgeClass(enabled: boolean): string {
    const baseClass = 'px-3 py-1 rounded-full text-sm font-semibold';
    return enabled
      ? `${baseClass} bg-green-100 text-green-800`
      : `${baseClass} bg-red-100 text-red-800`;
  }

  /**
   * Check if user is admin (using available method)
   */
  get isSuperAdmin(): boolean {
    return this.permissionService.canEdit();
  }
}
