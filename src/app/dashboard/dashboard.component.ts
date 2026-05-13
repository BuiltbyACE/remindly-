import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthStore } from '../auth/stores/auth.store';
import { OrganizationStore } from '../organizations/stores/organization.store';
import { EventsStore } from '../events/stores/events.store';
import { StatsCardsComponent } from './components/stats-cards.component';
import { QuickActionsComponent } from './components/quick-actions.component';
import { TodayScheduleComponent } from './components/today-schedule.component';
import { RecentActivityComponent } from './components/recent-activity.component';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    StatsCardsComponent,
    QuickActionsComponent,
    TodayScheduleComponent,
    RecentActivityComponent,
  ],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-[var(--color-text-primary)]">Dashboard</h1>
          <p class="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Welcome back, {{ authStore.userDisplayName() }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-[var(--color-text-muted)]">{{ today | date:'EEEE, MMMM d, y' }}</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <app-stats-cards />

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2">
          <app-today-schedule />
        </div>

        <div>
          <app-recent-activity />
        </div>
      </div>

      <app-quick-actions />
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly orgStore = inject(OrganizationStore);
  readonly eventsStore = inject(EventsStore);
  readonly today = new Date();

  ngOnInit(): void {
    this.eventsStore.loadEvents();
  }
}
