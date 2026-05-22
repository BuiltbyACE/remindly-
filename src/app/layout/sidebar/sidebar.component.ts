import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../auth/stores/auth.store';
import { RbacStore } from '../../auth/stores/rbac.store';
import { AppPermissionDirective } from '@shared/directives/app-permission/app-permission.directive';
import { PwaInstallService } from '../../core/services/pwa-install.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  permission?: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/calendar', label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', permission: 'events.read' },
  { path: '/events', label: 'Events', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', permission: 'events.read' },
  { path: '/approvals', label: 'Approvals', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', permission: 'events.approve' },
  { path: '/documents', label: 'Documents', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', permission: 'documents.read' },
  { path: '/notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { path: '/ai', label: 'AI Briefing', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { path: '/settings', label: 'Settings', icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992 0 .085.001.17.003.255.008.378-.137.75-.43.991l-1.004.827c-.424.35-.534.955-.26 1.43l1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124-.073.044-.146.086-.22.128-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 00-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.003-.827c.293-.241.438-.613.431-.992a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, AppPermissionDirective],
  styles: [`
    :host { display: contents; }

    aside {
      width: 256px;
      height: 100vh;
      background: linear-gradient(180deg, #0A1929 0%, #0F2B4C 35%, #132F4F 100%);
      border-right: 1px solid rgba(232,220,206,.06);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    /* Warm light wash */
    aside::before {
      content: '';
      position: absolute;
      top: -120px; right: -80px;
      width: 300px; height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(201,169,110,.06) 0%, transparent 70%);
      pointer-events: none;
    }

    aside::after {
      content: '';
      position: absolute;
      bottom: -60px; left: -60px;
      width: 200px; height: 200px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(58,130,181,.05) 0%, transparent 70%);
      pointer-events: none;
    }

    /* ── Logo bar ── */
    .logo-bar {
      height: 68px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      border-bottom: 1px solid rgba(232,220,206,.06);
      position: relative; z-index: 1;
      gap: 12px;
      flex-shrink: 0;
    }

    .logo-img {
      width: 36px; height: 36px;
      border-radius: 10px;
      object-fit: cover;
      border: 1.5px solid rgba(232,220,206,.15);
      box-shadow: 0 0 0 3px rgba(58,130,181,.15), 0 4px 12px rgba(0,0,0,.3);
      flex-shrink: 0;
    }

    .logo-text {
      font-family: var(--font-heading);
      font-size: 20px;
      font-weight: 400;
      color: #EDF3FA;
      letter-spacing: -0.01em;
    }

    .logo-accent {
      color: #C9A96E;
    }

    /* Close button removed — sidebar is desktop only */

    /* ── Navigation ── */
    nav {
      flex: 1;
      padding: 16px 10px;
      overflow-y: auto;
      position: relative; z-index: 1;
    }

    nav::-webkit-scrollbar { width: 3px; }
    nav::-webkit-scrollbar-track { background: transparent; }
    nav::-webkit-scrollbar-thumb { background: rgba(232,220,206,.08); border-radius: 4px; }

    .nav-section-label {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: .15em;
      text-transform: uppercase;
      color: rgba(140,149,158,.5);
      padding: 0 12px 12px;
    }

    nav ul { list-style: none; margin: 0; padding: 0; }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 10px 12px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 500;
      color: #8C959E;
      text-decoration: none;
      transition: all .15s ease;
      margin-bottom: 2px;
      position: relative;
    }

    .nav-link:hover {
      background: rgba(232,220,206,.06);
      color: #D6C8B4;
    }

    .nav-link.active {
      background: rgba(58,130,181,.12);
      color: #8BBDE3;
      font-weight: 500;
    }

    .nav-link.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      background: #5A9ECF;
      border-radius: 0 3px 3px 0;
    }

    .nav-link svg {
      width: 18px; height: 18px;
      flex-shrink: 0;
    }

    /* ── User footer ── */
    .user-footer {
      padding: 12px;
      border-top: 1px solid rgba(232,220,206,.06);
      position: relative; z-index: 1;
      flex-shrink: 0;
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 10px;
      background: rgba(232,220,206,.03);
      border: 1px solid rgba(232,220,206,.06);
      cursor: pointer;
      transition: background .15s;
    }

    .user-card:hover {
      background: rgba(232,220,206,.06);
    }

    .avatar {
      width: 36px; height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #25638B, #3A82B5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(37,99,139,.3);
      letter-spacing: 0.02em;
    }

    .user-name {
      font-size: 12.5px;
      font-weight: 600;
      color: #D6C8B4;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 10.5px;
      color: rgba(140,149,158,.7);
      margin-top: 2px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    /* ── PWA mini install ── */
    .pwa-mini {
      margin: 0 10px 10px;
      padding: 10px 12px;
      background: rgba(58,130,181,.08);
      border: 1px solid rgba(58,130,181,.15);
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      transition: background .15s;
      position: relative; z-index: 1;
      flex-shrink: 0;
    }

    .pwa-mini:hover {
      background: rgba(58,130,181,.15);
    }

    .pwa-mini-icon {
      width: 32px; height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, #25638B, #3A82B5);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .pwa-mini-text {
      font-size: 12px;
      font-weight: 600;
      color: #8BBDE3;
    }

    .pwa-mini-sub {
      font-size: 10.5px;
      color: rgba(140,149,158,.6);
      margin-top: 1px;
    }
  `],
  template: `
    <aside>
      <!-- Logo -->
      <div class="logo-bar">
        <img src="icons/icon.jpeg" alt="Remindly logo" class="logo-img" />
        <span class="logo-text">Remind<span class="logo-accent">ly</span></span>
      </div>

      <!-- Navigation -->
      <nav aria-label="Main navigation">
        <p class="nav-section-label">Menu</p>
        <ul>
          @for (item of navItems; track item.path) {
            <li *appPermission="item.permission">
              <a
                [routerLink]="item.path"
                routerLinkActive="active"
                class="nav-link"
                [attr.aria-label]="item.label"
              >
                <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" [attr.d]="item.icon" />
                </svg>
                {{ item.label }}
              </a>
            </li>
          }
        </ul>
      </nav>

      <!-- PWA Mini Install -->
      @if (pwa.canInstall()) {
        <div class="pwa-mini" role="button" (click)="installApp()" aria-label="Install Remindly app" tabindex="0">
          <div class="pwa-mini-icon">
            <svg width="15" height="15" fill="none" stroke="white" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
          </div>
          <div>
            <p class="pwa-mini-text">Install App</p>
            <p class="pwa-mini-sub">Add to home screen</p>
          </div>
        </div>
      }

      <!-- User Profile -->
      <div class="user-footer">
        <div class="user-card">
          <div class="avatar">{{ authStore.userInitials() }}</div>
          <div style="flex:1;min-width:0">
            <p class="user-name">{{ authStore.userDisplayName() }}</p>
            <p class="user-role">{{ rbacStore.primaryRoleLabel() }}</p>
          </div>
          <svg width="12" height="12" fill="none" stroke="rgba(140,149,158,.4)" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  readonly authStore = inject(AuthStore);
  readonly rbacStore = inject(RbacStore);
  readonly pwa = inject(PwaInstallService);
  readonly navItems = NAV_ITEMS;

  async installApp(): Promise<void> {
    await this.pwa.promptInstall();
  }
}
