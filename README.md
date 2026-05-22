# Remindly — Executive AI Assistant

Enterprise-grade operational command center for executives. Events, reminders, approvals, AI briefings, document management, team administration — all in one PWA.

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **pnpm** 11.x (`corepack enable pnpm` or `npm i -g pnpm@11`)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Point to your backend

Edit **`src/environments/environment.ts`** (development) and **`src/environments/environment.production.ts`** (production):

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'https://YOUR_BACKEND_URL',     // ← your backend API root
  wsBaseUrl: 'wss://YOUR_BACKEND_URL',         // ← your WebSocket root
  appName: 'Remindly',
  appEnv: 'development',
  enableAnalytics: false,
};
```

> The frontend appends `/api/v1/...` to `apiBaseUrl` automatically.
> Use `http://` / `ws://` for local dev, `https://` / `wss://` for production.

### 3. Run

```bash
pnpm start            # → http://localhost:4200
```

---

## Architecture

| Layer | Stack |
|-------|-------|
| Framework | Angular 21.2 + Vite (`@angular/build`) |
| Language | TypeScript 5.9 |
| State Mgmt | `@ngrx/signals` (signalStore) + class-based signals |
| Styling | Tailwind CSS v4 + custom design tokens (`src/styles/tokens.css`) |
| Fonts | **Modern Antiqua** (headings) — Google Fonts; **DM Sans** (body) |
| PWA | `@angular/service-worker` + custom `sw.js` wrapping `ngsw-worker.js` |
| HTTP | Custom `BaseApiClient` — prepends `environment.apiBaseUrl`; JSON `{ success, data }` |
| WebSocket | Custom `websocket.store` — connects to `wsBaseUrl` on shell init |
| Charts | ECharts via `ngx-echarts` |
| CI/CD | Netlify (`netlify.toml`), GitHub Actions (`.github/workflows/ci.yml`) |

---

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin panel: users, orgs, members (gated by admin.access)
│   ├── ai/             # AI briefing generator & card
│   ├── analytics/      # Charts & analytics dashboard
│   ├── api/            # BaseApiClient + API config token
│   ├── approvals/      # Event approval workflow (Secretary / Executive)
│   ├── audit/          # Audit log viewer
│   ├── auth/           # Login, RBAC store (permissions cached to sessionStorage)
│   ├── calendar/       # Calendar view of events
│   ├── core/           # Guards, interceptors, PWA install service, offline queue
│   ├── dashboard/      # Command center home — stats, schedule, alerts, briefing
│   ├── documents/      # Document registry — upload, review, approve/reject, reports
│   ├── events/         # Full event CRUD with lifecycle, reminders, external participants
│   ├── integrations/   # Third-party integration settings
│   ├── layout/         # Shell, sidebar, topbar, mobile bottom nav
│   ├── not-found/      # 404 page
│   ├── notifications/  # Notification list & WebSocket-driven store
│   ├── organizations/  # Organization switch & settings
│   ├── push/           # Push subscription via SwPush (VAPID)
│   ├── reminders/      # Reminder policy management
│   ├── settings/       # User & organization settings, PWA install
│   ├── shared/         # Directives, pipes, reusable components (confirm-dialog, toast, etc.)
│   ├── voice/          # Voice interface & history
│   └── websocket/      # WebSocket service & store
├── environments/       # environment.ts / environment.production.ts
├── styles/             # tokens.css (design tokens)
├── index.html          # Entry HTML
├── main.ts             # Bootstrap
└── sw.js               # Custom service worker (push + notificationclick)
```

---

## Routes

All authenticated routes are lazy-loaded. Route guards use `permissionGuard('permission.name')`.

| Path | Guard | Description |
|------|-------|-------------|
| `/auth/login` | `loginGuard` | Login page |
| `/dashboard` | — | Command center home |
| `/calendar` | `events.read` or `audit.read` | Calendar view |
| `/events` | `events.read` | Event list, create, detail, edit |
| `/events/:id` | `events.read` | Event detail with lifecycle |
| `/approvals` | `events.approve` | Approval inbox |
| `/notifications` | `notifications.send` | Notification history |
| `/documents` | `documents.read` | Document registry (list, upload, detail, report) |
| `/ai` | — | AI briefing |
| `/analytics` | — | Analytics dashboard |
| `/integrations` | `integrations.manage` | Integration settings |
| `/audit` | `audit.read` | Audit log |
| `/settings` | `organizations.manage` | User & org settings |
| `/admin` | `admin.access` | Admin panel (users, orgs, members) |
| `/admin/users` | `admin.access` | User management |
| `/admin/organizations` | `admin.access` | Organization management |
| `/admin/members` | `admin.access` | Member management |

---

## RBAC & Permissions

Permissions are fetched from `GET /api/v1/rbac/my` on login and cached in `sessionStorage` (`remindly_permissions`, `remindly_roles`). On page reload, they are restored before any route guard runs to prevent redirect loops.

| Permission | Description |
|------------|-------------|
| `events.read` | View events & calendar |
| `events.create` | Create events |
| `events.edit` | Edit events |
| `events.delete` | Delete events |
| `events.approve` | Approve/reject events |
| `notifications.send` | Send & view notifications |
| `documents.read` | View documents |
| `documents.upload` | Upload documents |
| `documents.approve` | Approve/reject documents |
| `documents.delete` | Delete documents |
| `integrations.manage` | Manage integrations |
| `audit.read` | View audit log |
| `organizations.manage` | Manage organization settings |
| `admin.access` | Access admin panel |

### Roles

| Role | Capabilities |
|------|-------------|
| **Secretary** | Create/edit own events, view own non-approved events |
| **Executive** | Full CRUD on all events, approve/reject/delete, full document access |
| **Admin** | All Executive + `admin.access` (user/org/member management) |

---

## Backend Configuration

### Required Backend Endpoints

The frontend expects your backend to serve these endpoints **under `apiBaseUrl`**:

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/auth/login` | Login — returns `{ success, data: { token, user } }` |
| `GET /api/v1/rbac/my` | Current user's permissions & roles |
| `/api/v1/events/**` | Event CRUD, approval, lifecycle |
| `/api/v1/documents/**` | Document registry (upload, list, detail, approve/reject, report, delete) |
| `/api/v1/admin/**` | Admin panel (users, orgs, members, roles) |
| `/api/v1/notifications/**` | Notifications |
| `/api/v1/push/**` | Push subscription (VAPID public key at `GET /push/vapid-key`) |
| `/api/v1/ai/**` | AI briefing |
| `/api/v1/analytics/**` | Analytics data |
| `/api/v1/voice/**` | Voice interface |
| `/api/v1/integrations/**` | Integration settings |
| `/api/v1/audit/**` | Audit log |
| `/api/v1/settings/**` | User & organization settings |
| `/api/v1/organizations/**` | Organization data |
| `wss://YOUR_BACKEND_URL/api/v1/ws` | WebSocket for real-time notifications |

### Response Format

All backend responses **must** follow this shape:

```json
{ "success": true, "data": { ... } }
{ "success": false, "detail": "Error message" }
```

The `BaseApiClient` parses `response.data` on success and throws on failure.

### Authentication

After login, the backend returns a token. The frontend sends it as `Authorization: Bearer <token>` on every request (handled by `auth.interceptor.ts`).

### Push Notifications

Your backend must:

1. Expose VAPID public key at `GET /api/v1/push/vapid-key`
2. Accept subscription registration at `POST /api/v1/push/subscribe` (body: `{ endpoint, keys: { p256dh, auth } }`)
3. Send Web Push messages in this format:

```json
{
  "notification": {
    "title": "Meeting Reminder",
    "body": "Board review in 15 minutes",
    "icon": "/icons/icon-192.png",
    "tag": "event-42",
    "data": { "url": "/events/42" }
  }
}
```

### Document Upload

`POST /api/v1/documents/upload` expects `multipart/form-data` with fields:
- `file` — the uploaded file
- `title` — document title (string)
- `description` (optional) — document description

---

## Environment

Configure your backend URL in the environment files:

```ts
// src/environments/environment.ts         — development (ng serve)
// src/environments/environment.production.ts — production (ng build --prod)
```

| Variable | Development (default) | Production (update me) |
|----------|-----------------------|------------------------|
| `apiBaseUrl` | `http://localhost:8000` | `https://YOUR_BACKEND_URL` |
| `wsBaseUrl` | `ws://localhost:8000` | `wss://YOUR_BACKEND_URL` |

---

## PWA

- **Service worker**: `src/sw.js` imports `ngsw-worker.js` via `importScripts`, adds push notification handling
- **Push**: uses Angular's `SwPush.requestSubscription()` with VAPID public key from `GET /api/v1/push/vapid-key`
- **Install prompt**: `PwaInstallService` captures `beforeinstallprompt` event; triggered from Settings page or sidebar
- **Manifest**: `public/manifest.webmanifest` — standalone display, shortcuts (Dashboard, Events, Notifications)
- **Offline**: `ngsw-config.json` caches API data groups with freshness/performance strategies

---

## Mobile

- < 1024px: sidebar hidden, bottom tab bar (Home, Calendar, Events, Alerts, More) with slide-up "More" sheet
- Topbar compact (52px) with dynamic page title; modals → bottom sheets; tables → stacked cards
- Safe-area padding via `viewport-fit=cover`; `user-scalable=no` for native feel

---

## Design Tokens

All colors, fonts, and spacing are defined in `src/styles/tokens.css` (injected into Tailwind via `@import`):

- **Ocean palette**: `--ocean-50` (lightest) through `--ocean-950` (darkest)
- **Warm neutrals**: `--warm-50` through `--warm-950` (ivory/sand tones)
- **Accents**: `--gold-400` / `--gold-500`, `--pine-500` / `--pine-600`
- **Fonts**: `--font-heading: 'Modern Antiqua'` / `--font-body: 'DM Sans'`
- **Shadows**: `--shadow-sm` through `--shadow-xl` — warm-tinted

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Dev server (`http://localhost:4200`) |
| `pnpm build` | Default build (production configuration) |
| `pnpm build:production` | Production build |
| `pnpm lint` | ESLint |
| `pnpm test:coverage` | Unit tests with coverage |
| `pnpm test:e2e` | Playwright E2E tests |
| `pnpm prettier:check` | Check formatting |
| `pnpm prettier:write` | Format all files |

---

## Deployment

### Netlify

`netlify.toml` handles:
- Build: `pnpm run build:production` → publish `dist/Remindly/browser`
- SPA redirects: `/*` → `/index.html` (status 200)
- Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Cache headers: JS/CSS/assets immutable (1 year), service worker uncacheable

### Manual

```bash
pnpm build:production
# Serve dist/Remindly/browser/ with any static server
```

---

## Service Worker Caching

`ngsw-config.json` defines data groups for every API namespace. All API routes use `freshness` strategy (network-first) except RBAC, organizations, and settings which use `performance` (cache-first) for faster reloads.

Navigation URLs pattern: `/**` (all routes), excluding `!**/*.*` (static files).

---

## Troubleshooting

- **Backend 404**: Router not registered or Alembic migration not applied on your backend. Verify endpoints exist.
- **Backend 422 (document upload)**: Check the `detail` field in the response for validation rules (field names, allowed MIME types).
- **Push notifications not appearing**: Backend must send `{ notification: { title, body, icon, tag, data: { url } } }` format. Verify VAPID keys are configured.
- **Permissions empty on reload**: Check `sessionStorage` for `remindly_permissions` and `remindly_roles` — hydrate happens in `auth.store.ts:hydrateFromStorage()`.
- **Build too large**: Initial budget is 3MB warning / 4MB error. Production build gzip transfer is ~262KB.
