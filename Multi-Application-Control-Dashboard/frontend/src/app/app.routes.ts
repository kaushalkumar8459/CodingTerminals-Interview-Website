import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard, ModuleGuard, NormalUserRedirectGuard } from './core/guards/role.guard';
import { LayoutComponent } from './shared/layouts/layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { RoleType } from './core/models/role.model';

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
        path: 'register',
        loadComponent: () => import('./features/auth/registration/register.component').then(m => m.RegisterComponent)
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
      // Dashboard - accessible to all users including Normal Users
      {
        path: 'dashboard',
        component: DashboardComponent,
      },

      // Study Notes Module (Protected by ModuleGuard)
      {
        path: 'study-notes',
        loadChildren: () => import('./features/study-notes/study-notes.routes').then(m => m.STUDY_NOTES_ROUTES),
        canActivate: [ModuleGuard],
        data: { module: 'Study Notes' }
      },

      // YouTube Module (Protected by ModuleGuard)
      {
        path: 'youtube',
        loadChildren: () => import('./features/youtube/youtube.routes').then(m => m.YOUTUBE_ROUTES),
        canActivate: [ModuleGuard],
        data: { module: 'YouTube' }
      },

      // LinkedIn Module (Protected by ModuleGuard)
      {
        path: 'linkedin',
        loadChildren: () => import('./features/linkedin/linkedin.routes').then(m => m.LINKEDIN_ROUTES),
        canActivate: [ModuleGuard],
        data: { module: 'LinkedIn' }
      },

      // Blog Module (Protected by ModuleGuard)
      {
        path: 'blog',
        loadChildren: () => import('./features/blog/blog.routes').then(m => m.BLOG_ROUTES),
        canActivate: [ModuleGuard],
        data: { module: 'Blog' }
      },

      // Admin Module (Super Admin & Admin only)
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: [RoleType.SUPER_ADMIN, RoleType.ADMIN] }
      },

      // User Profile (accessible to all authenticated users including Normal Users)
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
      },

      // Settings (accessible to all authenticated users)
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
      },

      // Personal Dashboard for Normal Users (protected by NormalUserRedirectGuard)
      {
        path: 'personal-dashboard',
        loadComponent: () => import('./features/personal-dashboard/personal-dashboard.component').then(m => m.PersonalDashboardComponent),
        canActivate: [NormalUserRedirectGuard]
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