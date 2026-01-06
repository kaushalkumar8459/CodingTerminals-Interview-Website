import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserManagementService, User } from '../../../core/services/user-management.service';
import { ModuleSettingsService, Module } from '../../../core/services/module-settings.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserManagementService);
  private moduleService = inject(ModuleSettingsService);
  private fb = inject(FormBuilder);

  users$: Observable<User[]>;
  modules$: Observable<Module[]>;
  userForm: FormGroup;
  selectedUser: User | null = null;
  isFormVisible = false;
  isEditing = false;
  filter: 'all' | 'active' | 'inactive' | 'suspended' = 'all';
  filteredUsers: User[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;
  searchQuery = '';

  constructor() {
    this.users$ = this.userService.users$;
    this.modules$ = this.moduleService.modules$;
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['user', Validators.required],
      status: ['active', Validators.required],
      assignedModules: [[]],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe(
      () => {
        this.applyFilter();
        this.loading = false;
      },
      (error) => {
        this.error = 'Failed to load users';
        this.loading = false;
      }
    );
  }

  openForm(user?: User): void {
    if (user) {
      this.isEditing = true;
      this.selectedUser = user;
      this.userForm.patchValue(user);
    } else {
      this.isEditing = false;
      this.selectedUser = null;
      this.userForm.reset({ role: 'user', status: 'active', assignedModules: [] });
    }
    this.isFormVisible = true;
  }

  closeForm(): void {
    this.isFormVisible = false;
    this.userForm.reset();
    this.selectedUser = null;
  }

  saveUser(): void {
    if (this.userForm.invalid) return;

    const userData: User = this.userForm.value;

    if (this.isEditing && this.selectedUser?.id) {
      this.userService.updateUser(this.selectedUser.id, userData).subscribe(
        () => {
          this.success = 'User updated successfully';
          this.closeForm();
          this.applyFilter();
          setTimeout(() => (this.success = null), 3000);
        },
        (error) => {
          this.error = 'Failed to update user';
        }
      );
    } else {
      this.userService.createUser(userData).subscribe(
        () => {
          this.success = 'User created successfully';
          this.closeForm();
          this.applyFilter();
          setTimeout(() => (this.success = null), 3000);
        },
        (error) => {
          this.error = 'Failed to create user';
        }
      );
    }
  }

  deleteUser(id: string, name: string): void {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      this.userService.deleteUser(id).subscribe(
        () => {
          this.success = 'User deleted successfully';
          this.applyFilter();
          setTimeout(() => (this.success = null), 3000);
        },
        (error) => {
          this.error = 'Failed to delete user';
        }
      );
    }
  }

  deactivateUser(id: string): void {
    this.userService.deactivateUser(id).subscribe(
      () => {
        this.success = 'User deactivated successfully';
        this.loadUsers();
        setTimeout(() => (this.success = null), 3000);
      },
      (error) => {
        this.error = 'Failed to deactivate user';
      }
    );
  }

  activateUser(id: string): void {
    this.userService.activateUser(id).subscribe(
      () => {
        this.success = 'User activated successfully';
        this.loadUsers();
        setTimeout(() => (this.success = null), 3000);
      },
      (error) => {
        this.error = 'Failed to activate user';
      }
    );
  }

  suspendUser(id: string): void {
    this.userService.suspendUser(id).subscribe(
      () => {
        this.success = 'User suspended successfully';
        this.loadUsers();
        setTimeout(() => (this.success = null), 3000);
      },
      (error) => {
        this.error = 'Failed to suspend user';
      }
    );
  }

  promoteToAdmin(id: string): void {
    if (confirm('Are you sure you want to promote this user to admin?')) {
      this.userService.promoteToAdmin(id).subscribe(
        () => {
          this.success = 'User promoted to admin';
          this.loadUsers();
          setTimeout(() => (this.success = null), 3000);
        },
        (error) => {
          this.error = 'Failed to promote user';
        }
      );
    }
  }

  assignRole(id: string, role: 'admin' | 'user' | 'moderator'): void {
    this.userService.assignRole(id, role).subscribe(
      () => {
        this.success = `User role changed to ${role}`;
        this.loadUsers();
        setTimeout(() => (this.success = null), 3000);
      },
      (error) => {
        this.error = 'Failed to assign role';
      }
    );
  }

  resetPassword(id: string): void {
    if (confirm('Are you sure you want to reset this user password?')) {
      this.userService.resetPassword(id).subscribe(
        (response) => {
          this.success = `Temporary password: ${response.temporaryPassword}`;
          setTimeout(() => (this.success = null), 5000);
        },
        (error) => {
          this.error = 'Failed to reset password';
        }
      );
    }
  }

  setFilter(status: 'all' | 'active' | 'inactive' | 'suspended'): void {
    this.filter = status;
    this.applyFilter();
  }

  searchUsers(): void {
    if (this.searchQuery.trim()) {
      this.loading = true;
      this.userService.searchUsers(this.searchQuery).subscribe(
        (users) => {
          this.filteredUsers = users;
          this.loading = false;
        },
        (error) => {
          this.error = 'Failed to search users';
          this.loading = false;
        }
      );
    } else {
      this.applyFilter();
    }
  }

  private applyFilter(): void {
    this.users$.subscribe((users) => {
      if (this.filter === 'all') {
        this.filteredUsers = users;
      } else {
        this.filteredUsers = users.filter((user) => user.status === this.filter);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'inactive':
        return 'badge-secondary';
      case 'suspended':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'badge-danger';
      case 'moderator':
        return 'badge-warning';
      case 'user':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  }
}
