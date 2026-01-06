import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  },
  {
    path: 'study-notes',
    canActivate: [authGuard],
    loadChildren: () => import('./features/study-notes/study-notes.routes').then(m => m.STUDY_NOTES_ROUTES),
  },
  {
    path: 'youtube',
    canActivate: [authGuard],
    loadChildren: () => import('./features/youtube/youtube.routes').then(m => m.YOUTUBE_ROUTES),
  },
  {
    path: 'linkedin',
    canActivate: [authGuard],
    loadChildren: () => import('./features/linkedin/linkedin.routes').then(m => m.LINKEDIN_ROUTES),
  },
  {
    path: 'blog',
    canActivate: [authGuard],
    loadChildren: () => import('./features/blog/blog.routes').then(m => m.BLOG_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['super_admin', 'admin'] },
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
