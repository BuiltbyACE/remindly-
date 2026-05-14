import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../auth/stores/auth.store';
import { OrganizationStore } from '../../organizations/stores/organization.store';
import { NotificationsStore } from '../../notifications/stores/notifications.store';

@Component({
  selector: 'app-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  styles: [`
    :host { display: block; flex-shrink: 0; }

    header {
      height: 60px;
      background: rgba(255,255,255,.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 20;
    }

    @media (prefers-color-scheme: dark) {
      header {
        background: rgba(15,23,42,.9);
        border-bottom-color: rgba(255,255,255,.06);
      }
    }

    /* Left cluster */
    .left { display: flex; align-items: center; gap: 12px; }

    .hamburger {
      display: none;
      align-items: center; justify-content: center;
      width: 36px; height: 36px;
      border-radius: 10px;
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: background .15s, color .15s;
    }
    @media (max-width: 1023px) { .hamburger { display: flex; } }
    .hamburger:hover { background: var(--color-surface-alt); color: var(--color-text-primary); }

    /* Org switcher */
    .org-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      border-radius: 10px;
      padding: 7px 12px;
      position: relative;
    }
    .org-pill svg { color: #1565C0; flex-shrink: 0; }

    .org-select {
      appearance: none;
      background: transparent;
      border: none;
      font-size: 13.5px;
      font-weight: 600;
      color: var(--color-text-primary);
      cursor: pointer;
      outline: none;
      max-width: 200px;
      padding-right: 20px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .org-caret {
      position: absolute;
      right: 10px;
      pointer-events: none;
      color: var(--color-text-muted);
    }

    /* Right cluster */
    .right { display: flex; align-items: center; gap: 4px; }

    .icon-btn {
      position: relative;
      width: 38px; height: 38px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: var(--color-text-secondary);
      text-decoration: none;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: background .15s, color .15s;
    }
    .icon-btn:hover {
      background: #EFF6FF;
      color: #1565C0;
    }

    /* Notification badge */
    .notif-badge {
      position: absolute;
      top: 4px; right: 4px;
      min-width: 17px; height: 17px;
      background: #EF4444;
      color: white;
      font-size: 10px;
      font-weight: 700;
      border-radius: 50px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 4px;
      border: 2px solid white;
      line-height: 1;
    }

    /* Divider */
    .divider {
      width: 1px;
      height: 24px;
      background: var(--color-border);
      margin: 0 4px;
    }

    /* Logout red on hover */
    .btn-logout:hover { background: #FEF2F2; color: #DC2626; }
  `],
  template: `
    <header>
      <!-- Left -->
      <div class="left">
        <!-- Hamburger (mobile only) -->
        <button
          type="button"
          class="hamburger"
          (click)="toggleSidebar.emit()"
          aria-label="Toggle sidebar"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <!-- Org switcher -->
        <div class="org-pill">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <select
            class="org-select"
            [value]="orgStore.activeOrganizationId()"
            (change)="onOrgChange($event)"
            aria-label="Select organisation"
          >
            @for (org of orgStore.organizations(); track org.id) {
              <option [value]="org.id">{{ org.name }}</option>
            }
          </select>
          <svg class="org-caret" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>

      <!-- Right -->
      <div class="right">
        <!-- Notifications -->
        <a
          routerLink="/notifications"
          class="icon-btn"
          aria-label="Notifications"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          @if (notificationsStore.unreadCount() > 0) {
            <span class="notif-badge">
              {{ notificationsStore.unreadCount() > 99 ? '99+' : notificationsStore.unreadCount() }}
            </span>
          }
        </a>

        <div class="divider"></div>

        <!-- Logout -->
        <button
          type="button"
          class="icon-btn btn-logout"
          (click)="logout()"
          aria-label="Sign out"
          title="Sign out"
        >
          <svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  readonly orgStore = inject(OrganizationStore);
  readonly notificationsStore = inject(NotificationsStore);
  readonly toggleSidebar = output<void>();

  async onOrgChange(event: Event): Promise<void> {
    const select = event.target as HTMLSelectElement;
    await this.orgStore.switchOrganization(select.value);
  }

  async logout(): Promise<void> {
    this.authStore.clearSession();
    await this.router.navigate(['/auth/login']);
  }
}
