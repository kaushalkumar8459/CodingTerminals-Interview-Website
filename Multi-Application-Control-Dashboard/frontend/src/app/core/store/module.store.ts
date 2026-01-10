import { Injectable, inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { ModuleService, SystemModule, ModulesResponse, ModuleUpdate } from '../services/module.service';
import { firstValueFrom } from 'rxjs';

export interface ModuleWithUI extends SystemModule {
  hasChanges?: boolean;
  previousEnabled?: boolean;
}

export interface ModuleState {
  modules: ModuleWithUI[];
  loading: boolean;
  error: string | null;
  success: string | null;
  isSaving: boolean;
}

const initialState: ModuleState = {
  modules: [],
  loading: false,
  error: null,
  success: null,
  isSaving: false
};

@Injectable({
  providedIn: 'root'
})
export class ModuleStore extends signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    activeModulesCount: computed(() => state.modules().filter((m: ModuleWithUI) => m.enabled).length),
    changedModulesCount: computed(() => state.modules().filter((m: ModuleWithUI) => m.hasChanges).length),
    hasChanges: computed(() => state.modules().some((m: ModuleWithUI) => m.hasChanges)),
    isLoading: computed(() => state.loading()),
    isSavingState: computed(() => state.isSaving()),
    totalModules: computed(() => state.modules().length),
    totalActiveUsers: computed(() => 
      state.modules().reduce((sum, m: ModuleWithUI) => sum + (m.usersCount || 0), 0)
    ),
    isEmpty: computed(() => state.modules().length === 0 && !state.loading())
  })),
  withMethods((store, moduleService = inject(ModuleService)) => ({
    // ===== PUBLIC ACTIONS (called from components) =====

    /**
     * Load all modules - ASYNC
     */
    async loadModules(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const response = await firstValueFrom(moduleService.getModules());
        const modules = (response.data || response as any || []).map((m: any) => ({
          ...m,
          hasChanges: false,
          previousEnabled: m.enabled
        }));
        patchState(store, {
          modules,
          loading: false,
          error: null
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load modules',
          loading: false
        });
        console.error('ModuleStore: Error loading modules', err);
      }
    },

    /**
     * Toggle module enabled/disabled
     */
    toggleModule(module: ModuleWithUI): void {
      const updatedModules = (store as any)['modules']().map((m: ModuleWithUI) =>
        m.id === module.id
          ? {
              ...m,
              enabled: !m.enabled,
              hasChanges: !m.enabled !== m.previousEnabled
            }
          : m
      );
      patchState(store, { modules: updatedModules });
    },

    /**
     * Save all module changes to backend - ASYNC
     */
    async saveModuleChanges(): Promise<void> {
      const changedModules = (store as any)['modules']().filter((m: ModuleWithUI) => m.hasChanges);

      if (changedModules.length === 0) {
        patchState(store, { error: 'No changes to save' });
        return;
      }

      patchState(store, { isSaving: true, error: null });

      const updates: ModuleUpdate[] = changedModules.map((m: ModuleWithUI) => ({
        id: m.id,
        enabled: m.enabled
      }));

      try {
        await firstValueFrom(moduleService.updateModules(updates));
        patchState(store, {
          success: 'Module settings saved successfully!',
          isSaving: false,
          error: null
        });

        // Update previous state to current state
        const updatedModules = (store as any)['modules']().map((m: ModuleWithUI) => ({
          ...m,
          previousEnabled: m.enabled,
          hasChanges: false
        }));
        patchState(store, { modules: updatedModules });

        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to save module settings',
          isSaving: false
        });
        console.error('ModuleStore: Error saving modules', err);

        // Revert changes on error
        const revertedModules = (store as any)['modules']().map((m: ModuleWithUI) =>
          m.hasChanges
            ? {
                ...m,
                enabled: m.previousEnabled || false,
                hasChanges: false
              }
            : m
        );
        patchState(store, { modules: revertedModules });
      }
    },

    /**
     * Reset all changes (revert to previous state)
     */
    resetChanges(): void {
      const resetModules = (store as any)['modules']().map((m: ModuleWithUI) => ({
        ...m,
        enabled: m.previousEnabled || false,
        hasChanges: false
      }));
      patchState(store, { modules: resetModules, error: null });
    },

    /**
     * Check if specific module is enabled
     */
    isModuleEnabled(moduleName: string): boolean {
      return (store as any)['modules']().some((m: ModuleWithUI) => m.name === moduleName && m.enabled);
    },

    /**
     * Get enabled modules only
     */
    getEnabledModules(): ModuleWithUI[] {
      return (store as any)['modules']().filter((m: ModuleWithUI) => m.enabled);
    }
  }))
) {
  // ===== METHOD TYPE DECLARATIONS =====
  override loadModules!: () => Promise<void>;
  override toggleModule!: (module: ModuleWithUI) => void;
  override saveModuleChanges!: () => Promise<void>;
  override resetChanges!: () => void;
  override isModuleEnabled!: (moduleName: string) => boolean;
  override getEnabledModules!: () => ModuleWithUI[];
}
