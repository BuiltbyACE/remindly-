import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { AuthStore } from '../../auth/stores/auth.store';
import { OrganizationStore } from '../../organizations/stores/organization.store';
import { WebSocketStore } from '../../websocket/websocket.store';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastComponent],
  template: `
    <div class="min-h-screen bg-[var(--color-surface-alt)] flex">
      <!-- Mobile backdrop -->
      @if (sidebarOpen() && !isDesktop()) {
        <div
          class="fixed inset-0 z-30 bg-black/50 lg:hidden"
          (click)="sidebarOpen.set(false)"
          role="presentation"
        ></div>
      }

      <!-- Sidebar: off-canvas on mobile, static on desktop -->
      <div
        class="fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
               lg:relative lg:translate-x-0"
        [class.-translate-x-full]="!sidebarOpen() && !isDesktop()"
        [class.translate-x-0]="sidebarOpen() || isDesktop()"
      >
        <app-sidebar (close)="sidebarOpen.set(false)" />
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-h-screen min-w-0">
        <app-topbar (toggleSidebar)="sidebarOpen.update(v => !v)" />

        <main class="flex-1 p-6 overflow-auto">
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

  ngOnInit(): void {
    this.authStore.hydrateUser();
    this.orgStore.loadOrganizations();

    const activeOrgId = this.orgStore.activeOrganization()?.id;
    this.wsStore.connect(activeOrgId);
    this.wsStore.initialize();
  }

  ngOnDestroy(): void {
    this.wsStore.cleanup();
  }
}
