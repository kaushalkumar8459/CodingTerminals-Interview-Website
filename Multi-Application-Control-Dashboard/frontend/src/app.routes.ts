import { Routes } from '@angular/router';
import { AuthGuard, RoleGuard, ModuleAccessGuard } from './app/core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadComponent: () => import('./app/features/auth/auth.component')
      .then(m => m.AuthComponent)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./app/features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'study-notes',
    canActivate: [AuthGuard, ModuleAccessGuard],
    data: { module: 'STUDY_NOTES' },
    loadComponent: () => import('./app/features/study-notes/study-notes.component')
      .then(m => m.StudyNotesComponent)
  },
  {
    path: 'youtube',
    canActivate: [AuthGuard, ModuleAccessGuard],
    data: { module: 'YOUTUBE' },
    loadComponent: () => import('./app/features/youtube/youtube.component')
      .then(m => m.YouTubeComponent)
  },
  {
    path: 'linkedin',
    canActivate: [AuthGuard, ModuleAccessGuard],
    data: { module: 'LINKEDIN' },
    loadComponent: () => import('./app/features/linkedin/linkedin.component')
      .then(m => m.LinkedInComponent)
  },
  {
    path: 'blog',
    canActivate: [AuthGuard, ModuleAccessGuard],
    data: { module: 'BLOG' },
    loadComponent: () => import('./app/features/blog/blog.component')
      .then(m => m.BlogComponent)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['SUPER_ADMIN', 'ADMIN'] },
    loadComponent: () => import('./app/features/admin/admin.component')
      .then(m => m.AdminComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
