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
      },
      {
        path: 'voice',
        loadChildren: () => import('./voice/voice.routes').then(m => m.VOICE_ROUTES),
        canActivate: [permissionGuard('voice.execute')],
      },
      {
        path: 'ai',
        loadChildren: () => import('./ai/ai.routes').then(m => m.AI_ROUTES),
      },
      {
        path: 'integrations',
        loadChildren: () => import('./integrations/integrations.routes').then(m => m.INTEGRATIONS_ROUTES),
      },
      {
        path: 'audit',
        loadChildren: () => import('./audit/audit.routes').then(m => m.AUDIT_ROUTES),
      },
      {
        path: 'settings',
        loadChildren: () => import('./settings/settings.routes').then(m => m.SETTINGS_ROUTES),
      },
      {
        path: 'analytics',
        loadChildren: () => import('./analytics/analytics.routes').then(m => m.ANALYTICS_ROUTES),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
