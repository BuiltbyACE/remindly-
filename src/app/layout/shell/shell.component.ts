import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { AuthStore } from '../../auth/stores/auth.store';
import { OrganizationStore } from '../../organizations/stores/organization.store';
import { WebSocketStore } from '../../websocket/websocket.store';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastComponent],
  styles: [`
    :host { display: contents; }

    /* ── Root shell ── */
    .shell {
      display: flex;
      height: 100vh;
      overflow: hidden;           /* shell itself never scrolls */
      background: var(--color-surface-alt);
    }

    /* ── Sidebar: sticky column on desktop ── */
    .sidebar-col {
      flex-shrink: 0;
      width: 256px;
      height: 100vh;
      position: sticky;
      top: 0;
      z-index: 40;
      transition: transform 300ms cubic-bezier(.4,0,.2,1);
    }

    /* Mobile: sidebar slides off-canvas */
    @media (max-width: 1023px) {
      .sidebar-col {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 256px;
      }
      .sidebar-col.off {
        transform: translateX(-100%);
      }
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

    /* Topbar stays pinned at top of main area */
    app-topbar {
      flex-shrink: 0;
    }

    main {
      flex: 1;
      overflow-y: auto;           /* only this scrolls */
      overflow-x: hidden;
      padding: 28px 32px 48px;
      scroll-behavior: smooth;
    }

    @media (max-width: 640px) {
      main { padding: 16px 16px 32px; }
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
  `],
  template: `
    <div class="shell">
      <!-- Mobile backdrop -->
      <div
        class="backdrop"
        [class.visible]="sidebarOpen() && !isDesktop()"
        (click)="sidebarOpen.set(false)"
        role="presentation"
        aria-hidden="true"
      ></div>

      <!-- Sidebar column -->
      <div
        class="sidebar-col"
        [class.off]="!sidebarOpen() && !isDesktop()"
      >
        <app-sidebar (close)="sidebarOpen.set(false)" />
      </div>

      <!-- Main content column -->
      <div class="main-area">
        <app-topbar (toggleSidebar)="sidebarOpen.update(v => !v)" />
        <main id="main-content">
          <router-outlet />
        </main>
      </div>

      <app-toast />
    </div>
  `,
})
export class ShellComponent implements OnInit, OnDestroy {
  private readonly authStore = inject(AuthStore);
  private readonly orgStore = inject(OrganizationStore);
  private readonly wsStore = inject(WebSocketStore);

  readonly sidebarOpen = signal(false);

  protected isDesktop(): boolean {
    return window.innerWidth >= 1024;
  }

  async ngOnInit(): Promise<void> {
    this.authStore.hydrateUser();
    await this.orgStore.loadOrganizations();
    const activeOrgId = this.orgStore.activeOrganization()?.id;
    this.wsStore.connect(activeOrgId);
    this.wsStore.initialize();
  }

  ngOnDestroy(): void {
    this.wsStore.cleanup();
  }
}
