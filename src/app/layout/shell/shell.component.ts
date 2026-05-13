import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { AuthStore } from '../../auth/stores/auth.store';
import { OrganizationStore } from '../../organizations/stores/organization.store';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastComponent],
  template: `
    <div class="min-h-screen bg-[var(--color-surface-alt)] flex">
      <!-- Sidebar -->
      <app-sidebar />
      
      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-h-screen">
        <!-- Topbar -->
        <app-topbar />
        
        <!-- Page Content -->
        <main class="flex-1 p-6 overflow-auto">
          <router-outlet />
        </main>
      </div>
      
      <!-- Toast Notifications -->
      <app-toast />
    </div>
  `,
})
export class ShellComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly orgStore = inject(OrganizationStore);

  ngOnInit(): void {
    // Hydrate user and load organizations on shell init
    this.authStore.hydrateUser();
    this.orgStore.loadOrganizations();
  }
}
