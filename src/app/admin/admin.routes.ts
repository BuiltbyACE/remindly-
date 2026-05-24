import { Routes } from '@angular/router';
import { adminGuard } from './admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./admin-login.component').then(m => m.AdminLoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin-dashboard.component').then(m => m.AdminDashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./feature-users/admin-users.component').then(m => m.AdminUsersComponent),
      },
      {
        path: 'organizations',
        loadComponent: () => import('./feature-orgs/admin-orgs.component').then(m => m.AdminOrganizationsComponent),
      },
      {
        path: 'organizations/:id/members',
        loadComponent: () => import('./feature-members/admin-members.component').then(m => m.AdminMembersComponent),
      },
    ],
  },
];
