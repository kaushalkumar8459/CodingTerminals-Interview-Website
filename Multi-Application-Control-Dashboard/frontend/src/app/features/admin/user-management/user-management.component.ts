import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserStore } from '../../../core/store/user.store';
import { PermissionService } from '../../../core/services/permission.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  // ===== INJECT STORE AND SERVICES =====
  userStore = inject(UserStore);
  private permissionService = inject(PermissionService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  // ===== LOCAL UI STATE (not in store) =====
  showUserForm = false;
  isEditingUser = false;
  userToDelete: any = null;
  showDeleteConfirm = false;
  userToEdit: any = null;
  showModuleAssignment = false;
  selectedUserForModules: any = null;
  availableModules = ['Blog', 'YouTube', 'LinkedIn', 'Study Notes'];
  userModules: string[] = [];
  searchQuery = '';

  // ===== FORM =====
  userForm: FormGroup;

  // ===== CONFIG =====
  roles = ['SUPER_ADMIN', 'ADMIN', 'VIEWER'];
  statusOptions = ['Active', 'Inactive', 'Suspended'];

  constructor() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['VIEWER', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load users from store on component init
    this.userStore.loadUsers();
  }

  // ===== USER FORM ACTIONS =====

  openCreateForm(): void {
    this.isEditingUser = false;
    this.userToEdit = null;
    this.userForm.reset({ role: 'VIEWER', status: 'Active' });
    this.showUserForm = true;
  }

  openEditForm(user: any): void {
    this.isEditingUser = true;
    this.userToEdit = user;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    this.showUserForm = true;
  }

  closeForm(): void {
    this.showUserForm = false;
    this.userForm.reset();
    this.userToEdit = null;
    this.isEditingUser = false;
  }

  saveUser(): void {
    if (this.userForm.invalid) return;

    const formValue = this.userForm.value;

    if (this.isEditingUser && this.userToEdit) {
      // Update user through store (NO direct API call)
      this.userStore.updateUser(this.userToEdit.id, formValue);
    } else {
      // Create new user through store (NO direct API call)
      this.userStore.createUser(formValue);
    }

    this.closeForm();
  }

  // ===== DELETE ACTIONS =====

  confirmDelete(user: any): void {
    this.userToDelete = user;
    this.showDeleteConfirm = true;
  }

  deleteUser(): void {
    if (!this.userToDelete) return;
    // Delete through store (NO direct API call)
    this.userStore.deleteUser(this.userToDelete.id);
    this.cancelDelete();
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.userToDelete = null;
  }

  // ===== MODULE ASSIGNMENT ACTIONS =====

  openModuleAssignment(user: any): void {
    this.selectedUserForModules = user;
    this.userModules = user.modules || [];
    this.showModuleAssignment = true;
  }

  saveModuleAssignment(): void {
    if (!this.selectedUserForModules) return;
    // Assign modules through store (NO direct API call)
    this.userStore.assignModules(this.selectedUserForModules.id, this.userModules);
    this.closeModuleAssignment();
  }

  closeModuleAssignment(): void {
    this.showModuleAssignment = false;
    this.selectedUserForModules = null;
    this.userModules = [];
  }

  toggleModule(module: string): void {
    const index = this.userModules.indexOf(module);
    if (index > -1) {
      this.userModules.splice(index, 1);
    } else {
      this.userModules.push(module);
    }
  }

  // ===== FILTER/SEARCH ACTIONS =====

  onSearch(): void {
    // Dispatch search action to store (NO direct API call)
    this.userStore.searchUsers(this.userStore.searchQuery());
  }

  filterByRole(role: string): void {
    // Dispatch filter action to store (NO direct API call)
    this.userStore.filterByRole(role);
  }

  filterByStatus(status: string): void {
    // Dispatch filter action to store (NO direct API call)
    this.userStore.filterByStatus(status);
  }

  clearFilters(): void {
    // Dispatch clear filters action to store (NO direct API call)
    this.userStore.clearFilters();
  }

  // ===== PAGINATION ACTIONS =====

  goToPage(page: number): void {
    // Dispatch pagination action to store (NO direct API call)
    this.userStore.goToPage(page);
  }

  previousPage(): void {
    this.userStore.previousPage();
  }

  nextPage(): void {
    this.userStore.nextPage();
  }

  // ===== UI HELPERS =====

  getRoleBadgeClass(role: string): string {
    const baseClass = 'px-3 py-1 rounded-full text-sm font-semibold';
    switch (role) {
      case 'SUPER_ADMIN':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'ADMIN':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case 'VIEWER':
        return `${baseClass} bg-gray-100 text-gray-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  getStatusBadgeClass(status: string): string {
    const baseClass = 'px-3 py-1 rounded-full text-sm font-semibold';
    switch (status) {
      case 'Active':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'Inactive':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'Suspended':
        return `${baseClass} bg-red-100 text-red-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  get isSuperAdmin(): boolean {
    return this.permissionService.canManageUsers();
  }

  // ===== EXPOSED STORE SIGNALS FOR TEMPLATE =====

  /**
   * Get users list from store
   */
  get users() {
    return this.userStore.users();
  }

  /**
   * Get loading state from store
   */
  get loading() {
    return this.userStore.isLoading();
  }

  /**
   * Get error state from store
   */
  get error() {
    return this.userStore.error();
  }

  /**
   * Get success state from store
   */
  get success() {
    return this.userStore.success();
  }

  /**
   * Get current page from store
   */
  get currentPage() {
    return this.userStore.currentPage();
  }

  /**
   * Get total pages from store
   */
  get totalPages() {
    return this.userStore.totalPages();
  }

  /**
   * Get selected role filter from store
   */
  get selectedRole() {
    return this.userStore.selectedRole();
  }

  /**
   * Get selected status filter from store
   */
  get selectedStatus() {
    return this.userStore.selectedStatus();
  }

  /**
   * Get total users count
   */
  get totalUsers() {
    return this.userStore.users().length;
  }

  getPageNumbers(): number[] {
    return this.userStore.getPageNumbers();
  }
}
