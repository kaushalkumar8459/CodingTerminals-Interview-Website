import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileStore } from '../../core/store/profile.store';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  // ===== INJECT STORE AND SERVICES =====
  readonly profileStore = inject(ProfileStore);
  private fb = inject(FormBuilder);

  // ===== LOCAL UI STATE =====
  profileForm!: FormGroup;
  submitted = false;

  ngOnInit(): void {
    // Initialize profile from store (NO direct API call)
    this.profileStore.initializeProfile();
    this.initForm();
  }

  /**
   * Initialize form with validators
   */
  private initForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]]
    });

    // Auto-populate form with current user data from store
    const currentUser = this.profileStore.currentUser();
    if (currentUser) {
      this.profileForm.patchValue({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        username: currentUser.username
      });
    }
  }

  /**
   * Get loading state from store
   */
  get loading() {
    return this.profileStore.isLoading();
  }

  /**
   * Get error state from store
   */
  get error() {
    return this.profileStore.hasError() ? this.profileStore.error() : null;
  }

  /**
   * Get success state from store
   */
  get success() {
    return this.profileStore.hasSuccess() ? this.profileStore.success() : null;
  }

  /**
   * Get success message from store
   */
  get successMessage() {
    return this.profileStore.success();
  }

  /**
   * Get current user from store
   */
  get currentUser() {
    return this.profileStore.currentUser();
  }

  /**
   * Get user full name from store
   */
  get userFullName() {
    return this.profileStore.userFullName();
  }

  /**
   * Get user role from store
   */
  get userRole() {
    return this.profileStore.userRole();
  }

  /**
   * Submit form - Update profile through store (NO direct API call)
   */
  async onSubmit(): Promise<void> {
    this.submitted = true;
    if (this.profileForm.invalid) return;

    // Dispatch update action to store (NO direct API call)
    await this.profileStore.updateProfile(this.profileForm.value);
  }

  /**
   * Get form controls for template
   */
  get f() {
    return this.profileForm.controls;
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched || this.submitted));
  }

  /**
   * Format last login date
   */
  formatLastLogin(date: Date | undefined): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  }

  /**
   * Get role badge color
   */
  getRoleBadgeClass(role: string | undefined): string {
    const baseClass = 'px-3 py-1 rounded-full text-sm font-semibold';
    switch (role) {
      case 'super_admin':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'admin':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case 'viewer':
        return `${baseClass} bg-gray-100 text-gray-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  /**
   * Get role display text
   */
  getRoleDisplayText(role: string | undefined): string {
    switch (role) {
      case 'super_admin':
        return '🔴 Super Admin';
      case 'admin':
        return '🔵 Admin';
      case 'viewer':
        return '⚪ Viewer';
      default:
        return 'User';
    }
  }
}
