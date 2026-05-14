import { Component, ChangeDetectionStrategy, inject, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventsStore } from '../../events/stores/events.store';
import { OrganizationStore } from '../../organizations/stores/organization.store';
import { NotificationsStore } from '../../notifications/stores/notifications.store';
import { ApprovalsStore } from '../../approvals/stores/approvals.store';
import { RemindersStore } from '../../reminders/stores/reminders.store';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-stats-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SkeletonLoaderComponent],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Today's Events -->
      <a
        routerLink="/events"
        class="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <svg aria-hidden="true" class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="text-sm font-medium text-gray-500">Today's Events</span>
        </div>
        @if (eventsStore.loading()) {
          <div class="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
        } @else {
          <p class="text-3xl font-bold text-gray-900">{{ todaysEventsCount() }}</p>
        }
        <p class="text-sm text-blue-600 mt-1 font-medium">Upcoming: {{ upcomingEventsCount() }}</p>
      </a>

      <!-- Pending Approvals -->
      <a
        routerLink="/approvals"
        class="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <svg aria-hidden="true" class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span class="text-sm font-medium text-gray-500">Pending Approvals</span>
        </div>
        <p class="text-3xl font-bold text-gray-900">{{ pendingApprovalsCount() }}</p>
        <p class="text-sm text-blue-600 mt-1 font-medium">Requires your action</p>
      </a>

      <!-- Unread Notifications -->
      <a
        routerLink="/notifications"
        class="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <svg aria-hidden="true" class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <span class="text-sm font-medium text-gray-500">Notifications</span>
        </div>
        <p class="text-3xl font-bold text-gray-900">{{ unreadNotificationsCount() }}</p>
        <p class="text-sm text-blue-600 mt-1 font-medium">{{ unreadNotificationsCount() }} unread</p>
      </a>

      <!-- Organization -->
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <svg aria-hidden="true" class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span class="text-sm font-medium text-gray-500">Organization</span>
        </div>
        @if (orgStore.isLoading()) {
          <app-skeleton-loader variant="text" />
        } @else {
          <p class="text-lg font-bold text-gray-900 truncate">
            {{ orgStore.activeOrganization()?.name ?? 'No org selected' }}
          </p>
          <p class="text-sm text-blue-600 mt-1 font-medium">
            {{ orgStore.organizations().length }} Organizations
          </p>
        }
      </div>
    </div>
  `,
})
export class StatsCardsComponent implements OnInit {
  readonly eventsStore = inject(EventsStore);
  readonly orgStore = inject(OrganizationStore);
  readonly notificationsStore = inject(NotificationsStore);
  readonly approvalsStore = inject(ApprovalsStore);
  readonly remindersStore = inject(RemindersStore);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.eventsStore.loadEvents();
    this.notificationsStore.loadNotifications();
  }

  readonly todaysEventsCount = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.eventsStore.events().filter(event => {
      if (!event.starts_at) return false;
      const eventDate = new Date(event.starts_at);
      return eventDate >= today && eventDate < tomorrow;
    }).length;
  });

  readonly upcomingEventsCount = computed(() => {
    const now = new Date();
    return this.eventsStore.events().filter(event => {
      if (!event.starts_at) return false;
      return new Date(event.starts_at) > now;
    }).length;
  });

  readonly pendingApprovalsCount = computed(() =>
    this.approvalsStore.pendingCount()
  );

  readonly unreadNotificationsCount = computed(() =>
    this.notificationsStore.unreadCount()
  );

  readonly escalatedRemindersCount = computed(() =>
    this.remindersStore.escalatedCount()
  );


  retry(): void {
    this.loadDashboardData();
  }
}
