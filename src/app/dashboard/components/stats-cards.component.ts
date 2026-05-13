import { Component, ChangeDetectionStrategy, inject, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventsStore } from '../../events/stores/events.store';
import { OrganizationStore } from '../../organizations/stores/organization.store';
import { NotificationsStore } from '../../notifications/stores/notifications.store';
import { ApprovalsStore } from '../../approvals/stores/approvals.store';
import { RemindersStore } from '../../reminders/stores/reminders.store';
import { AiStore } from '../../ai/stores/ai.store';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-stats-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SkeletonLoaderComponent],
  template: `
    @if (eventsStore.error(); as error) {
      <div class="mb-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
        <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-medium text-red-800">{{ error }}</p>
          <p class="text-xs text-red-600 mt-0.5">Showing cached data where available</p>
        </div>
        <button
          type="button"
          (click)="retry()"
          class="text-sm text-red-700 hover:text-red-900 underline whitespace-nowrap"
        >
          Retry
        </button>
      </div>
    }
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <!-- Today's Events -->
      <a
        routerLink="/events"
        class="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="text-xs font-medium text-[var(--color-text-secondary)]">Today's Events</span>
        </div>
        @if (eventsStore.loading()) {
          <div class="animate-pulse h-7 bg-gray-200 rounded w-12"></div>
        } @else {
          <p class="text-2xl font-bold text-[var(--color-text-primary)]">{{ todaysEventsCount() }}</p>
        }
        <p class="text-xs text-[var(--color-text-muted)] mt-0.5">{{ upcomingEventsCount() }} upcoming</p>
      </a>

      <!-- Pending Approvals -->
      <a
        routerLink="/approvals"
        class="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
            <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span class="text-xs font-medium text-[var(--color-text-secondary)]">Pending Approvals</span>
        </div>
        <p class="text-2xl font-bold text-[var(--color-text-primary)]">{{ pendingApprovalsCount() }}</p>
        <p class="text-xs text-[var(--color-text-muted)] mt-0.5">Requires your action</p>
      </a>

      <!-- Unread Notifications -->
      <a
        routerLink="/notifications"
        class="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <span class="text-xs font-medium text-[var(--color-text-secondary)]">Notifications</span>
        </div>
        <p class="text-2xl font-bold text-[var(--color-text-primary)]">{{ unreadNotificationsCount() }}</p>
        <p class="text-xs text-[var(--color-text-muted)] mt-0.5">{{ unreadNotificationsCount() }} unread</p>
      </a>

      <!-- Organization -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span class="text-xs font-medium text-[var(--color-text-secondary)]">Organization</span>
        </div>
        @if (orgStore.isLoading()) {
          <app-skeleton-loader variant="text" />
        } @else {
          <p class="text-base font-semibold text-[var(--color-text-primary)] truncate">
            {{ orgStore.activeOrganization()?.name ?? 'No org selected' }}
          </p>
          <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
            {{ orgStore.organizations().length }} org(s) available
          </p>
        }
      </div>
    </div>

    <!-- Urgent Section - Escalated Reminders -->
    @if (escalatedRemindersCount() > 0) {
      <div class="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-semibold text-red-800 text-sm">Urgent: {{ escalatedRemindersCount() }} Escalated Reminder(s)</p>
            <p class="text-xs text-red-600">Requires immediate acknowledgment</p>
          </div>
          <a
            routerLink="/events"
            class="px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50"
          >
            View Events
          </a>
        </div>
      </div>
    }
  `,
})
export class StatsCardsComponent implements OnInit {
  readonly eventsStore = inject(EventsStore);
  readonly orgStore = inject(OrganizationStore);
  readonly notificationsStore = inject(NotificationsStore);
  readonly approvalsStore = inject(ApprovalsStore);
  readonly remindersStore = inject(RemindersStore);
  readonly aiStore = inject(AiStore);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.eventsStore.loadEvents();
    this.notificationsStore.loadNotifications();
    this.aiStore.loadTodayBriefing();
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

  readonly hasTodayBriefing = computed(() =>
    this.aiStore.hasTodayBriefing()
  );

  retry(): void {
    this.loadDashboardData();
  }
}
