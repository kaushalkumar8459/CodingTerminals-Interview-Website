import { Routes } from '@angular/router';

export const BLOG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./blog-list/blog-list.component').then(m => m.BlogListComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./blog-view/blog-view.component').then(m => m.BlogViewComponent),
  },
];
