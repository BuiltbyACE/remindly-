import { Routes } from '@angular/router';

export const INTEGRATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./integrations.component').then(m => m.IntegrationsComponent),
  },
];
