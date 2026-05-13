import { Routes } from '@angular/router';
import { loginGuard } from '../core/guards/login.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
