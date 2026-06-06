import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { AuthStore } from '../../auth/stores/auth.store';
import { OrganizationStore } from '../../organizations/stores/organization.store';
import { WebSocketStore } from '../../websocket/websocket.store';
import { OfflineSyncService } from '../../core/services/offline-sync.service';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, MobileNavComponent, ToastComponent],
  styles: [`
    :host { display: contents; }

    /* ── Root shell ── */
    .shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--color-surface-alt);
    }

    /* ── Sidebar: desktop only ── */
    .sidebar-col {
      flex-shrink: 0;
      width: 256px;
      height: 100vh;
      position: sticky;
      top: 0;
      z-index: 40;
    }

    @media (max-width: 1023px) {
      .sidebar-col { display: none; }
    }

    /* ── Main area scrolls independently ── */
    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      height: 100vh;
      overflow: hidden;
    }

    app-topbar {
      flex-shrink: 0;
    }

    main {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 28px 32px 48px;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }

    /* Mobile: tighter padding + bottom nav room */
    @media (max-width: 1023px) {
      main {
        padding: 12px 16px calc(80px + env(safe-area-inset-bottom, 16px));
      }
    }

    @media (max-width: 640px) {
      main {
        padding: 10px 14px calc(80px + env(safe-area-inset-bottom, 16px));
      }
    }

    /* Mobile overlay backdrop */
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 30;
      background: rgba(0,0,0,.55);
      backdrop-filter: blur(2px);
      display: none;
    }
    .backdrop.visible { display: block; }

    @media (max-width: 1023px) {
      .backdrop { display: none !important; }
    }

    .offline-banner {
      background-color: var(--color-warning);
      color: #000;
      text-align: center;
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 500;
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }
  `],
  template: `
    <div class="shell">
      <!-- Sidebar column (desktop only) -->
      <div class="sidebar-col">
        <app-sidebar />
      </div>

      <!-- Main content column -->
      <div class="main-area">
        @if (!offlineSync.isOnline()) {
          <div class="offline-banner">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.163a1.5 1.5 0 013.111 1.62m-5.46-3.841L3 3m18 18L3 3" />
            </svg>
            Working Offline - changes will sync later
          </div>
        }
        <app-topbar (toggleSidebar)="onToggleSidebar()" />
        <main id="main-content">
          <router-outlet />
        </main>
      </div>

      <!-- Mobile bottom nav -->
      <app-mobile-nav />

      <app-toast />
    </div>
  `,
})
export class ShellComponent implements OnInit, OnDestroy {
  private readonly authStore = inject(AuthStore);
  private readonly orgStore = inject(OrganizationStore);
  private readonly wsStore = inject(WebSocketStore);
  protected readonly offlineSync = inject(OfflineSyncService);
  private visibilityHandler: (() => void) | null = null;

  protected onToggleSidebar(): void {
    // Sidebar is desktop-only; no toggle needed on mobile
  }

  async ngOnInit(): Promise<void> {
    await this.authStore.hydrateUser();
    await this.orgStore.loadOrganizations();
    const activeOrgId = this.orgStore.activeOrganization()?.id;
    this.wsStore.connect(activeOrgId);
    this.wsStore.initialize();

    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible' && !this.wsStore.isConnected()) {
        this.wsStore.reconnect();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  ngOnDestroy(): void {
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
    this.wsStore.cleanup();
  }
}
