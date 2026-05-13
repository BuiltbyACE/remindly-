import { Routes } from '@angular/router';

export const EVENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./feature-list/events-list-page.component').then(m => m.EventsListPageComponent),
  },
  {
    path: 'create',
    loadComponent: () => import('./feature-create/events-create-page.component').then(m => m.EventsCreatePageComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./feature-detail/events-detail-page.component').then(m => m.EventsDetailPageComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./feature-edit/events-edit-page.component').then(m => m.EventsEditPageComponent),
  },
];
