import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../auth/stores/auth.store';
import { OrganizationStore } from '../../organizations/stores/organization.store';
import { NotificationsStore } from '../../notifications/stores/notifications.store';

@Component({
  selector: 'app-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <!-- Left: Hamburger + Organization -->
      <div class="flex items-center gap-4">
        <!-- Hamburger (mobile) -->
        <button
          type="button"
          (click)="toggleSidebar.emit()"
          class="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          aria-label="Toggle sidebar"
        >
          <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Organization Switcher -->
        <div class="relative">
          <div class="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <svg aria-hidden="true" class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <select
              [value]="orgStore.activeOrganizationId()"
              (change)="onOrgChange($event)"
              class="appearance-none bg-transparent border-none text-sm font-semibold text-gray-900 focus:outline-none cursor-pointer max-w-[180px] lg:max-w-[250px] truncate pr-6">
              @for (org of orgStore.organizations(); track org.id) {
                <option [value]="org.id">{{ org.name }}</option>
              }
            </select>
            <svg aria-hidden="true" class="w-4 h-4 text-gray-500 absolute right-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-3">
        <!-- Notification Bell -->
        <a
          routerLink="/notifications"
          class="relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          [attr.aria-label]="'Notifications'">
          <svg aria-hidden="true" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          @if (notificationsStore.unreadCount() > 0) {
            <span class="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {{ notificationsStore.unreadCount() > 99 ? '99+' : notificationsStore.unreadCount() }}
            </span>
          }
        </a>

        <!-- Logout -->
        <button
          type="button"
          (click)="logout()"
          class="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          aria-label="Sign out">
          <svg aria-hidden="true" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
