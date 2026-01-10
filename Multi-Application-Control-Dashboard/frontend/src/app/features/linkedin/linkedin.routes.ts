import { Routes } from '@angular/router';

export const LINKEDIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./linkedin-list/linkedin-list.component').then(m => m.LinkedinListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./linkedin-form/linkedin-form.component').then(m => m.LinkedinFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./linkedin-view/linkedin-view.component').then(m => m.LinkedinViewComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./linkedin-form/linkedin-form.component').then(m => m.LinkedinFormComponent)
  }
];
