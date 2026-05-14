# API Integration Alignment Report

**Generated:** 2026-05-14  
**Scope:** Backend ↔ Frontend contract verification  
**Methodology:** Cross-referenced API integration document against actual backend code (FastAPI routes, OpenAPI spec, WebSocket handlers) and frontend implementation (Angular services, stores, interceptors).

---

## Executive Summary

| Category | Status |
|----------|--------|
| ✅ Strong Alignment | All core CRUD endpoints, auth flow, RBAC, error handling, PWA shell |
| ⚠️ Minor | 5 items needing small adjustments |
| ❌ Critical | 2 items requiring immediate action |

---

## ✅ Strong Alignment — All Correct

| Area | Detail | Verified |
|------|--------|----------|
| **Login** | `POST /api/v1/auth/login` returns `{ access_token, user }` | ✅ |
| **Auth headers** | `Authorization: Bearer <token>` via `auth.interceptor.ts` | ✅ |
| **Org header** | `X-Organization-ID` via `organization.interceptor.ts` | ✅ |
| **Current user** | `GET /api/v1/auth/me` via `AuthService.getCurrentUser()` | ✅ |
| **Events CRUD** | All 11 lifecycle endpoints + optimistic locking with `expected_version` | ✅ |
| **Notifications** | All 4 endpoints (list, my, get, acknowledge) | ✅ |
| **RBAC permissions** | `GET /api/v1/rbac/permissions/my` called after login via `RbacStore.hydratePermissions()` | ✅ |
| **Permission-based UI** | `hasPermission()` computed signal matches `includes('events.write')` pattern | ✅ |
| **WebSocket heartbeat** | `PING` every 30s, `PONG` timeout at 5s | ✅ |
| **WebSocket reconnect** | Exponential backoff (1s→30s, 10 retries) — superior to suggested fixed 3s | ✅ |
| **API response envelope** | `{ success, message, data, pagination? }` unwrapped by `response.interceptor.ts` | ✅ |
| **401 handling** | Clears session + redirects to `/auth/login` | ✅ |
| **403 handling** | Toast + permission guard blocks routes | ✅ |
| **409 handling** | Toast on conflict (re-fetch and retry is UX enhancement) | ✅ |
| **422 handling** | Passes through for component-level form errors | ✅ |
| **PWA manifest** | `display: standalone`, icons 72–512px with maskable | ✅ |
| **Service Worker** | 12 data groups with freshness/performance strategies | ✅ |
| **Offline queue** | IndexedDB-backed `OfflineQueueService` for failed request replay | ✅ |

---

## ⚠️ Minor Misalignments

| # | Issue | Frontend Claim | Backend Reality | Verdict | Action |
|---|-------|---------------|-----------------|---------|--------|
| 1 | **Login response extras** | `LoginResponse` missing `refresh_token`, `expires_in` | Backend returns them; frontend ignores | ✅ Not a problem — extra fields are harmless | No change needed |
| 2 | **Missing `/rbac/roles/my`** | Report lists this endpoint | Only `GET /api/v1/rbac/roles` (list all) exists | ⚠️ Backend needs to add | Backend: add `/my` variant (trivial) |
| 3 | **WS message type naming** | Frontend compared against architect doc, not backend | Backend emits `notification.new`, `event.reminder`, `escalation.created` — matching the report, not the architect doc | ⚠️ Source of truth is `app/websocket/enums.py` | Frontend: align to backend enum values |
| 4 | **Reconnect delay** | Exponential backoff (1s→30s) vs report's fixed 3s | Both work; exponential backoff is more resilient | ✅ Keep frontend implementation | No change needed |
| 5 | **PWA manifest `theme_color`** | Report specified `#1976D2` | Missing from manifest; meta tag has `#1E3A5F` | ⚠️ Frontend task | **DONE** — added `theme_color: #1E3A5F` + `background_color: #FFFFFF` to manifest |

---

## ❌ Critical — Addressed or In Progress

| # | Issue | Detail | Status |
|---|-------|--------|--------|
| 1 | **WebSocket URL missing JWT token** | Report specifies `ws://host/ws?token=<JWT>&org=<org_id>`. Backend reads token via query param (primary, `dependencies.py:13`) or `Authorization` header (fallback). Frontend was only sending `?org=X`. | **✅ FIXED** — `WebSocketService.buildWebSocketUrl()` now reads token from `AuthStore` and appends `?token=<encoded_jwt>&org=<org_id>`. Path also changed from `/ws` to `/api/v1/ws` per backend recommendation. |
| 2 | **Login endpoint missing from OpenAPI spec** | Frontend calls `POST /api/v1/auth/login` but it's absent from `remindly_openapi.json` | Backend: update OpenAPI spec to include all auth endpoints |
| 3 | **Audit endpoints missing from OpenAPI spec** | Report lists 4 audit endpoints; none found in spec | Backend: implement and document audit routes |
| 4 | **No `GET /api/v1/organizations/my`** | Report references `/my` but only `/organizations` and `/{org_id}` exist | Backend: add `/my` helper endpoint |
| 5 | **Missing `EVENT_UPDATED` WS subscription** | Report says client sends `{ type: 'EVENT_UPDATED', event_id, subscribe: bool }` for event-specific updates | Frontend: add subscription method to `WebSocketService` when needed |
| 6 | **Push API not implemented (Phase 2)** | No VAPID keys, push subscription endpoint, or Service Worker push/notificationclick handlers | Planned for Phase 2 — requires backend VAPID keys + endpoint |
| 7 | **JWT stored in localStorage** | `auth.store.ts:56` stores token in `localStorage` (XSS-vulnerable) | Backend: noted. Migrate to `sessionStorage` or HttpOnly cookies in future security pass |

---

## Frontend Changes Applied

| File | Change | Previously | Now |
|------|--------|------------|-----|
| `src/app/websocket/websocket.service.ts` | Injected `AuthStore` for JWT | WS URL: `ws://host/ws?org=X` | WS URL: `ws://host/api/v1/ws?token=<jwt>&org=X` |
| `src/app/websocket/websocket.service.ts` | WS path `/ws` → `/api/v1/ws` | `/ws` | `/api/v1/ws` |
| `public/manifest.webmanifest` | Added theme/background colors | Missing `theme_color`, `background_color` | `theme_color: "#1E3A5F"`, `background_color: "#FFFFFF"` |

---

## Backend Changes (Pending — Awaiting Commit)

| Change | Reference |
|--------|-----------|
| Add `GET /api/v1/rbac/roles/my` endpoint | Minor addition to RBAC module |
| Add `GET /api/v1/organizations/my` endpoint | Convenience wrapper |
| Update OpenAPI spec with auth + audit endpoints | `remindly_openapi.json` regeneration |
| Implement audit endpoints (`logs`, `stats`, `export`) | New audit module |

---

## Alignment Questions — Answered

| # | Question | Answer |
|---|----------|--------|
| 1 | Can Angular maintain persistent WebSocket + reconnect? | ✅ Yes — `WebSocketService` with exponential backoff (10 retries) |
| 2 | Can you send PING every 30s? | ✅ Yes — heartbeat interval at 30s with 5s pong timeout |
| 3 | Can you generate PWA manifest + Service Worker via `ng add @angular/pwa`? | ✅ Already done — manifest + `ngsw-config.json` with 12 data groups |
| 4 | Can Service Worker handle push events + `showNotification()`? | ❌ Not yet — Phase 2 (requires backend VAPID keys) |
| 5 | Will you call `/rbac/permissions/my` after login? | ✅ Yes — called in `AuthStore.login()` via `RbacStore.hydratePermissions()` |
| 6 | Can you handle `expected_version` + 409 conflicts? | ✅ Yes — events service passes version; error interceptor handles 409 |
| 7 | Can you redirect to login on 401 and show field errors on 422? | ✅ Yes — error interceptor handles 401→redirect; 422 passes through for forms |
