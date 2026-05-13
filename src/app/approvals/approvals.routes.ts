import { Routes } from '@angular/router';

export const APPROVALS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./approvals.component').then(m => m.ApprovalsComponent),
  },
];
