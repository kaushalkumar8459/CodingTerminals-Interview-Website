import { Routes } from '@angular/router';

export const BLOG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./blog-list/blog-list.component').then(m => m.BlogListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./blog-form/blog-form.component').then(m => m.BlogFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./blog-view/blog-view.component').then(m => m.BlogViewComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./blog-form/blog-form.component').then(m => m.BlogFormComponent)
  }
];
