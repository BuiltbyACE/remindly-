import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-shell.component').then(m => m.AdminShellComponent),
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      {
        path: 'users',
        loadComponent: () => import('./feature-users/admin-users.component').then(m => m.AdminUsersComponent),
      },
      {
        path: 'organizations',
        loadComponent: () => import('./feature-orgs/admin-orgs.component').then(m => m.AdminOrganizationsComponent),
      },
      {
        path: 'members',
        loadComponent: () => import('./feature-members/admin-members.component').then(m => m.AdminMembersComponent),
      },
    ],
  },
];
