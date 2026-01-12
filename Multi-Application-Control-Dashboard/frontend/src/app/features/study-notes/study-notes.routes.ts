import { Routes } from '@angular/router';

export const STUDY_NOTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./study-notes-list/study-notes-list.component').then(m => m.StudyNotesListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./study-notes-form/study-notes-form.component').then(m => m.StudyNotesFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./study-notes-view/study-notes-view.component').then(m => m.StudyNotesViewComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./study-notes-form/study-notes-form.component').then(m => m.StudyNotesFormComponent)
  }
];
