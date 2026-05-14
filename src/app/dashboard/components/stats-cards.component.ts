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
  styles: [`
    :host { display: block; }

    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    @media (max-width: 1100px) { .grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 500px)  { .grid { grid-template-columns: 1fr; } }

    .card {
      background: #fff;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 20px;
      text-decoration: none;
      display: block;
      transition: box-shadow var(--transition), transform var(--transition), border-color var(--transition);
      box-shadow: 0 1px 3px rgba(0,0,0,.05);
    }
    .card:hover {
      box-shadow: 0 4px 16px rgba(21,101,192,.12);
      border-color: #BFDBFE;
      transform: translateY(-2px);
    }

    /* icon */
    .icon-wrap {
      width: 44px; height: 44px;
      border-radius: 10px;
      background: #EFF6FF;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 14px;
    }
    .icon-wrap svg { color: #1565C0; }

    .label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: .07em;
      text-transform: uppercase;
      color: #64748B;
      margin-bottom: 4px;
    }

    .value {
      font-size: 30px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -.02em;
      line-height: 1;
      margin-bottom: 6px;
    }
    .value-md {
      font-size: 18px;
      font-weight: 700;
      color: #0F172A;
      line-height: 1.2;
      margin-bottom: 6px;
    }

    .sub {
      font-size: 12.5px;
      color: #1E88E5;
      font-weight: 500;
    }
    .sub-muted { color: #64748B; }

    /* skeleton */
    .skel {
      height: 30px; width: 60px;
      border-radius: 6px;
      background: #F1F5F9;
      animation: pulse 1.5s ease infinite;
    }
  `],
  template: `
    <div class="grid">

      <!-- Today's Events -->
      <a routerLink="/events" class="card" aria-label="Today's events">
        <div class="icon-wrap">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <p class="label">Today's Events</p>
        @if (eventsStore.loading()) {
          <div class="skel"></div>
        } @else {
          <p class="value">{{ todaysEventsCount() }}</p>
        }
        <p class="sub">{{ upcomingEventsCount() }} upcoming</p>
      </a>

      <!-- Pending Approvals -->
      <a routerLink="/approvals" class="card" aria-label="Pending approvals">
        <div class="icon-wrap">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <p class="label">Pending Approvals</p>
        <p class="value">{{ pendingApprovalsCount() }}</p>
        <p class="sub" [class.sub-muted]="pendingApprovalsCount() === 0">
          {{ pendingApprovalsCount() === 0 ? 'Nothing pending' : 'Requires action' }}
        </p>
      </a>

      <!-- Notifications -->
      <a routerLink="/notifications" class="card" aria-label="Notifications">
        <div class="icon-wrap">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </div>
        <p class="label">Notifications</p>
        <p class="value">{{ unreadNotificationsCount() }}</p>
        <p class="sub">{{ unreadNotificationsCount() }} unread</p>
      </a>

      <!-- Organisation -->
      <div class="card">
        <div class="icon-wrap">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </div>
        <p class="label">Organisation</p>
        @if (orgStore.isLoading()) {
          <app-skeleton-loader variant="text" />
        } @else {
          <p class="value-md">{{ orgStore.activeOrganization()?.name ?? 'No org' }}</p>
        }
        <p class="sub">{{ orgStore.organizations().length }} workspace(s)</p>
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

  ngOnInit(): void { this.loadDashboardData(); }

  loadDashboardData(): void {
    this.eventsStore.loadEvents();
    this.notificationsStore.loadNotifications();
  }

  readonly todaysEventsCount = computed(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    return this.eventsStore.events().filter(e => {
      if (!e.starts_at) return false;
      const d = new Date(e.starts_at);
      return d >= today && d < tomorrow;
    }).length;
  });

  readonly upcomingEventsCount = computed(() => {
    const now = new Date();
    return this.eventsStore.events().filter(e => e.starts_at && new Date(e.starts_at) > now).length;
  });

  readonly pendingApprovalsCount = computed(() => this.approvalsStore.pendingCount());
  readonly unreadNotificationsCount = computed(() => this.notificationsStore.unreadCount());
  readonly escalatedRemindersCount = computed(() => this.remindersStore.escalatedCount());

  retry(): void { this.loadDashboardData(); }
}
