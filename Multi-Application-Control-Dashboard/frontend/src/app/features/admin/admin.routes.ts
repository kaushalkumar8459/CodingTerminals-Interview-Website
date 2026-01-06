import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
  },
  {
    path: 'users',
    loadComponent: () => import('./user-management/user-management.component').then(m => m.UserManagementComponent),
  },
  {
    path: 'roles',
    loadComponent: () => import('./role-management/role-management.component').then(m => m.RoleManagementComponent),
  },
  {
    path: 'modules',
    loadComponent: () => import('./module-settings/module-settings.component').then(m => m.ModuleSettingsComponent),
  },
];
