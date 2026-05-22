import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
      },
      {
        path: 'calendar',
        loadChildren: () => import('./calendar/calendar.routes').then(m => m.CALENDAR_ROUTES),
        canActivate: [permissionGuard('events.read', 'audit.read')],
      },
      {
        path: 'events',
        loadChildren: () => import('./events/events.routes').then(m => m.EVENTS_ROUTES),
        canActivate: [permissionGuard('events.read')],
      },
      {
        path: 'approvals',
        loadChildren: () => import('./approvals/approvals.routes').then(m => m.APPROVALS_ROUTES),
        canActivate: [permissionGuard('events.approve')],
      },
      {
        path: 'notifications',
        loadChildren: () => import('./notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES),
        canActivate: [permissionGuard('notifications.send')],
      },
      {
        path: 'ai',
        loadChildren: () => import('./ai/ai.routes').then(m => m.AI_ROUTES),
      },
      {
        path: 'integrations',
        loadChildren: () => import('./integrations/integrations.routes').then(m => m.INTEGRATIONS_ROUTES),
        canActivate: [permissionGuard('integrations.manage')],
      },
      {
        path: 'audit',
        loadChildren: () => import('./audit/audit.routes').then(m => m.AUDIT_ROUTES),
        canActivate: [permissionGuard('audit.read')],
      },
      {
        path: 'settings',
        loadChildren: () => import('./settings/settings.routes').then(m => m.SETTINGS_ROUTES),
        canActivate: [permissionGuard('organizations.manage')],
      },
      {
        path: 'documents',
        loadChildren: () => import('./documents/documents.routes').then(m => m.DOCUMENTS_ROUTES),
        canActivate: [permissionGuard('documents.read')],
      },
      {
        path: 'analytics',
        loadChildren: () => import('./analytics/analytics.routes').then(m => m.ANALYTICS_ROUTES),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '**', loadComponent: () => import('./not-found/not-found.component').then(m => m.NotFoundComponent) },
    ],
  },
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
];
