import { Component, ChangeDetectionStrategy, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from '../auth/stores/auth.store';
import { ToastService } from '../shared/components/toast/toast.service';
import { ToastComponent } from '../shared/components/toast/toast.component';
import { WebSocketStore } from '../websocket/websocket.store';

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  styles: [`
    :host { display: flex; height: 100vh; background: var(--warm-50); }

    /* ── Sidebar ── */
    .sidebar {
      width: 240px;
      min-width: 240px;
      background: #0A1929;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    .sidebar-brand {
      padding: 20px 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,.06);
    }

    .sidebar-brand h1 {
      font-family: var(--font-heading);
      font-size: 22px;
      font-weight: 400;
      color: #fff;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .sidebar-brand small {
      font-size: 10px;
      color: rgba(255,255,255,.35);
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }

    .nav { padding: 12px 10px; flex: 1; }

    .nav-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,.3);
      padding: 0 10px;
      margin: 16px 0 6px;
    }
    .nav-label:first-child { margin-top: 0; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: rgba(255,255,255,.55);
      text-decoration: none;
      transition: all .15s ease;
      cursor: pointer;
    }

    .nav-item:hover {
      color: rgba(255,255,255,.85);
      background: rgba(255,255,255,.05);
    }

    .nav-item.active {
      color: #fff;
      background: rgba(255,255,255,.1);
    }

    .nav-item svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid rgba(255,255,255,.06);
    }

    .sidebar-user {
      font-size: 12px;
      color: rgba(255,255,255,.45);
    }

    .sidebar-user strong {
      display: block;
      font-weight: 500;
      color: rgba(255,255,255,.7);
      margin-top: 2px;
    }

    /* ── Main area ── */
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    /* ── Top bar ── */
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    .topbar-email {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .logout-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-secondary);
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      cursor: pointer;
      transition: all .15s ease;
    }

    .logout-btn:hover {
      color: var(--color-critical);
      border-color: var(--color-critical);
      background: #FDF6F4;
    }

    /* ── Content ── */
    .content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .topbar { padding: 12px 16px; }
      .content { padding: 16px; }
    }
  `],
  template: `
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <h1>remindly</h1>
        <small>Admin Portal</small>
      </div>

      <nav class="nav">
        <div class="nav-label">Main</div>
        <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Dashboard
        </a>

        <div class="nav-label">Management</div>
        <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
          </svg>
          Users
        </a>
        <a routerLink="/admin/organizations" routerLinkActive="active" class="nav-item">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          Organizations
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user">
          Signed in as
          <strong>{{ userEmail() }}</strong>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="main">
      <div class="topbar">
        <div class="topbar-left">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <span class="topbar-email">{{ userEmail() }}</span>
        </div>

        <button class="logout-btn" (click)="logout()">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Logout
        </button>
      </div>

      <div class="content">
        <router-outlet />
      </div>
    </div>

    <app-toast />
  `,
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly wsStore = inject(WebSocketStore);

  ngOnInit(): void {
    const userCached = sessionStorage.getItem('remindly_user');
    if (userCached) {
      try {
        const user = JSON.parse(userCached);
        if (user.super_admin === true || user.role === 'super_admin') return;
      } catch {
        // fall through
      }
    }
    this.router.navigate(['/dashboard']);

    this.wsStore.connect();
    this.wsStore.initialize();
  }

  ngOnDestroy(): void {
    this.wsStore.cleanup();
  }

  readonly userEmail = computed(() => {
    const email = this.authStore.user()?.email ?? 'admin@remindly';
    return email.length > 30 ? email.slice(0, 27) + '...' : email;
  });

  logout(): void {
    this.toast.success('Logged out successfully');
    // Removed native notification on logout to prevent illegal constructor error on Android
    setTimeout(() => {
      this.authStore.clearSession();
      this.router.navigate(['/admin/login']);
    }, 300);
  }
}
