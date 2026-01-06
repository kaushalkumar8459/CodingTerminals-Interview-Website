import { Routes } from '@angular/router';

export const LINKEDIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./linkedin-list/linkedin-list.component').then(m => m.LinkedInListComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./linkedin-view/linkedin-view.component').then(m => m.LinkedInViewComponent),
  },
];
