# MASTER SYSTEM ARCHITECT
## Remindly — Executive AI Assistant Platform
### Single Source of Truth | Principal Architecture Blueprint

**Document Version:** 1.0.0  
**Authored by:** Principal System Architect / Senior DevOps Engineer / Lead Frontend Engineer  
**Prepared for:** SafariStack Solutions  
**Date:** May 2026  
**Classification:** Internal Engineering Reference

---

## Table of Contents

1. [System Vision & Non-Negotiables](#1-system-vision--non-negotiables)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack (Definitive)](#3-technology-stack-definitive)
4. [Project Scaffold & Folder Structure](#4-project-scaffold--folder-structure)
5. [Environment Configuration](#5-environment-configuration)
6. [TypeScript Configuration](#6-typescript-configuration)
7. [Angular Application Bootstrap](#7-angular-application-bootstrap)
8. [Routing Architecture](#8-routing-architecture)
9. [Core Layer — Interceptors & Guards](#9-core-layer--interceptors--guards)
10. [State Management Architecture (Signals)](#10-state-management-architecture-signals)
11. [OpenAPI Integration & Typed API Clients](#11-openapi-integration--typed-api-clients)
12. [Domain Services — Full API Surface](#12-domain-services--full-api-surface)
13. [WebSocket / Realtime Architecture](#13-websocket--realtime-architecture)
14. [Authentication Domain](#14-authentication-domain)
15. [Multi-Tenant Organization Context](#15-multi-tenant-organization-context)
16. [RBAC & Permission System](#16-rbac--permission-system)
17. [Dashboard Domain](#17-dashboard-domain)
18. [Events Domain](#18-events-domain)
19. [Reminders Domain](#19-reminders-domain)
20. [Approvals Domain](#20-approvals-domain)
21. [Notifications Domain](#21-notifications-domain)
22. [Voice Domain](#22-voice-domain)
23. [AI / Briefings Domain](#23-ai--briefings-domain)
24. [Integrations Domain](#24-integrations-domain)
25. [Audit Domain](#25-audit-domain)
26. [Design System — Tokens, Typography, Color](#26-design-system--tokens-typography-color)
27. [Shared Component Library](#27-shared-component-library)
28. [Progressive Web App (PWA) Configuration](#28-progressive-web-app-pwa-configuration)
29. [Error Handling Architecture](#29-error-handling-architecture)
30. [Performance Engineering](#30-performance-engineering)
31. [Security Requirements](#31-security-requirements)
32. [Accessibility Standards](#32-accessibility-standards)
33. [Testing Strategy](#33-testing-strategy)
34. [DevOps, CI/CD & Deployment](#34-devops-cicd--deployment)
35. [Development Phases & Milestones](#35-development-phases--milestones)
36. [Engineering Anti-Patterns (NEVER DO)](#36-engineering-anti-patterns-never-do)
37. [Quality Gates Checklist](#37-quality-gates-checklist)

---

## 1. System Vision & Non-Negotiables

Remindly is **not a calendar application**. It is an enterprise-grade, event-driven operational command center that serves Vice Chancellors, CEOs, Government Officials, Executive Secretaries, and Institutional Administrators.

### Core Product Philosophy

The entire system exists to ensure executives never miss a commitment. Notifications are the product. Every architectural decision must serve this mission.

### The 10 Non-Negotiable Principles

| # | Principle | Engineering Implication |
|---|-----------|------------------------|
| 1 | Notifications are the core product | Every feature serves the notification pipeline |
| 2 | Executives must think less | Maximum 3 navigation levels for any critical action |
| 3 | Secretaries handle complexity | Dense, efficient interfaces for power users |
| 4 | Realtime synchronization is mandatory | WebSocket-first; stale data breaks trust |
| 5 | Enterprise trust over flashy UI | Stability, security, and reliability trump novelty |
| 6 | Scalability from day one | Every component must support multi-tenant growth |
| 7 | Accessibility is mandatory | WCAG 2.1 AA is a hard requirement, not optional |
| 8 | Offline support is strategic | PWA with IndexedDB; executives work everywhere |
| 9 | AI assists, never controls | Human confirmation required at every AI action point |
| 10 | Operationally intelligent UX | The interface anticipates needs and enables rapid action |

### Five-Second Rule

> An executive must understand their day within **five seconds** of opening the dashboard.

---

## 2. Architecture Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Angular 21 PWA Frontend                │
│         (Command Center — Signal-first, Standalone)     │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS / WSS
                           ▼
┌─────────────────────────────────────────────────────────┐
│            FastAPI Backend — API Layer                  │
│    JWT Bearer Auth │ X-Organization-ID Tenant Header   │
│    REST endpoints at /api/v1/*  │  WebSocket at /ws    │
└──────────┬──────────────────────────────┬───────────────┘
           │                              │
           ▼                              ▼
┌──────────────────┐           ┌─────────────────────────┐
│  PostgreSQL DB   │           │   Redis Pub/Sub          │
│  (Primary Data)  │           │  (Realtime Broadcasting) │
└──────────────────┘           └─────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│              External Services                           │
│  OpenAI GPT-4 │ Whisper STT │ FCM Push │ Email/SMS/WA   │
└──────────────────────────────────────────────────────────┘
```

### Frontend Domain Architecture

```
Feature Domains (Lazy-loaded routes)
├── auth/          — Login, token refresh, session
├── dashboard/     — Executive command center
├── events/        — Full event lifecycle management
├── reminders/     — Acknowledgement, escalations
├── approvals/     — Approval inbox and workflows
├── notifications/ — Notification center
├── voice/         — Voice command orchestration
├── ai/            — Briefings, summaries, insights
├── integrations/  — Calendar sync, OAuth
├── audit/         — Immutable audit trail
├── settings/      — User and organization settings
└── analytics/     — Operational metrics

Core Infrastructure (Eagerly loaded)
├── core/          — Interceptors, guards, init
├── shared/        — Reusable components, pipes
├── layout/        — Shell, navigation, sidebars
└── websocket/     — Realtime WS service
```

---

## 3. Technology Stack (Definitive)

> This stack is **locked**. No deviations without Principal Architect approval.

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | Angular | 21.x | Core framework |
| Language | TypeScript | 5.5+ | Strict typing throughout |
| Styling | Tailwind CSS | 3.x | Utility-first styling |
| State | Angular Signals + NgRx Signal Store | Latest | Signal-first state management |
| Routing | Angular Router | Built-in | Lazy-loaded feature domains |
| Forms | Reactive Forms | Built-in | All form handling |
| HTTP | Angular HttpClient | Built-in | API communication |
| Realtime | Native WebSocket | Web API | WS at `/ws` endpoint |
| Auth | JWT Bearer Tokens | — | HTTPBearer scheme |
| PWA | Angular Service Worker | Built-in | Offline + installable |
| Charts | Apache ECharts + ngx-echarts | Latest | Analytics, timelines |
| Dates | date-fns | 3.x | Timezone-safe date handling |
| Tables | Angular CDK Table | Built-in | Sortable, filterable data |
| Animations | Angular Animations | Built-in | Lifecycle visualizations |
| Testing | Vitest + Playwright | Latest | Unit + E2E |
| Build | Angular CLI | 21.x | Build toolchain |
| Package | pnpm | 9.x | Package management |
| API Types | openapi-typescript | Latest | Generated DTOs from schema |
| Linting | ESLint + Angular ESLint | Latest | Code quality enforcement |

### What is Explicitly Forbidden

- ❌ Bootstrap or any CSS component framework
- ❌ jQuery or any DOM manipulation library
- ❌ Angular NgModules (use standalone only)
- ❌ Template-driven forms
- ❌ `@HostBinding` / `@HostListener` decorators (use `host: {}` object)
- ❌ `ngClass` / `ngStyle` directives (use `class` / `style` bindings)
- ❌ `*ngIf`, `*ngFor`, `*ngSwitch` (use `@if`, `@for`, `@switch`)
- ❌ Hardcoded API URLs in components
- ❌ Hardcoded permissions in templates
- ❌ `any` type in TypeScript
- ❌ `localStorage` for JWT storage
- ❌ Direct mutation of API response objects

---

## 4. Project Scaffold & Folder Structure

```
remindly-frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── organization.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── permission.guard.ts
│   │   │   ├── services/
│   │   │   │   └── app-init.service.ts
│   │   │   └── tokens/
│   │   │       └── api-config.token.ts
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── status-chip/
│   │   │   │   ├── skeleton-loader/
│   │   │   │   ├── empty-state/
│   │   │   │   ├── priority-badge/
│   │   │   │   ├── timeline/
│   │   │   │   ├── avatar/
│   │   │   │   ├── toast/
│   │   │   │   ├── command-palette/
│   │   │   │   ├── confirm-dialog/
│   │   │   │   └── page-header/
│   │   │   ├── pipes/
│   │   │   │   ├── relative-time.pipe.ts
│   │   │   │   ├── priority-label.pipe.ts
│   │   │   │   └── truncate.pipe.ts
│   │   │   └── directives/
│   │   │       └── permission.directive.ts
│   │   ├── layout/
│   │   │   ├── shell/
│   │   │   │   └── shell.component.ts
│   │   │   ├── sidebar/
│   │   │   │   └── sidebar.component.ts
│   │   │   ├── topbar/
│   │   │   │   └── topbar.component.ts
│   │   │   └── org-switcher/
│   │   │       └── org-switcher.component.ts
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts
│   │   │   └── stores/
│   │   │       └── auth.store.ts
│   │   ├── organizations/
│   │   │   ├── services/
│   │   │   │   └── organization.service.ts
│   │   │   └── stores/
│   │   │       └── organization.store.ts
│   │   ├── dashboard/
│   │   ├── events/
│   │   ├── reminders/
│   │   ├── approvals/
│   │   ├── notifications/
│   │   ├── websocket/
│   │   │   ├── websocket.service.ts
│   │   │   └── websocket.store.ts
│   │   ├── voice/
│   │   ├── ai/
│   │   ├── integrations/
│   │   ├── audit/
│   │   ├── settings/
│   │   ├── analytics/
│   │   └── app.routes.ts
│   ├── assets/
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.production.ts
│   └── styles/
│       ├── tokens.css
│       └── global.css
├── angular.json
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
└── package.json
```

---

## 5. Environment Configuration

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000',
  wsBaseUrl: 'ws://localhost:8000',
  appName: 'Remindly',
  appEnv: 'development',
  enableAnalytics: false,
};
```

```typescript
// src/environments/environment.production.ts
export const environment = {
  production: true,
  apiBaseUrl: import.meta.env['NG_APP_API_BASE_URL'] as string,
  wsBaseUrl: import.meta.env['NG_APP_WS_BASE_URL'] as string,
  appName: 'Remindly',
  appEnv: 'production',
  enableAnalytics: true,
};
```

```typescript
// src/app/core/tokens/api-config.token.ts
import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');
```

---

## 6. TypeScript Configuration

```jsonc
// tsconfig.json
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "useDefineForClassFields": false,
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "moduleResolution": "bundler",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "dom"],
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@layout/*": ["src/app/layout/*"],
      "@env/*": ["src/environments/*"]
    }
  }
}
```

---

## 7. Angular Application Bootstrap

```typescript
// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import { APP_ROUTES } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { organizationInterceptor } from './core/interceptors/organization.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { API_CONFIG } from './core/tokens/api-config.token';
import { environment } from '@env/environment';
import { isDevMode } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      APP_ROUTES,
      withComponentInputBinding(),
      withViewTransitions(),
    ),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        organizationInterceptor,
        errorInterceptor,
      ]),
    ),
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    {
      provide: API_CONFIG,
      useValue: {
        apiBaseUrl: environment.apiBaseUrl,
        wsBaseUrl: environment.wsBaseUrl,
      },
    },
  ],
};
```

```typescript
// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch(console.error);
```

```typescript
// src/app/app.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
```

---

## 8. Routing Architecture

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const APP_ROUTES: Routes = [
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
```

---

## 9. Core Layer — Interceptors & Guards

### Auth Interceptor

```typescript
// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../../auth/stores/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const token = authStore.accessToken();

  if (!token) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
```

### Organization Interceptor

```typescript
// src/app/core/interceptors/organization.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OrganizationStore } from '../../organizations/stores/organization.store';

export const organizationInterceptor: HttpInterceptorFn = (req, next) => {
  const orgStore = inject(OrganizationStore);
  const activeOrgId = orgStore.activeOrganizationId();

  if (!activeOrgId) return next(req);

  // Only inject header for API calls
  if (!req.url.includes('/api/')) return next(req);

  return next(
    req.clone({
      setHeaders: { 'X-Organization-ID': activeOrgId },
    }),
  );
};
```

### Error Interceptor

```typescript
// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../../auth/stores/auth.store';
import { ToastService } from '../../shared/components/toast/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      switch (error.status) {
        case HttpStatusCode.Unauthorized:
          authStore.clearSession();
          router.navigate(['/auth/login']);
          break;
        case HttpStatusCode.Forbidden:
          toast.error('You do not have permission to perform this action.');
          break;
        case HttpStatusCode.NotFound:
          toast.warning('The requested resource was not found.');
          break;
        case HttpStatusCode.Conflict:
          toast.warning('A workflow conflict occurred. Please review and try again.');
          break;
        case HttpStatusCode.UnprocessableEntity:
          // Validation errors — let components handle via form errors
          break;
        case HttpStatusCode.InternalServerError:
          toast.error('A system error occurred. Our team has been notified.');
          break;
        case 0: // Network failure
          toast.error('Network connection lost. Working in offline mode.');
          break;
        default:
          if (error.status >= 500) {
            toast.error('An unexpected server error occurred.');
          }
      }
      return throwError(() => error);
    }),
  );
};
```

### Auth Guard

```typescript
// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../auth/stores/auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) return true;

  return router.parseUrl('/auth/login');
};
```

### Permission Guard (factory)

```typescript
// src/app/core/guards/permission.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RbacStore } from '../../auth/stores/rbac.store';

export const permissionGuard = (permission: string): CanActivateFn => {
  return () => {
    const rbacStore = inject(RbacStore);
    const router = inject(Router);

    if (rbacStore.hasPermission(permission)) return true;

    return router.parseUrl('/dashboard');
  };
};
```

---

## 10. State Management Architecture (Signals)

### Signal Store Pattern

All global state uses NgRx Signal Store. The pattern below is the standard for all domain stores.

```typescript
// Pattern: src/app/{domain}/stores/{domain}.store.ts
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';

// ─── Example: Auth Store ───────────────────────────────────────────────────

interface AuthState {
  accessToken: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ accessToken, user }) => ({
    isAuthenticated: computed(() => !!accessToken() && !!user()),
    userDisplayName: computed(() => user()?.full_name ?? 'Unknown'),
    userInitials: computed(() => {
      const name = user()?.full_name ?? '';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }),
  })),
  withMethods((store, authService = inject(AuthService)) => ({
    async login(email: string, password: string): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const result = await authService.login(email, password);
        patchState(store, {
          accessToken: result.access_token,
          user: result.user,
          isLoading: false,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Login failed';
        patchState(store, { isLoading: false, error: message });
        throw err;
      }
    },
    clearSession(): void {
      patchState(store, initialState);
    },
    setToken(token: string): void {
      patchState(store, { accessToken: token });
    },
  })),
);
```

### State Type Catalog

| Store | Scope | Key Signals | Notes |
|-------|-------|-------------|-------|
| `AuthStore` | Global | `accessToken`, `user`, `isAuthenticated` | Session + token |
| `OrganizationStore` | Global | `organizations`, `activeOrganizationId` | Multi-tenant context |
| `RbacStore` | Global | `permissions`, `roles` | Hydrated after login |
| `WebSocketStore` | Global | `connectionStatus`, `lastEvent` | WS connection state |
| `NotificationStore` | Global | `notifications`, `unreadCount` | Live notification feed |
| `EventsStore` | Feature | `events`, `selectedEvent`, `filters` | Events feature scope |
| `ApprovalsStore` | Feature | `pendingApprovals`, `history` | Approvals feature scope |
| `VoiceStore` | Feature | `commands`, `activeCommand` | Voice feature scope |

---

## 11. OpenAPI Integration & Typed API Clients

### DTO Generation Setup

```bash
# Install generator
pnpm add -D openapi-typescript

# Generate types from the live spec or local file
pnpm dlx openapi-typescript ./src/openapi/remindly_openapi.json -o ./src/app/api/types.generated.ts
```

### Add to package.json scripts

```json
{
  "scripts": {
    "api:generate": "openapi-typescript ./src/openapi/remindly_openapi.json -o ./src/app/api/types.generated.ts",
    "api:fetch": "curl -o ./src/openapi/remindly_openapi.json http://localhost:8000/api/v1/openapi.json"
  }
}
```

### Base API Client

```typescript
// src/app/api/base-api.client.ts
import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../core/tokens/api-config.token';

export abstract class BaseApiClient {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = inject(API_CONFIG).apiBaseUrl;

  protected get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<T>(`${this.baseUrl}${path}`, { params: httpParams });
  }

  protected post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body);
  }

  protected put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body);
  }

  protected patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body);
  }

  protected delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`);
  }
}
```

---

## 12. Domain Services — Full API Surface

All services extend `BaseApiClient`. They map directly to the OpenAPI spec.

### Auth Service

```typescript
// src/app/auth/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  supabase_user_id: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseApiClient {
  getCurrentUser(): Observable<UserProfile> {
    return this.get<UserProfile>('/api/v1/auth/me');
  }
}
```

### Events Service

```typescript
// src/app/events/services/events.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';

// ─── DTO Types (generated from OpenAPI) ──────────────────────────────────────

export type EventPriority = 'low' | 'medium' | 'high' | 'critical';
export type EventStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'scheduled'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'escalated';

export interface EventCreate {
  title: string;                    // 1..500 chars
  description?: string | null;
  location?: string | null;
  priority?: EventPriority;         // default: 'medium'
  starts_at: string;                // ISO 8601
  ends_at: string;
  reminder_policy_id?: string | null;
  attendee_ids?: string[];
}

export interface EventUpdate {
  title?: string | null;
  description?: string | null;
  location?: string | null;
  priority?: EventPriority | null;
  starts_at?: string | null;
  ends_at?: string | null;
}

export interface EventResponse extends EventCreate {
  id: string;
  organization_id: string;
  status: EventStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventListResponse {
  items: EventResponse[];
  total: number;
  page: number;
  size: number;
}

export interface EventScheduleRequest {
  scheduled_at?: string | null;
}

export interface EventTransitionRequest {
  reason?: string | null;
}

@Injectable({ providedIn: 'root' })
export class EventsService extends BaseApiClient {
  listEvents(status?: EventStatus): Observable<EventListResponse> {
    return this.get<EventListResponse>('/api/v1/events', { status });
  }

  getEvent(eventId: string): Observable<EventResponse> {
    return this.get<EventResponse>(`/api/v1/events/${eventId}`);
  }

  createEvent(payload: EventCreate): Observable<EventResponse> {
    return this.post<EventResponse>('/api/v1/events', payload);
  }

  updateEvent(eventId: string, payload: EventUpdate): Observable<EventResponse> {
    return this.patch<EventResponse>(`/api/v1/events/${eventId}`, payload);
  }

  deleteEvent(eventId: string): Observable<void> {
    return this.delete<void>(`/api/v1/events/${eventId}`);
  }

  requestApproval(eventId: string): Observable<EventResponse> {
    return this.post<EventResponse>(`/api/v1/events/${eventId}/request-approval`, {});
  }

  approveEvent(eventId: string, payload: EventTransitionRequest): Observable<EventResponse> {
    return this.post<EventResponse>(`/api/v1/events/${eventId}/approve`, payload);
  }

  scheduleEvent(eventId: string, payload: EventScheduleRequest): Observable<EventResponse> {
    return this.post<EventResponse>(`/api/v1/events/${eventId}/schedule`, payload);
  }

  activateEvent(eventId: string): Observable<EventResponse> {
    return this.post<EventResponse>(`/api/v1/events/${eventId}/activate`, {});
  }

  completeEvent(eventId: string): Observable<EventResponse> {
    return this.post<EventResponse>(`/api/v1/events/${eventId}/complete`, {});
  }

  cancelEvent(eventId: string, payload: EventTransitionRequest): Observable<EventResponse> {
    return this.post<EventResponse>(`/api/v1/events/${eventId}/cancel`, payload);
  }

  assignPolicy(eventId: string, policyId: string): Observable<EventResponse> {
    return this.post<EventResponse>(`/api/v1/events/${eventId}/assign-policy`, {
      reminder_policy_id: policyId,
    });
  }

  getEventSchedule(eventId: string): Observable<unknown> {
    return this.get(`/api/v1/events/${eventId}/schedule`);
  }
}
```

### Notifications Service

```typescript
// src/app/notifications/services/notifications.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'acknowledged' | 'failed' | 'escalated';
export type NotificationChannel = 'push' | 'email' | 'sms' | 'whatsapp' | 'in_app';
export type NotificationType = 'reminder' | 'escalation' | 'approval_request' | 'update' | 'cancellation';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface NotificationResponse {
  id: string;
  event_id: string;
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  channel: NotificationChannel;
  status: NotificationStatus;
  scheduled_for: string;
  sent_at: string | null;
  acknowledged_at: string | null;
  content: Record<string, unknown>;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService extends BaseApiClient {
  listNotifications(status?: NotificationStatus): Observable<NotificationResponse[]> {
    return this.get<NotificationResponse[]>('/api/v1/notifications', { status });
  }

  listMyNotifications(status?: NotificationStatus): Observable<NotificationResponse[]> {
    return this.get<NotificationResponse[]>('/api/v1/notifications/my', { status });
  }

  getNotification(notificationId: string): Observable<NotificationResponse> {
    return this.get<NotificationResponse>(`/api/v1/notifications/${notificationId}`);
  }

  acknowledge(notificationId: string): Observable<NotificationResponse> {
    return this.post<NotificationResponse>(
      `/api/v1/notifications/${notificationId}/acknowledge`,
      { notification_id: notificationId },
    );
  }
}
```

### Voice Service

```typescript
// src/app/voice/services/voice.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';

export type VoiceCommandStatus =
  | 'pending' | 'processing' | 'awaiting_confirmation'
  | 'completed' | 'failed' | 'rejected';

export type VoiceCommandType =
  | 'create_event' | 'reschedule_event' | 'cancel_event'
  | 'query_events' | 'acknowledge_reminder' | 'escalate'
  | 'summarize_event' | 'unknown';

export type VoiceCommandSource = 'microphone' | 'telephony' | 'upload';

export interface VoiceCommandCreate {
  command_text?: string | null;
  source?: VoiceCommandSource | null;
}

export interface CommandConfirmation {
  confirmed: boolean;
  modifications?: Record<string, unknown> | null;
}

export interface VoiceCommandResponse {
  id: string;
  organization_id: string;
  user_id: string;
  command_text: string | null;
  command_type: VoiceCommandType;
  status: VoiceCommandStatus;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  parsed_intent: Record<string, unknown> | null;
  execution_result: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface VoiceCommandListResponse {
  items: VoiceCommandResponse[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class VoiceService extends BaseApiClient {
  createCommand(payload: VoiceCommandCreate): Observable<VoiceCommandResponse> {
    return this.post<VoiceCommandResponse>('/api/v1/voice/commands', payload);
  }

  listCommands(limit = 20, offset = 0): Observable<VoiceCommandListResponse> {
    return this.get<VoiceCommandListResponse>('/api/v1/voice/commands', { limit, offset });
  }

  getCommand(commandId: string): Observable<VoiceCommandResponse> {
    return this.get<VoiceCommandResponse>(`/api/v1/voice/commands/${commandId}`);
  }

  confirmCommand(commandId: string, payload: CommandConfirmation): Observable<VoiceCommandResponse> {
    return this.post<VoiceCommandResponse>(
      `/api/v1/voice/commands/${commandId}/confirm`,
      payload,
    );
  }
}
```

### AI Service

```typescript
// src/app/ai/services/ai.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';

export type BriefingStatus = 'draft' | 'published';
export type SummaryType = 'executive' | 'detailed' | 'action_items' | 'key_decisions' | 'attendee_notes';
export type SummaryStatus = 'pending' | 'generating' | 'completed' | 'failed';

export interface BriefingCreate {
  briefing_date: string;   // YYYY-MM-DD
  executive_id: string;   // UUID
}

export interface BriefingResponse {
  id: string;
  organization_id: string;
  executive_id: string;
  briefing_date: string;
  content: Record<string, unknown> | null;
  status: BriefingStatus;
  created_at: string;
}

export interface BriefingListResponse {
  items: BriefingResponse[];
  total: number;
}

export interface SummaryCreate {
  event_id: string;
  summary_type: SummaryType;
}

export interface SummaryResponse {
  id: string;
  event_id: string;
  summary_type: SummaryType;
  status: SummaryStatus;
  content: Record<string, unknown> | null;
  created_at: string;
}

export interface MeetingSummaryCreate {
  event_id: string;
  notes: string;
}

export interface VoiceParseRequest {
  transcript: string;
}

export interface ParsedVoiceIntent {
  title: string | null;
  date: string | null;
  start_time: string | null;
  venue: string | null;
  participants: string[];
  priority: string | null;
  confidence: number;
}

@Injectable({ providedIn: 'root' })
export class AiService extends BaseApiClient {
  generateBriefing(payload: BriefingCreate): Observable<BriefingResponse> {
    return this.post<BriefingResponse>('/api/v1/ai/briefings', payload);
  }

  listBriefings(): Observable<BriefingListResponse> {
    return this.get<BriefingListResponse>('/api/v1/ai/briefings');
  }

  requestSummary(payload: SummaryCreate): Observable<SummaryResponse> {
    return this.post<SummaryResponse>('/api/v1/ai/summaries', payload);
  }

  getSummary(summaryId: string): Observable<SummaryResponse> {
    return this.get<SummaryResponse>(`/api/v1/ai/summaries/${summaryId}`);
  }

  listEventSummaries(eventId: string): Observable<SummaryResponse[]> {
    return this.get<SummaryResponse[]>(`/api/v1/ai/events/${eventId}/summaries`);
  }

  parseVoiceTranscript(payload: VoiceParseRequest): Observable<ParsedVoiceIntent> {
    return this.post<ParsedVoiceIntent>('/api/v1/ai/parse-voice', payload);
  }

  summarizeMeeting(payload: MeetingSummaryCreate): Observable<SummaryResponse> {
    return this.post<SummaryResponse>('/api/v1/ai/meeting-summaries', payload);
  }
}
```

### Approvals Service

```typescript
// src/app/approvals/services/approvals.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalCreate {
  approver_membership_id: string;
  comments?: string | null;
}

export interface ApprovalProcess {
  status: ApprovalStatus;
  comments?: string | null;
}

export interface ApprovalResponse {
  id: string;
  event_id: string;
  approver_membership_id: string;
  status: ApprovalStatus;
  comments: string | null;
  created_at: string;
  processed_at: string | null;
}

@Injectable({ providedIn: 'root' })
export class ApprovalsService extends BaseApiClient {
  createApproval(eventId: string, payload: ApprovalCreate): Observable<ApprovalResponse> {
    return this.post<ApprovalResponse>(`/api/v1/events/${eventId}/approvals`, payload);
  }

  listApprovals(eventId: string): Observable<ApprovalResponse[]> {
    return this.get<ApprovalResponse[]>(`/api/v1/events/${eventId}/approvals`);
  }

  processApproval(
    eventId: string,
    approvalId: string,
    payload: ApprovalProcess,
  ): Observable<ApprovalResponse> {
    return this.post<ApprovalResponse>(
      `/api/v1/events/${eventId}/approvals/${approvalId}/process`,
      payload,
    );
  }
}
```

### Reminders Service

```typescript
// src/app/reminders/services/reminders.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';

export interface ReminderPolicyCreate {
  name: string;                      // 1..200 chars
  description?: string | null;
  reminder_offsets: number[];        // minutes before event
  escalation_offsets: number[];
  channels?: string[];
}

export interface ReminderResponse {
  id: string;
  event_id: string;
  scheduled_for: string;
  status: string;
  channel: string;
  acknowledged_at: string | null;
}

@Injectable({ providedIn: 'root' })
export class RemindersService extends BaseApiClient {
  listEventReminders(eventId: string): Observable<ReminderResponse[]> {
    return this.get<ReminderResponse[]>(`/api/v1/events/${eventId}/reminders`);
  }

  acknowledgeReminder(eventId: string, reminderId: string): Observable<ReminderResponse> {
    return this.post<ReminderResponse>(
      `/api/v1/events/${eventId}/reminders/${reminderId}/acknowledge`,
      {},
    );
  }

  listPolicies(): Observable<ReminderPolicyCreate[]> {
    return this.get<ReminderPolicyCreate[]>('/api/v1/events/reminder-policies');
  }

  createPolicy(payload: ReminderPolicyCreate): Observable<ReminderPolicyCreate> {
    return this.post<ReminderPolicyCreate>('/api/v1/events/reminder-policies', payload);
  }

  getPolicy(policyId: string): Observable<ReminderPolicyCreate> {
    return this.get<ReminderPolicyCreate>(`/api/v1/events/reminder-policies/${policyId}`);
  }

  deletePolicy(policyId: string): Observable<void> {
    return this.delete<void>(`/api/v1/events/reminder-policies/${policyId}`);
  }
}
```

### Integrations Service

```typescript
// src/app/integrations/services/integrations.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';

export type IntegrationProvider = 'google' | 'outlook';
export type IntegrationAuthStatus = 'connected' | 'expired' | 'revoked';
export type SyncDirection = 'import' | 'export' | 'bidirectional';
export type SyncStatus = 'idle' | 'syncing' | 'error';

export interface IntegrationConnectRequest {
  provider: IntegrationProvider;
  auth_code: string;
  redirect_uri: string;
}

export interface SyncRequest {
  direction: SyncDirection;
}

export interface IntegrationResponse {
  id: string;
  provider: IntegrationProvider;
  auth_status: IntegrationAuthStatus;
  sync_status: SyncStatus;
  last_synced_at: string | null;
}

@Injectable({ providedIn: 'root' })
export class IntegrationsService extends BaseApiClient {
  connect(payload: IntegrationConnectRequest): Observable<IntegrationResponse> {
    return this.post<IntegrationResponse>('/api/v1/integrations/connect', payload);
  }

  list(): Observable<IntegrationResponse[]> {
    return this.get<IntegrationResponse[]>('/api/v1/integrations');
  }

  get(integrationId: string): Observable<IntegrationResponse> {
    return this.get<IntegrationResponse>(`/api/v1/integrations/${integrationId}`);
  }

  sync(integrationId: string, payload: SyncRequest): Observable<unknown> {
    return this.post(`/api/v1/integrations/${integrationId}/sync`, payload);
  }

  disconnect(integrationId: string): Observable<void> {
    return this.post<void>(`/api/v1/integrations/${integrationId}/disconnect`, {});
  }
}
```

### RBAC Service

```typescript
// src/app/auth/services/rbac.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';

export interface RoleAssign {
  membership_id: string;
  role_id: string;
}

export interface DelegationCreate {
  delegate_membership_id: string;
  permission_scope: string[];
  ends_at?: string | null;
}

@Injectable({ providedIn: 'root' })
export class RbacService extends BaseApiClient {
  listPermissions(): Observable<string[]> {
    return this.get<string[]>('/api/v1/rbac/permissions');
  }

  getMyPermissions(): Observable<string[]> {
    return this.get<string[]>('/api/v1/rbac/permissions/my');
  }

  checkPermission(permission: string): Observable<boolean> {
    return this.get<boolean>('/api/v1/rbac/permissions/check', { permission });
  }

  listRoles(): Observable<unknown[]> {
    return this.get<unknown[]>('/api/v1/rbac/roles');
  }

  assignRole(payload: RoleAssign): Observable<unknown> {
    return this.post('/api/v1/rbac/roles/assign', payload);
  }

  removeRole(membershipId: string, roleId: string): Observable<void> {
    return this.delete<void>(`/api/v1/rbac/roles/assignments/${membershipId}/${roleId}`);
  }

  createDelegation(payload: DelegationCreate): Observable<unknown> {
    return this.post('/api/v1/rbac/delegations', payload);
  }

  revokeDelegation(delegationId: string): Observable<void> {
    return this.post<void>(`/api/v1/rbac/delegations/${delegationId}/revoke`, {});
  }
}
```

---

## 13. WebSocket / Realtime Architecture

The backend broadcasts organization-scoped events via WebSocket at `/ws`. The frontend must maintain a persistent, auto-reconnecting connection with heartbeat support.

```typescript
// src/app/websocket/websocket.service.ts
import { Injectable, inject, OnDestroy } from '@angular/core';
import { Subject, interval, takeUntil, filter } from 'rxjs';
import { API_CONFIG } from '../core/tokens/api-config.token';
import { AuthStore } from '../auth/stores/auth.store';
import { OrganizationStore } from '../organizations/stores/organization.store';

export type WsConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WsMessage {
  type: string;
  payload: unknown;
  organization_id?: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private readonly config = inject(API_CONFIG);
  private readonly authStore = inject(AuthStore);
  private readonly orgStore = inject(OrganizationStore);

  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnects = 10;
  private readonly reconnectDelayMs = [1000, 2000, 4000, 8000, 16000, 30000];
  private readonly destroy$ = new Subject<void>();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  readonly message$ = new Subject<WsMessage>();
  readonly status$ = new Subject<WsConnectionStatus>();

  connect(): void {
    const token = this.authStore.accessToken();
    const orgId = this.orgStore.activeOrganizationId();
    if (!token) return;

    const url = `${this.config.wsBaseUrl}/ws?token=${token}${orgId ? `&org_id=${orgId}` : ''}`;

    this.status$.next('connecting');
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.status$.next('connected');
      this.startHeartbeat();
    };

    this.ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as WsMessage;
        this.message$.next(data);
      } catch {
        // Ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      this.status$.next('disconnected');
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.status$.next('error');
    };
  }

  disconnect(): void {
    this.stopHeartbeat();
    this.ws?.close();
    this.ws = null;
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30_000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnects) return;

    const delay = this.reconnectDelayMs[
      Math.min(this.reconnectAttempts, this.reconnectDelayMs.length - 1)
    ];
    this.reconnectAttempts++;

    setTimeout(() => this.connect(), delay);
  }

  messagesOfType(type: string) {
    return this.message$.pipe(filter(m => m.type === type));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }
}
```

### WebSocket Event Types

| Event Type | Payload | Consumer |
|-----------|---------|----------|
| `event.created` | `EventResponse` | EventsStore, Dashboard |
| `event.updated` | `EventResponse` | EventsStore |
| `event.status_changed` | `{ event_id, status }` | EventsStore, Dashboard |
| `reminder.triggered` | `ReminderResponse` | NotificationStore |
| `notification.created` | `NotificationResponse` | NotificationStore |
| `approval.requested` | `ApprovalResponse` | ApprovalsStore |
| `approval.processed` | `ApprovalResponse` | ApprovalsStore |
| `voice.status_changed` | `VoiceCommandResponse` | VoiceStore |
| `briefing.ready` | `BriefingResponse` | AiStore |
| `pong` | `{}` | WebSocketService |

---

## 14. Authentication Domain

### Auth Store (complete)

```typescript
// src/app/auth/stores/auth.store.ts
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService, UserProfile } from '../services/auth.service';
import { RbacService } from '../services/rbac.service';
import { RbacStore } from './rbac.store';

interface AuthState {
  accessToken: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({
    accessToken: null,
    user: null,
    isLoading: false,
    error: null,
  }),
  withComputed(({ accessToken, user }) => ({
    isAuthenticated: computed(() => !!accessToken() && !!user()),
    userDisplayName: computed(() => user()?.full_name ?? ''),
    userInitials: computed(() => {
      const name = user()?.full_name ?? '';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }),
  })),
  withMethods((store, authService = inject(AuthService), rbacStore = inject(RbacStore)) => ({
    setToken(token: string): void {
      patchState(store, { accessToken: token });
    },

    async hydrateUser(): Promise<void> {
      if (!store.accessToken()) return;
      patchState(store, { isLoading: true });
      try {
        const user = await firstValueFrom(authService.getCurrentUser());
        patchState(store, { user, isLoading: false });
        await rbacStore.hydratePermissions();
      } catch {
        patchState(store, { isLoading: false });
      }
    },

    clearSession(): void {
      patchState(store, { accessToken: null, user: null, error: null });
    },
  })),
);
```

### RBAC Store

```typescript
// src/app/auth/stores/rbac.store.ts
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RbacService } from '../services/rbac.service';

export const RbacStore = signalStore(
  { providedIn: 'root' },
  withState({ permissions: [] as string[], isLoaded: false }),
  withComputed(({ permissions }) => ({
    hasPermission: computed(() => (key: string) => permissions().includes(key)),
    hasAnyPermission: computed(() => (keys: string[]) =>
      keys.some(k => permissions().includes(k)),
    ),
  })),
  withMethods((store, rbacService = inject(RbacService)) => ({
    async hydratePermissions(): Promise<void> {
      try {
        const permissions = await firstValueFrom(rbacService.getMyPermissions());
        patchState(store, { permissions, isLoaded: true });
      } catch {
        patchState(store, { permissions: [], isLoaded: true });
      }
    },
  })),
);
```

### Permission Directive

```typescript
// src/app/shared/directives/permission.directive.ts
import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { RbacStore } from '../../auth/stores/rbac.store';

@Directive({
  selector: '[appPermission]',
})
export class PermissionDirective {
  readonly appPermission = input.required<string>();

  private readonly rbacStore = inject(RbacStore);
  private readonly vcr = inject(ViewContainerRef);
  private readonly tmpl = inject(TemplateRef);

  constructor() {
    effect(() => {
      const permitted = this.rbacStore.hasPermission()(this.appPermission());
      this.vcr.clear();
      if (permitted) this.vcr.createEmbeddedView(this.tmpl);
    });
  }
}
```

---

## 15. Multi-Tenant Organization Context

```typescript
// src/app/organizations/stores/organization.store.ts
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { OrganizationService } from '../services/organization.service';
import { RbacStore } from '../../auth/stores/rbac.store';

interface Organization {
  id: string;
  name: string;
  slug: string;
  organization_type: string;
  is_active: boolean;
}

interface OrganizationState {
  organizations: Organization[];
  activeOrganizationId: string | null;
  isLoading: boolean;
}

export const OrganizationStore = signalStore(
  { providedIn: 'root' },
  withState<OrganizationState>({
    organizations: [],
    activeOrganizationId: null,
    isLoading: false,
  }),
  withComputed(({ organizations, activeOrganizationId }) => ({
    activeOrganization: computed(() =>
      organizations().find(o => o.id === activeOrganizationId()) ?? null,
    ),
    hasMultipleOrgs: computed(() => organizations().length > 1),
  })),
  withMethods((store, orgService = inject(OrganizationService), rbacStore = inject(RbacStore)) => ({
    async loadOrganizations(): Promise<void> {
      patchState(store, { isLoading: true });
      const orgs = await firstValueFrom(orgService.listOrganizations());
      const firstId = orgs[0]?.id ?? null;
      patchState(store, {
        organizations: orgs,
        activeOrganizationId: firstId,
        isLoading: false,
      });
    },

    async switchOrganization(orgId: string): Promise<void> {
      // Clear all cached state when switching orgs
      patchState(store, { activeOrganizationId: orgId });
      // Re-hydrate permissions for the new org context
      await rbacStore.hydratePermissions();
    },
  })),
);
```

---

## 16. RBAC & Permission System

### Permission Keys Reference

| Permission Key | Scope | Role |
|---------------|-------|------|
| `events.read` | View events | All authenticated |
| `events.write` | Create / update events | Secretary, Admin |
| `events.delete` | Delete events | Admin |
| `events.approve` | Approve events | Executive, Admin |
| `reminders.read` | View reminders | All authenticated |
| `reminders.escalate` | Trigger escalations | Secretary, Admin |
| `notifications.send` | Send notifications | Admin |
| `notifications.read` | View all notifications | Admin, Secretary |
| `voice.execute` | Submit voice commands | Executive, Admin |
| `approvals.read` | View approval history | Secretary, Admin |
| `audit.read` | View audit logs | Admin |
| `integrations.manage` | Connect / disconnect | Admin |
| `organizations.manage` | Create / update orgs | Admin |
| `rbac.manage` | Assign roles | Admin |

---

## 17. Dashboard Domain

The dashboard must answer four questions in under 5 seconds:
1. What is my day like?
2. What requires immediate attention?
3. What did my AI assistant prepare?
4. What happened while I was busy?

### Dashboard Component Architecture

```typescript
// src/app/dashboard/dashboard.component.ts
import { Component, ChangeDetectionStrategy, inject, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { EventsStore } from '../events/stores/events.store';
import { NotificationStore } from '../notifications/stores/notification.store';
import { ApprovalsStore } from '../approvals/stores/approvals.store';
import { AiStore } from '../ai/stores/ai.store';
import { AuthStore } from '../auth/stores/auth.store';
import { StatusChipComponent } from '../shared/components/status-chip/status-chip.component';
import { SkeletonLoaderComponent } from '../shared/components/skeleton-loader/skeleton-loader.component';
import { PriorityBadgeComponent } from '../shared/components/priority-badge/priority-badge.component';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, StatusChipComponent, SkeletonLoaderComponent, PriorityBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly eventsStore = inject(EventsStore);
  private readonly notificationStore = inject(NotificationStore);
  private readonly approvalsStore = inject(ApprovalsStore);
  private readonly aiStore = inject(AiStore);
  readonly authStore = inject(AuthStore);

  readonly todayEvents = computed(() =>
    this.eventsStore.events().filter(e =>
      new Date(e.starts_at).toDateString() === new Date().toDateString(),
    ),
  );

  readonly criticalEvents = computed(() =>
    this.todayEvents().filter(e => e.priority === 'critical' || e.priority === 'high'),
  );

  readonly unacknowledgedCount = computed(() =>
    this.notificationStore.notifications().filter(n => !n.acknowledged_at).length,
  );

  readonly pendingApprovals = computed(() => this.approvalsStore.pendingApprovals());
  readonly todayBriefing = computed(() => this.aiStore.todayBriefing());
  readonly isLoading = computed(() => this.eventsStore.isLoading());

  ngOnInit(): void {
    this.eventsStore.loadTodayEvents();
    this.notificationStore.loadMyNotifications();
    this.approvalsStore.loadPendingApprovals();
    this.aiStore.loadTodayBriefing();
  }
}
```

---

## 18. Events Domain

### Event State Machine (Visual Reference)

```
DRAFT ──────────────► PENDING_APPROVAL
  ▲                         │
  │ (rejected)        (approved)
  │                         ▼
  └──────────────────── APPROVED
                            │
                       (scheduled)
                            ▼
                        SCHEDULED
                            │
                       (time reached)
                            ▼
                         ACTIVE
                            │
                       (completed)
                            ▼
                        COMPLETED
                            │
                        (archived)

ANY STATE ──────────────► CANCELLED
```

### Event Lifecycle Visualizer Component

```typescript
// src/app/events/components/event-lifecycle/event-lifecycle.component.ts
import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { EventStatus } from '../../services/events.service';

const STATUS_ORDER: EventStatus[] = [
  'draft', 'pending_approval', 'approved', 'scheduled', 'active', 'completed',
];

@Component({
  selector: 'app-event-lifecycle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-2" role="progressbar"
         [attr.aria-valuenow]="currentStep()"
         [attr.aria-valuemin]="0"
         [attr.aria-valuemax]="STATUS_ORDER.length - 1"
         [attr.aria-label]="'Event status: ' + status()">
      @for (step of STATUS_ORDER; track step; let i = $index) {
        <div class="flex items-center gap-2">
          <div
            class="w-3 h-3 rounded-full transition-colors"
            [class]="stepClass(step)"
            [attr.aria-label]="step">
          </div>
          @if (i < STATUS_ORDER.length - 1) {
            <div class="w-8 h-px" [class]="lineClass(i)"></div>
          }
        </div>
      }
    </div>
    <p class="sr-only">Current status: {{ status() }}</p>
  `,
})
export class EventLifecycleComponent {
  readonly status = input.required<EventStatus>();
  readonly STATUS_ORDER = STATUS_ORDER;

  readonly currentStep = computed(() => STATUS_ORDER.indexOf(this.status()));

  stepClass(step: EventStatus): string {
    const current = this.currentStep();
    const stepIndex = STATUS_ORDER.indexOf(step);

    if (this.status() === 'cancelled') return 'bg-red-500';
    if (stepIndex < current) return 'bg-blue-600';
    if (stepIndex === current) return 'bg-blue-800 ring-2 ring-blue-300';
    return 'bg-gray-200';
  }

  lineClass(index: number): string {
    return index < this.currentStep() ? 'bg-blue-600' : 'bg-gray-200';
  }
}
```

---

## 19. Reminders Domain

### Reminder Timing Reference

| Offset | Notification Channel | Behavior |
|--------|---------------------|----------|
| 1440 min (24h) | Push + Email | Initial awareness |
| 120 min (2h) | Push + Email | Final preparation |
| 30 min | Push + WhatsApp | Imminent; one-tap acknowledge |
| Custom | Per policy config | Defined in `reminder_offsets[]` |

### Reminder Escalation Logic

If a `critical` or `high` reminder is not acknowledged within the escalation window, the backend triggers the escalation chain. The frontend must:

1. Show persistent escalation banners for unacknowledged critical reminders
2. Play notification sounds for escalated reminders
3. Highlight escalated items in the dashboard's urgent section

---

## 20. Approvals Domain

### Approval Store

```typescript
// src/app/approvals/stores/approvals.store.ts
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApprovalsService, ApprovalResponse, ApprovalProcess } from '../services/approvals.service';

interface ApprovalsState {
  pendingApprovals: ApprovalResponse[];
  processedApprovals: ApprovalResponse[];
  isLoading: boolean;
  error: string | null;
}

export const ApprovalsStore = signalStore(
  { providedIn: 'root' },
  withState<ApprovalsState>({
    pendingApprovals: [],
    processedApprovals: [],
    isLoading: false,
    error: null,
  }),
  withComputed(({ pendingApprovals }) => ({
    pendingCount: computed(() => pendingApprovals().length),
    hasPendingApprovals: computed(() => pendingApprovals().length > 0),
  })),
  withMethods((store, service = inject(ApprovalsService)) => ({
    async loadPendingApprovals(): Promise<void> {
      // Load approvals across events — query from events with pending_approval status
      patchState(store, { isLoading: true });
      // Implementation fetches events in pending_approval status and aggregates approvals
      patchState(store, { isLoading: false });
    },

    async processApproval(
      eventId: string,
      approvalId: string,
      decision: ApprovalProcess,
    ): Promise<void> {
      const result = await firstValueFrom(
        service.processApproval(eventId, approvalId, decision),
      );
      patchState(store, state => ({
        pendingApprovals: state.pendingApprovals.filter(a => a.id !== approvalId),
        processedApprovals: [...state.processedApprovals, result],
      }));
    },
  })),
);
```

---

## 21. Notifications Domain

### Notification Store

```typescript
// src/app/notifications/stores/notification.store.ts
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NotificationsService, NotificationResponse } from '../services/notifications.service';
import { WebSocketService } from '../../websocket/websocket.service';

interface NotificationState {
  notifications: NotificationResponse[];
  isLoading: boolean;
}

export const NotificationStore = signalStore(
  { providedIn: 'root' },
  withState<NotificationState>({ notifications: [], isLoading: false }),
  withComputed(({ notifications }) => ({
    unreadCount: computed(() =>
      notifications().filter(n => !n.acknowledged_at).length,
    ),
    criticalUnread: computed(() =>
      notifications().filter(n => !n.acknowledged_at && n.priority === 'critical'),
    ),
    byPriority: computed(() => ({
      critical: notifications().filter(n => n.priority === 'critical'),
      high: notifications().filter(n => n.priority === 'high'),
      medium: notifications().filter(n => n.priority === 'medium'),
      low: notifications().filter(n => n.priority === 'low'),
    })),
  })),
  withMethods((store, service = inject(NotificationsService), ws = inject(WebSocketService)) => ({
    async loadMyNotifications(): Promise<void> {
      patchState(store, { isLoading: true });
      const notifications = await firstValueFrom(service.listMyNotifications());
      patchState(store, { notifications, isLoading: false });
    },

    async acknowledge(notificationId: string): Promise<void> {
      const updated = await firstValueFrom(service.acknowledge(notificationId));
      patchState(store, state => ({
        notifications: state.notifications.map(n =>
          n.id === notificationId ? updated : n,
        ),
      }));
    },

    prependNotification(notification: NotificationResponse): void {
      patchState(store, state => ({
        notifications: [notification, ...state.notifications],
      }));
    },
  })),
);
```

### Notification Priority Visual Mapping

| Priority | Border Color | Background | Icon | Behavior |
|----------|-------------|------------|------|----------|
| `critical` | `red-600` | `red-50` | ⚠️ Alert | Sound + persistent banner + mandatory ACK |
| `high` | `orange-500` | `orange-50` | 🔔 Bell | Persistent until acknowledged |
| `medium` | `yellow-500` | `yellow-50` | 📋 | Standard center entry |
| `low` | `gray-300` | `gray-50` | ℹ️ | Silent, center only |

---

## 22. Voice Domain

### Voice Risk Level UI

Commands returned from the API include a `risk_level` field. The UI must **require explicit confirmation** for `high` and `critical` risk levels before calling `confirmCommand`.

```typescript
// src/app/voice/components/voice-confirmation/voice-confirmation.component.ts
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { VoiceCommandResponse } from '../../services/voice.service';

@Component({
  selector: 'app-voice-confirmation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="rounded-lg border-2 p-4"
      [class]="riskBorderClass()"
      role="alertdialog"
      aria-modal="true"
      [attr.aria-label]="'Confirm ' + command().risk_level + ' risk voice command'">

      <div class="flex items-center gap-2 mb-3">
        <span class="font-semibold text-sm uppercase tracking-wide"
              [class]="riskTextClass()">
          {{ command().risk_level }} RISK ACTION
        </span>
      </div>

      <p class="text-gray-800 mb-4">{{ command().command_text }}</p>

      @if (command().parsed_intent) {
        <pre class="text-xs bg-gray-100 rounded p-2 mb-4 overflow-auto">{{ command().parsed_intent | json }}</pre>
      }

      <div class="flex gap-3">
        <button
          type="button"
          (click)="confirmed.emit(true)"
          class="px-4 py-2 rounded bg-blue-700 text-white font-medium hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Confirm
        </button>
        <button
          type="button"
          (click)="confirmed.emit(false)"
          class="px-4 py-2 rounded border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
          Cancel
        </button>
      </div>
    </div>
  `,
})
export class VoiceConfirmationComponent {
  readonly command = input.required<VoiceCommandResponse>();
  readonly confirmed = output<boolean>();

  riskBorderClass(): string {
    const map: Record<string, string> = {
      critical: 'border-red-600 bg-red-50',
      high: 'border-orange-500 bg-orange-50',
      medium: 'border-yellow-500 bg-yellow-50',
      low: 'border-gray-200 bg-white',
    };
    return map[this.command().risk_level] ?? 'border-gray-200';
  }

  riskTextClass(): string {
    const map: Record<string, string> = {
      critical: 'text-red-700',
      high: 'text-orange-700',
      medium: 'text-yellow-700',
      low: 'text-gray-500',
    };
    return map[this.command().risk_level] ?? 'text-gray-500';
  }
}
```

---

## 23. AI / Briefings Domain

### Streaming AI Responses

The backend may stream AI content. The frontend must handle progressive rendering:

```typescript
// src/app/ai/stores/ai.store.ts
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AiService, BriefingResponse } from '../services/ai.service';

interface AiState {
  briefings: BriefingResponse[];
  todayBriefing: BriefingResponse | null;
  isGenerating: boolean;
}

export const AiStore = signalStore(
  { providedIn: 'root' },
  withState<AiState>({ briefings: [], todayBriefing: null, isGenerating: false }),
  withComputed(({ todayBriefing }) => ({
    hasTodayBriefing: computed(() => !!todayBriefing()),
    briefingContent: computed(() => todayBriefing()?.content ?? null),
  })),
  withMethods((store, service = inject(AiService)) => ({
    async loadTodayBriefing(): Promise<void> {
      const list = await firstValueFrom(service.listBriefings());
      const today = new Date().toISOString().split('T')[0];
      const briefing = list.items.find(b => b.briefing_date === today) ?? null;
      patchState(store, { todayBriefing: briefing });
    },

    async generateBriefing(executiveId: string): Promise<void> {
      patchState(store, { isGenerating: true });
      const today = new Date().toISOString().split('T')[0];
      const briefing = await firstValueFrom(
        service.generateBriefing({ briefing_date: today, executive_id: executiveId }),
      );
      patchState(store, { todayBriefing: briefing, isGenerating: false });
    },
  })),
);
```

---

## 24. Integrations Domain

### OAuth Flow Architecture

1. User clicks "Connect Google Calendar"
2. Frontend redirects to Google OAuth via backend-provided URL
3. Google redirects back with `?code=...`
4. Frontend calls `POST /api/v1/integrations/connect` with `{ provider, auth_code, redirect_uri }`
5. Backend exchanges code for tokens and stores
6. Frontend shows connected state

```typescript
// src/app/integrations/services/oauth.service.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IntegrationsService, IntegrationProvider } from './integrations.service';
import { OrganizationStore } from '../../organizations/stores/organization.store';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OAuthService {
  private readonly integrationsService = inject(IntegrationsService);
  private readonly orgStore = inject(OrganizationStore);
  private readonly router = inject(Router);

  async handleCallback(code: string, provider: IntegrationProvider): Promise<void> {
    const redirectUri = `${window.location.origin}/integrations/callback`;
    await firstValueFrom(
      this.integrationsService.connect({ provider, auth_code: code, redirect_uri: redirectUri }),
    );
    await this.router.navigate(['/integrations']);
  }
}
```

---

## 25. Audit Domain

The audit system is read-only and append-only. No mutations allowed.

```typescript
// src/app/audit/audit.component.ts
// Audit log is immutable — display only
// Implement with:
// - GET /api/v1/rbac/* for role history
// - Event history via event status transitions
// - Filter by actor, date range, action type
// - Export to CSV support
```

---

## 26. Design System — Tokens, Typography, Color

### CSS Custom Properties (Design Tokens)

```css
/* src/styles/tokens.css */
:root {
  /* ─── Color — Semantic ─────────────────────────────── */
  --color-critical:      #DC2626; /* Red — emergency, escalation */
  --color-high:          #EA580C; /* Orange — board meetings, reviews */
  --color-medium:        #CA8A04; /* Yellow — internal reviews */
  --color-info:          #2563EB; /* Blue — updates, informational */
  --color-success:       #16A34A; /* Green — confirmed, completed */
  --color-neutral:       #6B7280; /* Gray — default, inactive */

  /* ─── Color — Neutrals ─────────────────────────────── */
  --color-surface:       #FFFFFF;
  --color-surface-alt:   #F9FAFB;
  --color-border:        #E5E7EB;
  --color-border-strong: #D1D5DB;
  --color-text-primary:  #111827;
  --color-text-secondary:#6B7280;
  --color-text-muted:    #9CA3AF;

  /* ─── Typography ───────────────────────────────────── */
  --font-family:         'Inter', 'Manrope', system-ui, sans-serif;
  --font-display:        32px; font-weight: 700;
  --font-h1:             24px; font-weight: 600;
  --font-h2:             18px; font-weight: 600;
  --font-h3:             14px; font-weight: 600;
  --font-body:           13px; font-weight: 400;
  --font-caption:        11px; font-weight: 400;
  --font-label:          12px; font-weight: 500;

  /* ─── Spacing Scale ────────────────────────────────── */
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-6:   24px;
  --space-8:   32px;
  --space-12:  48px;
  --space-16:  64px;

  /* ─── Elevation ────────────────────────────────────── */
  --shadow-card:     0 1px 3px rgba(0,0,0,0.1);
  --shadow-elevated: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-overlay:  0 10px 25px rgba(0,0,0,0.15);

  /* ─── Border Radius ────────────────────────────────── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-full: 9999px;

  /* ─── Transitions ──────────────────────────────────── */
  --transition-fast:   100ms ease;
  --transition-base:   200ms ease;
  --transition-slow:   300ms ease;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface:       #0F172A;
    --color-surface-alt:   #1E293B;
    --color-border:        #1E293B;
    --color-border-strong: #334155;
    --color-text-primary:  #F1F5F9;
    --color-text-secondary:#94A3B8;
    --color-text-muted:    #64748B;
  }
}
```

### Tailwind Config Extension

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        critical: '#DC2626',
        'critical-bg': '#FEF2F2',
        priority-high: '#EA580C',
        'priority-high-bg': '#FFF7ED',
        'priority-medium': '#CA8A04',
        'priority-medium-bg': '#FEFCE8',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.1)',
        elevated: '0 4px 6px rgba(0,0,0,0.1)',
        overlay: '0 10px 25px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## 27. Shared Component Library

### Status Chip Component

```typescript
// src/app/shared/components/status-chip/status-chip.component.ts
import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { EventStatus } from '../../../events/services/events.service';

const STATUS_CONFIG: Record<EventStatus, { label: string; classes: string }> = {
  draft:            { label: 'Draft',            classes: 'bg-gray-100 text-gray-700' },
  pending_approval: { label: 'Pending Approval', classes: 'bg-yellow-100 text-yellow-800' },
  approved:         { label: 'Approved',         classes: 'bg-blue-100 text-blue-800' },
  scheduled:        { label: 'Scheduled',        classes: 'bg-indigo-100 text-indigo-800' },
  active:           { label: 'Active',           classes: 'bg-green-100 text-green-800' },
  completed:        { label: 'Completed',        classes: 'bg-green-200 text-green-900' },
  cancelled:        { label: 'Cancelled',        classes: 'bg-red-100 text-red-700' },
  escalated:        { label: 'Escalated',        classes: 'bg-orange-100 text-orange-800' },
};

@Component({
  selector: 'app-status-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      [class]="config().classes"
      [attr.aria-label]="'Status: ' + config().label">
      {{ config().label }}
    </span>
  `,
})
export class StatusChipComponent {
  readonly status = input.required<EventStatus>();
  readonly config = computed(() => STATUS_CONFIG[this.status()]);
}
```

### Priority Badge Component

```typescript
// src/app/shared/components/priority-badge/priority-badge.component.ts
import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { EventPriority } from '../../../events/services/events.service';

const PRIORITY_CONFIG: Record<EventPriority, { label: string; dot: string; text: string }> = {
  critical: { label: 'Critical', dot: 'bg-red-600',    text: 'text-red-700' },
  high:     { label: 'High',     dot: 'bg-orange-500', text: 'text-orange-700' },
  medium:   { label: 'Medium',   dot: 'bg-yellow-500', text: 'text-yellow-700' },
  low:      { label: 'Low',      dot: 'bg-gray-400',   text: 'text-gray-500' },
};

@Component({
  selector: 'app-priority-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-1.5" [attr.aria-label]="'Priority: ' + config().label">
      <span class="w-2 h-2 rounded-full" [class]="config().dot" aria-hidden="true"></span>
      <span class="text-xs font-medium" [class]="config().text">{{ config().label }}</span>
    </span>
  `,
})
export class PriorityBadgeComponent {
  readonly priority = input.required<EventPriority>();
  readonly config = computed(() => PRIORITY_CONFIG[this.priority()]);
}
```

### Skeleton Loader Component

```typescript
// src/app/shared/components/skeleton-loader/skeleton-loader.component.ts
import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="animate-pulse"
      [attr.aria-label]="'Loading ' + label()"
      role="status">
      @for (row of rows(); track $index) {
        <div class="h-4 bg-gray-200 rounded mb-3" [style.width]="row"></div>
      }
    </div>
  `,
})
export class SkeletonLoaderComponent {
  readonly label = input('content');
  readonly rows = input<string[]>(['100%', '85%', '70%']);
}
```

### Toast Service

```typescript
// src/app/shared/components/toast/toast.service.ts
import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  private push(type: ToastType, message: string, duration = 4000): void {
    const id = crypto.randomUUID();
    this.toasts.update(t => [...t, { id, type, message, duration }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string): void { this.push('success', message); }
  error(message: string): void   { this.push('error', message, 6000); }
  warning(message: string): void { this.push('warning', message); }
  info(message: string): void    { this.push('info', message); }

  dismiss(id: string): void {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
```

---

## 28. Progressive Web App (PWA) Configuration

### Service Worker Strategy

```json
// ngsw-config.json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": ["/favicon.ico", "/index.html", "/manifest.webmanifest", "/*.css", "/*.js"]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": ["/assets/**", "/*.(svg|cur|jpg|jpeg|png|apng|webp|avif|gif|otf|ttf|woff|woff2)"]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-user-data",
      "urls": ["/api/v1/auth/**", "/api/v1/users/**"],
      "cacheConfig": {
        "maxSize": 100,
        "maxAge": "1h",
        "timeout": "10s",
        "strategy": "freshness"
      }
    },
    {
      "name": "api-events",
      "urls": ["/api/v1/events/**"],
      "cacheConfig": {
        "maxSize": 500,
        "maxAge": "15m",
        "timeout": "10s",
        "strategy": "freshness"
      }
    },
    {
      "name": "api-notifications",
      "urls": ["/api/v1/notifications/**"],
      "cacheConfig": {
        "maxSize": 200,
        "maxAge": "5m",
        "timeout": "5s",
        "strategy": "freshness"
      }
    },
    {
      "name": "api-static",
      "urls": ["/api/v1/rbac/**", "/api/v1/organizations/**"],
      "cacheConfig": {
        "maxSize": 50,
        "maxAge": "1h",
        "timeout": "10s",
        "strategy": "performance"
      }
    }
  ]
}
```

### Web App Manifest

```json
// src/manifest.webmanifest
{
  "name": "Remindly Executive",
  "short_name": "Remindly",
  "description": "Executive AI Assistant — Operational Command Center",
  "theme_color": "#1E3A5F",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [
    { "src": "assets/icons/icon-72x72.png",   "sizes": "72x72",   "type": "image/png" },
    { "src": "assets/icons/icon-96x96.png",   "sizes": "96x96",   "type": "image/png" },
    { "src": "assets/icons/icon-128x128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "assets/icons/icon-144x144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "assets/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "assets/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Offline Queue Service

```typescript
// src/app/core/services/offline-queue.service.ts
import { Injectable } from '@angular/core';

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body: unknown;
  headers: Record<string, string>;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class OfflineQueueService {
  private readonly DB_NAME = 'remindly-offline-queue';
  private readonly STORE_NAME = 'requests';

  async enqueue(request: Omit<QueuedRequest, 'id' | 'timestamp'>): Promise<void> {
    const db = await this.openDb();
    const tx = db.transaction(this.STORE_NAME, 'readwrite');
    tx.objectStore(this.STORE_NAME).add({
      ...request,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    });
  }

  async flush(executor: (req: QueuedRequest) => Promise<void>): Promise<void> {
    const db = await this.openDb();
    const tx = db.transaction(this.STORE_NAME, 'readwrite');
    const store = tx.objectStore(this.STORE_NAME);
    const requests = await this.getAll(store);

    for (const req of requests) {
      try {
        await executor(req);
        store.delete(req.id);
      } catch {
        // Leave in queue for next flush attempt
      }
    }
  }

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private getAll(store: IDBObjectStore): Promise<QueuedRequest[]> {
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as QueuedRequest[]);
      req.onerror = () => reject(req.error);
    });
  }
}
```

---

## 29. Error Handling Architecture

### Error State Types

Every feature page must handle these states explicitly:

| HTTP Status | Component Behavior | Example UX |
|-------------|-------------------|------------|
| 401 | Interceptor handles → redirect login | Toast: "Session expired" |
| 403 | Show permission denied UI | Inline: "You don't have access" |
| 404 | Show empty/not-found state | Inline: "Event not found" |
| 409 | Workflow conflict warning | Modal: "Schedule conflict detected" |
| 422 | Highlight form field errors | Inline field validation |
| 500 | System error with retry | Toast + retry button |
| 0 (offline) | Offline mode banner | Persistent: "Working offline" |

---

## 30. Performance Engineering

### Target Metrics

| Metric | Target | Tool |
|--------|--------|------|
| Initial Load (TTI) | < 3 seconds | Lighthouse |
| Route Transition | < 300ms | Angular DevTools |
| WebSocket Reconnect | < 5 seconds | Manual |
| Dashboard Render | < 1 second | Chrome DevTools |
| Lighthouse PWA Score | ≥ 90 | Lighthouse |
| Lighthouse Accessibility | ≥ 90 | Lighthouse / axe |
| Lighthouse Performance | ≥ 85 | Lighthouse |

### Optimization Rules

1. **Lazy load every feature route** — no eager domain loading
2. **OnPush everywhere** — `ChangeDetectionStrategy.OnPush` on every component
3. **Virtual scroll** — use CDK `VirtualScrollViewport` for lists > 50 items
4. **Skeleton screens** — never show spinners for page-level loads
5. **Preload strategies** — use `PreloadAllModules` or `QuicklinkStrategy` for secondary routes
6. **Track by ID** — always use `track` in `@for` loops
7. **Avoid computed in templates** — push derived state into `computed()` signals
8. **Debounce search inputs** — 300ms debounce on all search/filter inputs
9. **Avoid inline functions in templates** — extract to computed signals

---

## 31. Security Requirements

### Token Storage

```
Preferred: HttpOnly Secure cookies (set by backend on login)
Fallback:  sessionStorage (NOT localStorage) for SPA token
```

> Never store JWT in `localStorage`. If cookies are not available, use `sessionStorage` and implement silent token refresh before expiry.

### XSS Prevention

- Never use `innerHTML` or `[innerHTML]` binding with user-provided content
- Always use Angular's native template binding
- Sanitize content from external integrations using `DomSanitizer`
- Never trust `document.write` or dynamic `<script>` injection

### Secrets & API Keys

- Never embed API keys in frontend code
- All sensitive values come from environment injected at build time
- Never log `Authorization` headers

### Content Security Policy (set by hosting layer)

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' wss: https://api.anthropic.com;
  img-src 'self' data: https:;
  frame-src 'none';
```

---

## 32. Accessibility Standards

### Minimum Requirements (WCAG 2.1 AA)

| Requirement | Implementation |
|-------------|---------------|
| Keyboard navigation | Every interactive element focusable and operable with keyboard |
| Focus visibility | `focus:ring-2 focus:ring-blue-500` on all interactive elements |
| ARIA labels | All icons, badges, and non-text content have `aria-label` |
| Color contrast | Minimum 4.5:1 for body text; 3:1 for large text |
| Touch targets | Minimum 44×44px for all interactive elements |
| Screen reader | All dynamic content wrapped in live regions |
| Status updates | `role="status"` or `role="alert"` for async state changes |
| Form labels | Every input has an associated `<label>` |
| Error messages | Errors linked to inputs via `aria-describedby` |

### Live Region Pattern for Realtime Updates

```html
<!-- Notification count live region -->
<span aria-live="polite" aria-atomic="true" class="sr-only">
  {{ unreadCount() }} unread notifications
</span>
```

### Focus Management — Modal Pattern

```typescript
// When opening a dialog, focus the first focusable element
// When closing, return focus to the trigger element
// Use Angular CDK's FocusTrap for modals
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
```

---

## 33. Testing Strategy

### Testing Pyramid

```
         ┌─────────────┐
         │  E2E (5%)   │  Playwright — critical user journeys
         ├─────────────┤
         │ Integration │  Component + service integration
         │   (25%)     │  Spectator or TestBed
         ├─────────────┤
         │  Unit (70%) │  Vitest — signals, services, pipes
         └─────────────┘
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    coverage: {
      reporter: ['text', 'lcov'],
      exclude: ['**/*.routes.ts', '**/index.ts', '**/*.spec.ts'],
      thresholds: { lines: 80, functions: 80, branches: 70 },
    },
  },
});
```

### Critical Test Areas

| Area | What to Test | Key Scenarios |
|------|-------------|---------------|
| Auth interceptor | Token injection | Token present, token absent, expired |
| Org interceptor | Header injection | Active org, no org, org switch |
| Permission guard | Route protection | Permitted, denied, missing permission |
| RbacStore | `hasPermission()` | Exact match, missing key, empty perms |
| Auth store | `isAuthenticated` computed | With token+user, missing either |
| Events lifecycle | State transitions | All valid transitions, invalid transitions |
| WS service | Reconnect logic | Disconnect, reconnect, max retries |
| Notification store | `unreadCount` | Empty, all read, mixed |
| Error interceptor | Status handling | 401, 403, 404, 500, 0 |

### E2E Critical User Journeys (Playwright)

```
1. Executive login → dashboard loads in < 5s → see today's events
2. Secretary creates event → requests approval → executive approves → event scheduled
3. Reminder notification received → executive acknowledges → escalation NOT triggered
4. Voice command submitted → risk warning shown → confirmed → event created
5. Organization switch → data reloads → previous org data not visible
6. Offline → create event → reconnect → sync succeeds
```

---

## 34. DevOps, CI/CD & Deployment

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm run test:ci
      - run: pnpm run build --configuration production

  e2e:
    needs: quality
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps
      - run: pnpm run e2e:ci

  deploy-staging:
    needs: quality
    runs-on: ubuntu-latest
    environment: staging
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build --configuration staging
      - uses: vercel/actions/deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: [quality, e2e]
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build --configuration production
      - uses: vercel/actions/deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Environment Strategy

| Environment | Branch | Backend | Purpose |
|-------------|--------|---------|---------|
| Local | feature/* | localhost:8000 | Individual developer |
| Staging | develop | staging API | Pre-production QA |
| Production | main | production API | Live users |

### Hosting Recommendations

| Layer | Service | Rationale |
|-------|---------|-----------|
| Frontend | Vercel | Edge-optimized, PWA-ready, preview URLs |
| CDN | Cloudflare | Global edge, DDoS protection, SSL |
| Backend | Railway / Render | Managed containers, auto-scaling |
| Database | Managed PostgreSQL | Automated backups, failover |

---

## 35. Development Phases & Milestones

### Phase 1 — Foundation (Weeks 1–8)

**Goal:** Working application shell with auth, routing, and API client

Deliverables:
- [ ] Angular 21 project scaffolded with Tailwind, strict TS
- [ ] Auth domain complete (login, token, session persistence)
- [ ] Multi-org context and interceptors
- [ ] RBAC store and permission hydration
- [ ] Layout shell (sidebar, topbar, org switcher)
- [ ] All feature route stubs (lazy-loaded)
- [ ] OpenAPI type generation pipeline
- [ ] All domain services generated from OpenAPI
- [ ] PWA manifest and service worker configured
- [ ] Design tokens and Tailwind config complete
- [ ] CI/CD pipeline running

**Exit criteria:** Developer can log in, see the shell, and make authenticated API calls to all endpoints.

### Phase 2 — Core Workflows (Weeks 9–16)

**Goal:** Production-usable daily operations for executives and secretaries

Deliverables:
- [ ] Executive dashboard (5-second rule validated)
- [ ] Events domain: create, update, lifecycle visualization
- [ ] Approvals inbox and processing
- [ ] Notifications center with priority visualization
- [ ] Reminders acknowledgement flow
- [ ] WebSocket connection with reconnect logic
- [ ] Live dashboard updates via WebSocket
- [ ] Secretary dense interface
- [ ] Mobile responsive layouts

**Exit criteria:** Executive can manage a full event lifecycle from creation to completion.

### Phase 3 — Realtime + Intelligence (Weeks 17–24)

**Goal:** Live, intelligent experience

Deliverables:
- [ ] Full WebSocket event handling for all domains
- [ ] Voice command UI with risk-level confirmation
- [ ] AI daily briefings UI with streaming display
- [ ] Meeting summary generation
- [ ] AI voice parsing → event creation flow
- [ ] Presence indicators
- [ ] Live notification toasts
- [ ] Escalation banners

**Exit criteria:** Platform feels live; executives receive briefings and can use voice commands.

### Phase 4 — Enterprise Hardening (Weeks 25–32)

**Goal:** Production-ready for enterprise procurement

Deliverables:
- [ ] Calendar integrations (Google, Outlook OAuth)
- [ ] Audit log viewer with search and export
- [ ] Analytics dashboard with ECharts
- [ ] Full PWA offline support with IndexedDB queue
- [ ] Offline → online sync
- [ ] WCAG 2.1 AA compliance validated (axe audit)
- [ ] Lighthouse scores ≥ 90 PWA / ≥ 90 Accessibility / ≥ 85 Performance
- [ ] Full E2E test suite
- [ ] Unit test coverage ≥ 80%
- [ ] Security audit pass
- [ ] Load testing validated

**Exit criteria:** System passes all quality gates. Enterprise demo-ready.

---

## 36. Engineering Anti-Patterns (NEVER DO)

### Frontend Anti-Patterns

| ❌ Anti-Pattern | ✅ Correct Approach |
|----------------|-------------------|
| `standalone: true` in decorator | Omit — it's default in Angular 21 |
| `@HostBinding` / `@HostListener` | Use `host: {}` object in decorator |
| `*ngIf`, `*ngFor`, `*ngSwitch` | Use `@if`, `@for`, `@switch` |
| `ngClass` directive | Use `[class]` binding |
| `ngStyle` directive | Use `[style]` binding |
| `constructor(private svc: Service)` | Use `inject(Service)` |
| `this.signal.mutate()` | Use `signal.update()` or `signal.set()` |
| `any` type | Use proper types or `unknown` |
| `localStorage` for JWT | Use session storage or httpOnly cookies |
| Hardcoded API URLs in components | Use `API_CONFIG` injection token |
| Hardcoded permissions in templates | Use `appPermission` directive |
| `new Date()` in templates | Use `DatePipe` or computed signals |
| Complex logic in templates | Extract to `computed()` signals |
| Deeply nested navigation | Max 3 levels for critical actions |
| Bootstrap or any CSS framework | Tailwind CSS only |
| Glassmorphism effects | Subtle shadows, enterprise aesthetics |
| Chat widget for AI | Structured briefing cards and forms |
| AI-autonomous actions | Always require human confirmation |

### State Anti-Patterns

| ❌ | ✅ |
|---|---|
| Local component state for cross-domain data | Use appropriate Signal Store |
| Direct mutation of store state | Use `patchState()` |
| Nested subscriptions | Use RxJS operators or `firstValueFrom` |
| Observable chaining without completion | Always unsubscribe or use `take(1)` |

---

## 37. Quality Gates Checklist

Every feature PR must pass all items before merge:

### Code Quality
- [ ] No `any` types in TypeScript
- [ ] All components use `ChangeDetectionStrategy.OnPush`
- [ ] All components use `input()` / `output()` functions
- [ ] All services use `inject()` function
- [ ] No `standalone: true` in decorators
- [ ] No `@HostBinding` / `@HostListener` decorators
- [ ] All templates use `@if`, `@for`, `@switch`
- [ ] ESLint passes with zero errors
- [ ] No `console.log` in production code

### Functionality
- [ ] Feature works in latest Chrome, Firefox, Safari
- [ ] Feature works on mobile (375px viewport)
- [ ] Loading states shown during all async operations
- [ ] Empty states shown when collections are empty
- [ ] Error states handle all HTTP error codes
- [ ] Realtime updates reflected without page refresh
- [ ] Feature respects user role permissions
- [ ] Organization context correctly applied

### Accessibility
- [ ] AXE browser extension reports zero violations
- [ ] Keyboard-only navigation works for entire feature
- [ ] All images have meaningful alt text or `aria-hidden`
- [ ] All interactive elements have visible focus ring
- [ ] Color contrast ratio ≥ 4.5:1 for all text
- [ ] Dynamic content changes announced via live regions
- [ ] Form fields have associated labels
- [ ] Error messages linked to fields via `aria-describedby`

### Performance
- [ ] Component uses `OnPush` change detection
- [ ] Lists > 50 items use virtual scrolling
- [ ] `@for` loops use `track` by ID
- [ ] No inline functions in templates
- [ ] Feature route is lazy-loaded
- [ ] No unnecessary `ngOnInit` data loading duplications

### PWA / Offline
- [ ] New API calls added to `ngsw-config.json` data groups
- [ ] Offline state gracefully shown for network-dependent features
- [ ] No `localStorage` usage anywhere

### Security
- [ ] No user input rendered via `innerHTML`
- [ ] No API keys or secrets in source code
- [ ] Permissions validated on backend (not just frontend)

### Testing
- [ ] Unit tests cover all business logic ≥ 80%
- [ ] Signal computations have unit tests
- [ ] Service methods have unit tests
- [ ] E2E test exists for any new critical user journey

---

*Document maintained by: Principal Architecture Team — SafariStack Solutions*  
*Version: 1.0.0 | Updated: May 2026 | Next review: Phase 2 completion*

---

> **This document is the single source of truth. Any implementation decision that deviates from this blueprint requires written approval from the Principal Architect and must be documented as an architectural decision record (ADR) before the code is merged.**
