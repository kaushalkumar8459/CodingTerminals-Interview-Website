import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard, ModuleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './shared/layouts/layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  // Auth Routes (No Layout)
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // Main App Routes (With Layout)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Dashboard
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard]
      },

      // Study Notes Module (Protected by ModuleGuard)
      {
        path: 'study-notes',
        loadChildren: () => import('./features/study-notes/study-notes.routes').then(m => m.STUDY_NOTES_ROUTES),
        canActivate: [AuthGuard, ModuleGuard],
        data: { module: 'Study Notes' }
      },

      // YouTube Module (Protected by ModuleGuard)
      {
        path: 'youtube',
        loadChildren: () => import('./features/youtube/youtube.routes').then(m => m.YOUTUBE_ROUTES),
        canActivate: [AuthGuard, ModuleGuard],
        data: { module: 'YouTube' }
      },

      // LinkedIn Module (Protected by ModuleGuard)
      {
        path: 'linkedin',
        loadChildren: () => import('./features/linkedin/linkedin.routes').then(m => m.LINKEDIN_ROUTES),
        canActivate: [AuthGuard, ModuleGuard],
        data: { module: 'LinkedIn' }
      },

      // Blog Module (Protected by ModuleGuard)
      {
        path: 'blog',
        loadChildren: () => import('./features/blog/blog.routes').then(m => m.BLOG_ROUTES),
        canActivate: [AuthGuard, ModuleGuard],
        data: { module: 'Blog' }
      },

      // Admin Module (Super Admin & Admin only)
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN'] }
      },

      // User Profile
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [AuthGuard]
      },

      // Settings
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [AuthGuard]
      },

      // Access Denied
      {
        path: 'access-denied',
        loadComponent: () => import('./shared/pages/access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
      },

      // Default redirect
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // 404 Redirect
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
