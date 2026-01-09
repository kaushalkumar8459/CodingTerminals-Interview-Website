import { Injectable, inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { UserService, User, UsersResponse, UserFilters } from '../services/user.service';
import { firstValueFrom } from 'rxjs';

export interface UserWithUI extends User {
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export interface UserState {
  users: UserWithUI[];
  loading: boolean;
  error: string | null;
  success: string | null;
  currentPage: number;
  pageSize: number;
  totalUsers: number;
  selectedRole: string;
  selectedStatus: string;
  searchQuery: string;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
  success: null,
  currentPage: 1,
  pageSize: 10,
  totalUsers: 0,
  selectedRole: 'all',
  selectedStatus: 'all',
  searchQuery: ''
};

@Injectable({
  providedIn: 'root'
})
export class UserStore extends signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    totalPages: computed(() => Math.ceil(state.totalUsers() / state.pageSize())),
    hasFilters: computed(() => 
      state.selectedRole() !== 'all' || state.selectedStatus() !== 'all' || state.searchQuery() !== ''
    ),
    filteredCount: computed(() => state.users().length),
    isLoading: computed(() => state.loading()),
    superAdminCount: computed(() => state.users().filter(u => u.role === 'SUPER_ADMIN').length),
    adminCount: computed(() => state.users().filter(u => u.role === 'ADMIN').length),
    viewerCount: computed(() => state.users().filter(u => u.role === 'VIEWER').length),
    activeCount: computed(() => state.users().filter(u => u.status === 'Active').length),
    isEmpty: computed(() => state.users().length === 0 && !state.loading())
  })),
  withMethods((store, userService = inject(UserService)) => ({
    // ===== PUBLIC ACTIONS (called from components) =====

    /**
     * Load users with current filters - ASYNC
     */
    async loadUsers(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const filters: UserFilters = {
          searchQuery: store.searchQuery() || undefined,
          role: store.selectedRole() === 'all' ? undefined : store.selectedRole(),
          status: store.selectedStatus() === 'all' ? undefined : store.selectedStatus(),
          page: store.currentPage(),
          limit: store.pageSize()
        };

        const response = await firstValueFrom(userService.getUsers(filters));
        const users = response.data.map(u => ({
          ...u,
          isDeleting: false,
          isUpdating: false
        }));
        patchState(store, {
          users,
          totalUsers: response.total || 0,
          loading: false,
          error: null
        });
      } catch (err: any) {
        patchState(store, {
          error: err?.error?.message ?? 'Failed to load users',
          loading: false
        });
        console.error('UserStore: Error loading users', err);
      }
    },

    /**
     * Create new user - ASYNC
     */
    async createUser(user: Omit<User, 'id'>): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(userService.createUser(user));
        patchState(store, {
          success: 'User created successfully!',
          error: null,
          loading: false
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
        await (store as any)['loadUsers']();
      } catch (err: any) {
        patchState(store, { 
          error: err?.error?.message ?? 'Failed to create user',
          loading: false 
        });
        console.error('UserStore: Error creating user', err);
      }
    },

    /**
     * Update user - ASYNC
     */
    async updateUser(id: string, user: Partial<User>): Promise<void> {
      // Mark user as updating
      const users = store.users().map(u =>
        u.id === id ? { ...u, isUpdating: true } : u
      );
      patchState(store, { users, error: null });

      try {
        const updatedUser = await firstValueFrom(userService.updateUser(id, user));
        const updatedUsers = store.users().map(u =>
          u.id === id ? { ...updatedUser, isUpdating: false, isDeleting: false } : u
        );
        patchState(store, {
          users: updatedUsers,
          success: 'User updated successfully!',
          error: null
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        // Clear updating flag
        const errorUsers = store.users().map(u =>
          u.id === id ? { ...u, isUpdating: false } : u
        );
        patchState(store, {
          users: errorUsers,
          error: err?.error?.message ?? 'Failed to update user'
        });
        console.error('UserStore: Error updating user', err);
      }
    },

    /**
     * Delete user - ASYNC
     */
    async deleteUser(id: string): Promise<void> {
      // Mark user as deleting
      const users = store.users().map(u =>
        u.id === id ? { ...u, isDeleting: true } : u
      );
      patchState(store, { users, error: null });

      try {
        await firstValueFrom(userService.deleteUser(id));
        const updatedUsers = store.users().filter(u => u.id !== id);
        patchState(store, {
          users: updatedUsers,
          success: 'User deleted successfully!',
          error: null
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
        await (store as any)['loadUsers']();
      } catch (err: any) {
        // Clear deleting flag
        const errorUsers = store.users().map(u =>
          u.id === id ? { ...u, isDeleting: false } : u
        );
        patchState(store, {
          users: errorUsers,
          error: err?.error?.message ?? 'Failed to delete user'
        });
        console.error('UserStore: Error deleting user', err);
      }
    },

    /**
     * Assign modules to user - ASYNC
     */
    async assignModules(userId: string, modules: string[]): Promise<void> {
      // Mark user as updating
      const users = store.users().map(u =>
        u.id === userId ? { ...u, isUpdating: true } : u
      );
      patchState(store, { users, error: null });

      try {
        const updatedUser = await firstValueFrom(userService.assignModules(userId, modules));
        const updatedUsers = store.users().map(u =>
          u.id === userId ? { ...updatedUser, isUpdating: false } : u
        );
        patchState(store, {
          users: updatedUsers,
          success: 'Modules assigned successfully!',
          error: null
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        const errorUsers = store.users().map(u =>
          u.id === userId ? { ...u, isUpdating: false } : u
        );
        patchState(store, {
          users: errorUsers,
          error: err?.error?.message ?? 'Failed to assign modules'
        });
        console.error('UserStore: Error assigning modules', err);
      }
    },

    /**
     * Change user role - ASYNC
     */
    async changeUserRole(userId: string, role: string): Promise<void> {
      patchState(store, { error: null });
      try {
        const updatedUser = await firstValueFrom(userService.changeUserRole(userId, role));
        const updatedUsers = store.users().map(u =>
          u.id === userId ? updatedUser : u
        );
        patchState(store, {
          users: updatedUsers,
          success: 'User role changed successfully!',
          error: null
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        patchState(store, { error: err?.error?.message ?? 'Failed to change user role' });
        console.error('UserStore: Error changing user role', err);
      }
    },

    /**
     * Change user status - ASYNC
     */
    async changeUserStatus(userId: string, status: string): Promise<void> {
      patchState(store, { error: null });
      try {
        const updatedUser = await firstValueFrom(userService.changeUserStatus(userId, status));
        const updatedUsers = store.users().map(u =>
          u.id === userId ? updatedUser : u
        );
        patchState(store, {
          users: updatedUsers,
          success: 'User status changed successfully!',
          error: null
        });
        setTimeout(() => patchState(store, { success: null }), 3000);
      } catch (err: any) {
        patchState(store, { error: err?.error?.message ?? 'Failed to change user status' });
        console.error('UserStore: Error changing user status', err);
      }
    },

    /**
     * Filter by role
     */
    filterByRole(role: string): void {
      patchState(store, { selectedRole: role, currentPage: 1 });
      (store as any)['loadUsers']();
    },

    /**
     * Filter by status
     */
    filterByStatus(status: string): void {
      patchState(store, { selectedStatus: status, currentPage: 1 });
      (store as any)['loadUsers']();
    },

    /**
     * Search users
     */
    searchUsers(query: string): void {
      patchState(store, { searchQuery: query, currentPage: 1 });
      (store as any)['loadUsers']();
    },

    /**
     * Clear all filters and reload
     */
    clearFilters(): void {
      patchState(store, {
        searchQuery: '',
        selectedRole: 'all',
        selectedStatus: 'all',
        currentPage: 1
      });
      (store as any)['loadUsers']();
    },

    /**
     * Navigate to specific page
     */
    goToPage(page: number): void {
      if (page >= 1 && page <= store.totalPages()) {
        patchState(store, { currentPage: page });
        (store as any)['loadUsers']();
      }
    },

    /**
     * Go to previous page
     */
    previousPage(): void {
      (store as any)['goToPage'](store.currentPage() - 1);
    },

    /**
     * Go to next page
     */
    nextPage(): void {
      (store as any)['goToPage'](store.currentPage() + 1);
    },

    /**
     * Get page numbers for pagination UI
     */
    getPageNumbers(): number[] {
      const pages: number[] = [];
      const maxVisible = 5;
      let start = Math.max(1, store.currentPage() - Math.floor(maxVisible / 2));
      let end = Math.min(store.totalPages(), start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    }
  }))
) {
  // ===== METHOD TYPE DECLARATIONS =====
  // These methods are automatically created by signalStore with withMethods
  override loadUsers!: () => Promise<void>;
  override createUser!: (user: Omit<User, 'id'>) => Promise<void>;
  override updateUser!: (id: string, user: Partial<User>) => Promise<void>;
  override deleteUser!: (id: string) => Promise<void>;
  override assignModules!: (userId: string, modules: string[]) => Promise<void>;
  override changeUserRole!: (userId: string, role: string) => Promise<void>;
  override changeUserStatus!: (userId: string, status: string) => Promise<void>;
  override filterByRole!: (role: string) => void;
  override filterByStatus!: (status: string) => void;
  override searchUsers!: (query: string) => void;
  override clearFilters!: () => void;
  override goToPage!: (page: number) => void;
  override previousPage!: () => void;
  override nextPage!: () => void;
  override getPageNumbers!: () => number[];
}
