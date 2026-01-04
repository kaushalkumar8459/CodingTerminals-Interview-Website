import { Routes } from '@angular/router';
import { AdminComponent } from './pages/admin/admin.component';
import { ViewerComponent } from './pages/viewer/viewer.component';
import { ResumeComponent } from './pages/resume/resume.component';

export const routes: Routes = [
  { path: '', redirectTo: '/resume', pathMatch: 'full' },
  { path: 'resume', component: ResumeComponent },
  { path: 'viewer', component: ViewerComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '/resume' }
];
