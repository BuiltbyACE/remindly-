import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { AuthStore } from '../../auth/stores/auth.store';
import { OrganizationStore } from '../../organizations/stores/organization.store';
import { WebSocketStore } from '../../websocket/websocket.store';

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
  `],
  template: `
    <div class="shell">
      <!-- Sidebar column (desktop only) -->
      <div class="sidebar-col">
        <app-sidebar />
      </div>

      <!-- Main content column -->
      <div class="main-area">
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

  protected onToggleSidebar(): void {
    // Sidebar is desktop-only; no toggle needed on mobile
  }

  async ngOnInit(): Promise<void> {
    await this.authStore.hydrateUser();
    await this.orgStore.loadOrganizations();
    const activeOrgId = this.orgStore.activeOrganization()?.id;
    this.wsStore.connect(activeOrgId);
    this.wsStore.initialize();
  }

  ngOnDestroy(): void {
    this.wsStore.cleanup();
  }
}
