import { Injectable, inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export interface SettingsPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  emailNotifications: boolean;
  twoFactorAuth: boolean;
  dataCollection: boolean;
}

export interface SettingsState {
  settings: SettingsPreferences;
  loading: boolean;
  error: string | null;
  success: string | null;
  savingField: string | null; // Track which field is being saved
  lastUpdated: Date | null;
}

const initialState: SettingsState = {
  settings: {
    theme: 'light',
    notifications: true,
    emailNotifications: true,
    twoFactorAuth: false,
    dataCollection: false
  },
  loading: false,
  error: null,
  success: null,
  savingField: null,
  lastUpdated: null
};

@Injectable({
  providedIn: 'root'
})
export class SettingsStore extends signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    // ===== STATE ACCESSORS =====
    settings: computed(() => state.settings()),
    error: computed(() => state.error()),
    success: computed(() => state.success()),
    
    // ===== LOADING & UI STATES =====
    isLoading: computed(() => state.loading()),
    hasError: computed(() => state.error() !== null),
    hasSuccess: computed(() => state.success() !== null),
    
    // ===== FIELD-SPECIFIC LOADING =====
    isSavingField: computed(() => state.savingField() !== null),
    savingFieldName: computed(() => state.savingField() || ''),
    
    // ===== SETTINGS STATE EXTRACTION =====
    theme: computed(() => state.settings().theme),
    notificationsEnabled: computed(() => state.settings().notifications),
    emailNotificationsEnabled: computed(() => state.settings().emailNotifications),
    twoFactorAuthEnabled: computed(() => state.settings().twoFactorAuth),
    dataCollectionEnabled: computed(() => state.settings().dataCollection),
    
    // ===== DERIVED LOGIC =====
    canEmailNotify: computed(() => {
      // Can only enable email notifications if in-app notifications are enabled
      return state.settings().notifications;
    }),
    emailNotificationsDisabled: computed(() => {
      // Email notifications field should be disabled if in-app notifications are off
      return !state.settings().notifications;
    }),
    twoFactorAvailable: computed(() => {
      // 2FA should only be available for super_admin or admin roles
      return true; // Extend this with role checking if needed
    }),
    
    // ===== TIMESTAMP =====
    lastUpdatedTime: computed(() => state.lastUpdated()),
    isDataFresh: computed(() => {
      if (!state.lastUpdated()) return false;
      const now = new Date();
      const diff = now.getTime() - state.lastUpdated()!.getTime();
      return diff < 300000; // Less than 5 minutes
    })
  })),
  withMethods((store) => ({
    // ===== PUBLIC ACTIONS (called from components) =====

    /**
     * Initialize settings from localStorage - ASYNC
     */
    async initializeSettings(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          patchState(store, {
            settings,
            loading: false,
            error: null,
            lastUpdated: new Date()
          });
        } else {
          patchState(store, {
            loading: false,
            error: null,
            lastUpdated: new Date()
          });
        }
      } catch (err: any) {
        patchState(store, {
          error: err?.message ?? 'Failed to load settings',
          loading: false
        });
        console.error('SettingsStore: Error initializing settings', err);
      }
    },

    /**
     * Load settings from API - ASYNC
     */
    async loadSettings(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        // Simulate API call to fetch settings
        // In real implementation, inject SettingsService and call API
        const currentSettings = store.settings();
        patchState(store, {
          settings: currentSettings,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load settings',
          loading: false
        });
        console.error('SettingsStore: Error loading settings', err);
      }
    },

    /**
     * Update specific setting - ASYNC
     */
    async updateSetting(fieldName: keyof SettingsPreferences, value: any): Promise<void> {
      patchState(store, { savingField: fieldName, error: null });
      try {
        // Get current settings
        const currentSettings = store.settings();
        
        // Handle conditional logic for dependent settings
        if (fieldName === 'notifications' && !value) {
          // If disabling in-app notifications, also disable email notifications
          const updatedSettings = {
            ...currentSettings,
            [fieldName]: value,
            emailNotifications: false
          };
          
          patchState(store, {
            settings: updatedSettings,
            success: `${fieldName} updated successfully!`,
            error: null,
            savingField: null,
            lastUpdated: new Date()
          });
          
          // Persist to localStorage
          localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
        } else {
          // Regular update
          const updatedSettings = {
            ...currentSettings,
            [fieldName]: value
          };
          
          patchState(store, {
            settings: updatedSettings,
            success: `${fieldName} updated successfully!`,
            error: null,
            savingField: null,
            lastUpdated: new Date()
          });
          
          // Persist to localStorage
          localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
        }
        
        // Auto-clear success message
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to update setting',
          savingField: null
        });
        console.error('SettingsStore: Error updating setting', err);
      }
    },

    /**
     * Update all settings - ASYNC
     */
    async updateAllSettings(settings: SettingsPreferences): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        // Validate dependent settings
        let validatedSettings = { ...settings };
        
        // If notifications disabled, disable email notifications
        if (!settings.notifications) {
          validatedSettings.emailNotifications = false;
        }
        
        patchState(store, {
          settings: validatedSettings,
          success: 'All settings updated successfully!',
          error: null,
          loading: false,
          lastUpdated: new Date()
        });
        
        // Persist to localStorage
        localStorage.setItem('userSettings', JSON.stringify(validatedSettings));
        
        // Auto-clear success message
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to update all settings',
          loading: false
        });
        console.error('SettingsStore: Error updating all settings', err);
      }
    },

    /**
     * Reset settings to defaults - ASYNC
     */
    async resetSettings(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        patchState(store, {
          settings: initialState.settings,
          success: 'Settings reset to defaults',
          error: null,
          loading: false,
          lastUpdated: new Date()
        });
        
        // Clear localStorage
        localStorage.removeItem('userSettings');
        
        // Auto-clear success message
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to reset settings',
          loading: false
        });
        console.error('SettingsStore: Error resetting settings', err);
      }
    },

    /**
     * Apply theme setting - SYNC
     */
    applyTheme(theme: 'light' | 'dark'): void {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Update store
      const updatedSettings = {
        ...store.settings(),
        theme
      };
      patchState(store, { settings: updatedSettings });
      localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
    },

    /**
     * Change password - ASYNC
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        // TODO: Call API endpoint to change password
        // const authService = inject(AuthService);
        // await firstValueFrom(authService.changePassword(currentPassword, newPassword));
        
        patchState(store, {
          success: 'Password changed successfully!',
          error: null,
          loading: false
        });
        
        // Auto-clear success message
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to change password',
          loading: false
        });
        console.error('SettingsStore: Error changing password', err);
      }
    },

    /**
     * Enable/disable setting by field name - ASYNC
     */
    async toggleSetting(fieldName: keyof SettingsPreferences): Promise<void> {
      const currentValue = (store.settings() as any)[fieldName];
      const newValue = typeof currentValue === 'boolean' ? !currentValue : currentValue;
      
      await (store as any)['updateSetting'](fieldName, newValue);
    },

    /**
     * Get setting value by field name
     */
    getSetting(fieldName: keyof SettingsPreferences): any {
      return (store.settings() as any)[fieldName];
    },

    /**
     * Check if setting is enabled
     */
    isSettingEnabled(fieldName: keyof SettingsPreferences): boolean {
      const value = (store.settings() as any)[fieldName];
      return typeof value === 'boolean' ? value : false;
    },

    /**
     * Clear error message
     */
    clearError(): void {
      patchState(store, { error: null });
    },

    /**
     * Clear success message
     */
    clearSuccess(): void {
      patchState(store, { success: null });
    },

    /**
     * Check if field is saving
     */
    isFieldSaving(fieldName: string): boolean {
      return store.savingFieldName() === fieldName;
    }
  }))
) {
  // ===== METHOD TYPE DECLARATIONS =====
  // These methods are automatically created by signalStore with withMethods
  override initializeSettings!: () => Promise<void>;
  override loadSettings!: () => Promise<void>;
  override updateSetting!: (fieldName: keyof SettingsPreferences, value: any) => Promise<void>;
  override updateAllSettings!: (settings: SettingsPreferences) => Promise<void>;
  override resetSettings!: () => Promise<void>;
  override applyTheme!: (theme: 'light' | 'dark') => void;
  override changePassword!: (currentPassword: string, newPassword: string) => Promise<void>;
  override toggleSetting!: (fieldName: keyof SettingsPreferences) => Promise<void>;
  override getSetting!: (fieldName: keyof SettingsPreferences) => any;
  override isSettingEnabled!: (fieldName: keyof SettingsPreferences) => boolean;
  override clearError!: () => void;
  override clearSuccess!: () => void;
  override isFieldSaving!: (fieldName: string) => boolean;
}
