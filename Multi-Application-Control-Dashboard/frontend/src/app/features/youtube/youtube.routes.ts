import { Routes } from '@angular/router';

export const YOUTUBE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./youtube-list/youtube-list.component').then(m => m.YoutubeListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./youtube-form/youtube-form.component').then(m => m.YoutubeFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./youtube-view/youtube-view.component').then(m => m.YoutubeViewComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./youtube-form/youtube-form.component').then(m => m.YoutubeFormComponent)
  }
];
