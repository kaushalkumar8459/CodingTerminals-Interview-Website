import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsStore } from '../../core/store/settings.store';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  // ===== INJECT STORE AND SERVICES =====
  readonly settingsStore = inject(SettingsStore);
  private fb = inject(FormBuilder);

  // ===== LOCAL UI STATE =====
  settingsForm!: FormGroup;
  passwordForm!: FormGroup;
  submitted = false;
  showPasswordModal = false;
  passwordSubmitted = false;

  ngOnInit(): void {
    // Initialize settings from store (NO direct API call)
    this.settingsStore.initializeSettings();
    this.initSettingsForm();
    this.initPasswordForm();
  }

  /**
   * Initialize settings form with validators
   */
  private initSettingsForm(): void {
    this.settingsForm = this.fb.group({
      theme: ['light'],
      notifications: [true],
      emailNotifications: [true],
      twoFactorAuth: [false],
      dataCollection: [false]
    });

    // Auto-populate form with store settings
    const settings = this.settingsStore.settings();
    if (settings) {
      this.settingsForm.patchValue(settings);
    }

    // Handle notifications change - disable email notifications if notifications are off
    this.settingsForm.get('notifications')?.valueChanges.subscribe(value => {
      const emailNotificationsControl = this.settingsForm.get('emailNotifications');
      if (!value) {
        emailNotificationsControl?.disable();
        emailNotificationsControl?.setValue(false);
      } else {
        emailNotificationsControl?.enable();
      }
    });
  }

  /**
   * Initialize password change form
   */
  private initPasswordForm(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Validate that new password and confirm password match
   */
  private passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return newPassword && confirmPassword && newPassword !== confirmPassword
      ? { passwordMismatch: true }
      : null;
  }

  /**
   * Get loading state from store
   */
  get loading() {
    return this.settingsStore.isLoading();
  }

  /**
   * Get error state from store
   */
  get error() {
    return this.settingsStore.hasError() ? this.settingsStore.error() : null;
  }

  /**
   * Get success state from store
   */
  get success() {
    return this.settingsStore.hasSuccess() ? this.settingsStore.success() : null;
  }

  /**
   * Get email notifications disabled state from store
   */
  get emailNotificationsDisabled() {
    return this.settingsStore.emailNotificationsDisabled();
  }

  /**
   * Get success message from store
   */
  get successMessage() {
    return this.settingsStore.success();
  }

  /**
   * Get form controls
   */
  get f() {
    return this.settingsForm.controls;
  }

  /**
   * Get password form controls
   */
  get pf() {
    return this.passwordForm.controls;
  }

  /**
   * Submit settings form - Update all settings through store (NO direct API call)
   */
  async onSubmit(): Promise<void> {
    this.submitted = true;
    if (this.settingsForm.invalid) return;

    // Dispatch update action to store (NO direct API call)
    await this.settingsStore.updateAllSettings(this.settingsForm.getRawValue());
  }

  /**
   * Handle individual setting change (enable/disable)
   */
  async onSettingChange(fieldName: string, value: boolean): Promise<void> {
    // Dispatch individual setting update to store
    await this.settingsStore.updateSetting(fieldName as any, value);
    
    // Update form to reflect store state
    this.settingsForm.patchValue({
      [fieldName]: value
    });
  }

  /**
   * Handle theme change
   */
  async onThemeChange(theme: 'light' | 'dark'): Promise<void> {
    // Apply theme visually and to store
    this.settingsStore.applyTheme(theme);
    
    // Update form
    this.settingsForm.patchValue({ theme });
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.settingsForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched || this.submitted));
  }

  /**
   * Open password change modal
   */
  openPasswordModal(): void {
    this.showPasswordModal = true;
    this.passwordSubmitted = false;
    this.passwordForm.reset();
  }

  /**
   * Close password change modal
   */
  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.passwordForm.reset();
    this.passwordSubmitted = false;
  }

  /**
   * Change password - call store method
   */
  async changePassword(): Promise<void> {
    this.openPasswordModal();
  }

  /**
   * Submit password change form - through store (NO direct API call)
   */
  async onPasswordSubmit(): Promise<void> {
    this.passwordSubmitted = true;
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword } = this.passwordForm.value;
    
    // Dispatch password change to store (NO direct API call)
    await this.settingsStore.changePassword(currentPassword, newPassword);
    
    // Close modal on success if no error
    if (!this.settingsStore.hasError()) {
      setTimeout(() => {
        this.closePasswordModal();
      }, 1000);
    }
  }

  /**
   * Reset all settings to defaults - through store
   */
  async resetToDefaults(): Promise<void> {
    if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      return;
    }

    await this.settingsStore.resetSettings();
    
    // Update form with reset values
    this.settingsForm.patchValue(this.settingsStore.settings());
    this.submitted = false;
  }

  /**
   * Check if field is saving via store
   */
  isFieldSaving(fieldName: string): boolean {
    return this.settingsStore.isFieldSaving(fieldName);
  }
}
