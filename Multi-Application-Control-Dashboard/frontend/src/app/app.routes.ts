import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
      .catch(() => {
        console.warn('Dashboard component not found, using fallback');
        return import('./app.component').then(m => m.AppComponent);
      })
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
