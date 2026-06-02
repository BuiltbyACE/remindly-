import { Routes } from '@angular/router';
import { loginGuard } from '../core/guards/login.guard';
import { mustChangePasswordGuard } from '../core/guards/must-change-password.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'change-password',
    canActivate: [mustChangePasswordGuard],
    loadComponent: () => import('./change-password/change-password.component').then(m => m.ChangePasswordComponent),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
