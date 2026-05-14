import { Component, ChangeDetectionStrategy, inject, output, computed } from '@angular/core';
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
  { path: '/dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { path: '/events', label: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', permission: 'events.read' },
  { path: '/approvals', label: 'Approvals', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', permission: 'events.approve' },
  { path: '/notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { path: '/voice', label: 'Voice', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z', permission: 'voice.execute' },
  { path: '/ai', label: 'AI Briefing', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { path: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
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
      background: linear-gradient(180deg, #0D2137 0%, #112840 100%);
      border-right: 1px solid rgba(255,255,255,.05);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    aside::before {
      content: '';
      position: absolute;
      top: -80px; left: -80px;
      width: 240px; height: 240px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(21,101,192,.18) 0%, transparent 70%);
      pointer-events: none;
    }

    .logo-bar {
      height: 68px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      border-bottom: 1px solid rgba(255,255,255,.06);
      position: relative; z-index: 1;
      gap: 12px;
      flex-shrink: 0;
    }

    .logo-img {
      width: 38px; height: 38px;
      border-radius: 10px;
      object-fit: cover;
      border: 2px solid rgba(255,255,255,.15);
      box-shadow: 0 0 0 3px rgba(37,99,235,.3), 0 4px 12px rgba(0,0,0,.4);
      flex-shrink: 0;
    }

    .logo-text {
      font-size: 18px;
      font-weight: 800;
      color: #F1F5F9;
      letter-spacing: -.01em;
    }

    .logo-accent {
      background: linear-gradient(135deg, #60A5FA, #818CF8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .close-btn {
      margin-left: auto;
      padding: 6px;
      border: none;
      background: rgba(255,255,255,.08);
      border-radius: 8px;
      color: #94A3B8;
      cursor: pointer;
      display: none;
      align-items: center;
      justify-content: center;
      transition: background .15s;
    }
    @media (max-width: 1023px) { .close-btn { display: flex; } }
    .close-btn:hover { background: rgba(255,255,255,.14); color: #F1F5F9; }

    nav {
      flex: 1;
      padding: 12px 10px;
      overflow-y: auto;
      position: relative; z-index: 1;
    }
    nav::-webkit-scrollbar { width: 3px; }
    nav::-webkit-scrollbar-track { background: transparent; }
    nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 4px; }

    .nav-section-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: #475569;
      padding: 4px 10px 10px;
    }

    nav ul { list-style: none; margin: 0; padding: 0; }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 10px 12px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 500;
      color: #94A3B8;
      text-decoration: none;
      transition: background .15s ease, color .15s ease, box-shadow .15s ease;
      margin-bottom: 2px;
    }
    .nav-link:hover {
      background: rgba(255,255,255,.07);
      color: #E2E8F0;
    }
    .nav-link.active {
      background: linear-gradient(90deg, rgba(21,101,192,.22), rgba(21,101,192,.08));
      color: #90CAF9;
      box-shadow: inset 3px 0 0 #1565C0;
      font-weight: 600;
    }
    .nav-link svg {
      width: 18px; height: 18px;
      flex-shrink: 0;
      transition: transform .15s;
    }
    .nav-link:hover svg { transform: scale(1.1); }

    .user-footer {
      padding: 12px;
      border-top: 1px solid rgba(255,255,255,.06);
      position: relative; z-index: 1;
      flex-shrink: 0;
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 10px;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.07);
    }

    .avatar {
      width: 36px; height: 36px;
      border-radius: 10px;
      background: #1565C0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(21,101,192,.35);
    }

    .user-name {
      font-size: 13px; font-weight: 600; color: #E2E8F0;
      line-height: 1.2;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .user-role { font-size: 11px; color: #64748B; margin-top: 2px; }

    .pwa-mini {
      margin: 0 10px 10px;
      padding: 10px 12px;
      background: rgba(21,101,192,.15);
      border: 1px solid rgba(21,101,192,.25);
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
      background: rgba(21,101,192,.25);
    }
    .pwa-mini-icon {
      width: 32px; height: 32px;
      border-radius: 8px;
      background: #1565C0;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .pwa-mini-text { font-size: 12px; font-weight: 600; color: #93C5FD; }
    .pwa-mini-sub { font-size: 11px; color: #64748B; margin-top: 1px; }
  `],
  template: `
    <aside>
      <!-- Logo -->
      <div class="logo-bar">
        <img src="icons/icon.jpeg" alt="Remindly logo" class="logo-img" />
        <span class="logo-text">Remind<span class="logo-accent">ly</span></span>
        <button
          type="button"
          class="close-btn"
          (click)="close.emit()"
          aria-label="Close sidebar"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
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
                (click)="close.emit()"
              >
                <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" [attr.d]="item.icon" />
                </svg>
                {{ item.label }}
              </a>
            </li>
          }
        </ul>
      </nav>

      <!-- PWA Mini Install Prompt -->
      @if (pwa.canInstall()) {
        <div class="pwa-mini" role="button" (click)="installApp()" aria-label="Install Remindly app" tabindex="0">
          <div class="pwa-mini-icon">
            <svg width="15" height="15" fill="none" stroke="white" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
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
            <p class="user-role">{{ roleLabel() }}</p>
          </div>
          <svg width="14" height="14" fill="none" stroke="#475569" viewBox="0 0 24 24">
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
  readonly close = output<void>();

  readonly roleLabel = computed(() => {
    if (this.rbacStore.hasPermission()('audit.read')) return 'Executive';
    if (this.rbacStore.hasPermission()('events.approve')) return 'Admin';
    if (this.rbacStore.hasPermission()('events.read')) return 'Secretary';
    return 'Member';
  });

  async installApp(): Promise<void> {
    await this.pwa.promptInstall();
  }
}
