import { Component, ChangeDetectionStrategy, inject, signal, computed, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RbacStore } from '../../auth/stores/rbac.store';
import { AuthStore } from '../../auth/stores/auth.store';
import { NotificationsStore } from '../../notifications/stores/notifications.store';
import { OrganizationStore } from '../../organizations/stores/organization.store';
import { PwaInstallService } from '../../core/services/pwa-install.service';

interface Tab {
  path: string;
  label: string;
  icon: string;
  activeIcon: string;
  permission?: string;
}

const TABS: Tab[] = [
  {
    path: '/dashboard',
    label: 'Home',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    activeIcon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    path: '/calendar',
    label: 'Calendar',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    activeIcon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    permission: 'events.read',
  },
  {
    path: '/events',
    label: 'Events',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    activeIcon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    permission: 'events.read',
  },
  {
    path: '/notifications',
    label: 'Alerts',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    activeIcon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  },
];

interface SheetItem {
  path: string;
  label: string;
  icon: string;
  permission?: string;
}

const SHEET_ITEMS: SheetItem[] = [
  { path: '/approvals', label: 'Approvals', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', permission: 'events.approve' },
  { path: '/documents', label: 'Documents', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', permission: 'documents.read' },
  { path: '/ai', label: 'AI Briefing', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { path: '/settings', label: 'Settings', icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992 0 .085.001.17.003.255.008.378-.137.75-.43.991l-1.004.827c-.424.35-.534.955-.26 1.43l1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124-.073.044-.146.086-.22.128-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 00-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.003-.827c.293-.241.438-.613.431-.992a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

@Component({
  selector: 'app-mobile-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, RouterLinkActive],
  styles: [`
    app-mobile-nav {
      display: none;
    }

    @media (max-width: 1023px) {
      app-mobile-nav {
        display: flex;
        position: fixed;
        bottom: 0; left: 0; right: 0;
        z-index: 50;
        flex-direction: column;
      }

      .mnav-bar {
        display: flex;
        align-items: center;
        justify-content: space-around;
        height: 64px;
        padding-bottom: env(safe-area-inset-bottom, 0px);
        background: rgba(255,255,255,.96);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-top: 1px solid rgba(200,207,214,.5);
        box-shadow: 0 -2px 20px rgba(10,25,41,.06);
        position: relative;
      }

      @media (prefers-color-scheme: dark) {
        .mnav-bar {
          background: rgba(15,23,42,.92);
          border-top-color: rgba(255,255,255,.06);
        }
      }

      .mnav-tab {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        min-width: 56px;
        height: 48px;
        text-decoration: none;
        color: var(--color-text-muted);
        transition: color .15s;
        position: relative;
        -webkit-tap-highlight-color: transparent;
      }

      .mnav-tab svg {
        width: 22px;
        height: 22px;
        transition: transform .15s;
      }

      .mnav-tab:active svg {
        transform: scale(.88);
      }

      .mnav-label {
        font-size: 9px;
        font-weight: 600;
        letter-spacing: .02em;
      }

      .mnav-tab.active {
        color: var(--ocean-600);
      }

      .mnav-tab.active svg {
        stroke-width: 2.2;
      }

      .mnav-tab.active::after {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 2.5px;
        background: var(--ocean-500);
        border-radius: 0 0 3px 3px;
      }

      /* ── Badge ── */
      .mnav-badge {
        position: absolute;
        top: 0;
        right: 50%;
        transform: translateX(12px);
        min-width: 16px;
        height: 16px;
        background: #EF4444;
        color: white;
        font-size: 9px;
        font-weight: 700;
        border-radius: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        border: 2px solid white;
        line-height: 1;
      }

      /* ── More Sheet ── */
      .msheet-overlay {
        position: fixed;
        inset: 0;
        z-index: 200;
        background: rgba(10,25,41,.45);
        backdrop-filter: blur(3px);
        -webkit-backdrop-filter: blur(3px);
        animation: msheetFadeIn .2s ease;
      }

      .msheet {
        position: fixed;
        left: 0; right: 0; bottom: 0;
        z-index: 201;
        background: var(--color-surface);
        border-radius: 20px 20px 0 0;
        box-shadow: 0 -8px 40px rgba(10,25,41,.15);
        max-height: 70vh;
        overflow-y: auto;
        animation: msheetSlideUp .3s cubic-bezier(.4,0,.2,1);
        padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
      }

      .msheet-handle {
        width: 36px;
        height: 4px;
        border-radius: 4px;
        background: var(--mist);
        margin: 10px auto 6px;
        flex-shrink: 0;
      }

      .msheet-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 20px 4px;
      }

      .msheet-header h2 {
        font-family: var(--font-heading);
        font-size: 18px;
        font-weight: 400;
        color: var(--color-text-primary);
        margin: 0;
      }

      .msheet-close {
        width: 36px; height: 36px;
        border-radius: 10px;
        border: none;
        background: var(--warm-50);
        color: var(--color-text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background .15s;
      }

      .msheet-close:hover { background: var(--warm-100); }

      .msheet-items {
        padding: 4px 12px 12px;
      }

      .msheet-item {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 12px;
        border-radius: 12px;
        text-decoration: none;
        color: var(--color-text-primary);
        font-size: 15px;
        font-weight: 500;
        transition: background .15s;
        -webkit-tap-highlight-color: transparent;
      }

      .msheet-item:active {
        background: var(--warm-50);
      }

      .msheet-item svg {
        width: 22px;
        height: 22px;
        color: var(--ocean-500);
        flex-shrink: 0;
      }

      .msheet-item span {
        flex: 1;
      }

      .msheet-item .msheet-arrow {
        width: 16px; height: 16px;
        color: var(--color-text-muted);
      }

      /* ── PWA install in sheet ── */
      .msheet-pwa {
        margin: 4px 12px 8px;
        padding: 14px 16px;
        background: linear-gradient(135deg, rgba(58,130,181,.06), rgba(90,158,207,.04));
        border: 1px solid rgba(58,130,181,.12);
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      .msheet-pwa:active {
        background: rgba(58,130,181,.1);
      }

      .msheet-pwa-icon {
        width: 40px; height: 40px;
        border-radius: 10px;
        background: linear-gradient(135deg, #25638B, #3A82B5);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(37,99,139,.25);
      }

      .msheet-pwa-text {
        font-size: 14px;
        font-weight: 600;
        color: var(--ocean-700);
      }

      .msheet-pwa-sub {
        font-size: 12px;
        color: var(--color-text-muted);
        margin-top: 1px;
      }

      /* ── User footer in sheet ── */
      .msheet-user {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        margin: 8px 12px 0;
        border-top: 1px solid var(--cloud);
      }

      .msheet-avatar {
        width: 40px; height: 40px;
        border-radius: 12px;
        background: linear-gradient(135deg, #25638B, #3A82B5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 700;
        color: white;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(37,99,139,.25);
      }

      .msheet-user-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-primary);
      }

      .msheet-user-role {
        font-size: 11px;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: .05em;
      }

      /* ── Org switcher in sheet ── */
      .msheet-org {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        margin: 0 12px 6px;
        background: var(--warm-50);
        border-radius: 12px;
      }

      .msheet-org svg {
        width: 18px; height: 18px;
        color: var(--ocean-500);
        flex-shrink: 0;
      }

      .msheet-org select {
        flex: 1;
        appearance: none;
        background: transparent;
        border: none;
        font-family: var(--font-body);
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-primary);
        outline: none;
        cursor: pointer;
        padding: 4px 0;
        min-width: 0;
      }
    }

    @keyframes msheetFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @keyframes msheetSlideUp {
      from { transform: translateY(100%); }
      to   { transform: translateY(0); }
    }
  `],
  template: `
    <!-- Bottom Tab Bar -->
    <div class="mnav-bar">
      @for (tab of tabs; track tab.path) {
        <a
          class="mnav-tab"
          [routerLink]="tab.path"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: tab.path === '/dashboard' }"
          [attr.aria-label]="tab.label"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  [attr.d]="tab.icon" />
          </svg>
          <span class="mnav-label">{{ tab.label }}</span>
          @if (tab.label === 'Alerts' && unreadCount() > 0) {
            <span class="mnav-badge">{{ unreadCount() > 99 ? '99+' : unreadCount() }}</span>
          }
        </a>
      }

      <!-- More tab -->
      <button
        class="mnav-tab"
        (click)="sheetOpen.set(true)"
        aria-label="More options"
        style="background:none;border:none;cursor:pointer;font-family:var(--font-body);padding:0"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:22px;height:22px">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
        <span class="mnav-label">More</span>
      </button>
    </div>

    <!-- More Sheet Overlay -->
    @if (sheetOpen()) {
      <div class="msheet-overlay" (click)="sheetOpen.set(false)"></div>
      <div class="msheet">
        <div class="msheet-handle"></div>

        <div class="msheet-header">
          <h2>More</h2>
          <button class="msheet-close" (click)="sheetOpen.set(false)" aria-label="Close">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="msheet-items">
          @for (item of sheetItems; track item.path) {
            @if (!item.permission || rbac.hasPermission()(item.permission)) {
              <a
                class="msheet-item"
                [routerLink]="item.path"
                (click)="sheetOpen.set(false)"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        [attr.d]="item.icon" />
                </svg>
                <span>{{ item.label }}</span>
                <svg class="msheet-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            }
          }
        </div>

        <!-- Organization Switcher -->
        <div class="msheet-org">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <select
            [value]="orgStore.activeOrganizationId()"
            (change)="onOrgChange($event)"
            aria-label="Switch organization"
          >
            @for (org of orgStore.organizations(); track org.id) {
              <option [value]="org.id">{{ org.name }}</option>
            }
          </select>
        </div>

        <!-- PWA Install -->
        @if (pwa.canInstall()) {
          <div class="msheet-pwa" role="button" (click)="installApp(); sheetOpen.set(false)" tabindex="0">
            <div class="msheet-pwa-icon">
              <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
            </div>
            <div>
              <p class="msheet-pwa-text">Install Remindly</p>
              <p class="msheet-pwa-sub">Add to home screen for the best experience</p>
            </div>
          </div>
        }

        <!-- User -->
        <div class="msheet-user">
          <div class="msheet-avatar">{{ auth.userInitials() }}</div>
          <div>
            <p class="msheet-user-name">{{ auth.userDisplayName() }}</p>
            <p class="msheet-user-role">{{ rbac.primaryRoleLabel() }}</p>
          </div>
        </div>
      </div>
    }
  `,
})
export class MobileNavComponent {
  readonly tabs = TABS;
  readonly sheetItems = SHEET_ITEMS;
  readonly rbac = inject(RbacStore);
  readonly auth = inject(AuthStore);
  readonly orgStore = inject(OrganizationStore);
  readonly notifications = inject(NotificationsStore);
  readonly pwa = inject(PwaInstallService);

  readonly sheetOpen = signal(false);

  readonly unreadCount = computed(() => this.notifications.unreadCount());

  async onOrgChange(event: Event): Promise<void> {
    const select = event.target as HTMLSelectElement;
    await this.orgStore.switchOrganization(select.value);
  }

  async installApp(): Promise<void> {
    await this.pwa.promptInstall();
  }
}
