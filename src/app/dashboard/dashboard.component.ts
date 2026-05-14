import { Component, ChangeDetectionStrategy, inject, OnInit, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthStore } from '../auth/stores/auth.store';
import { OrganizationStore } from '../organizations/stores/organization.store';
import { EventsStore } from '../events/stores/events.store';
import { RbacStore } from '../auth/stores/rbac.store';
import { AiStore } from '../ai/stores/ai.store';
import { AnalyticsStore } from '../analytics/stores/analytics.store';
import { StatsCardsComponent } from './components/stats-cards.component';
import { QuickActionsComponent } from './components/quick-actions.component';
import { TodayScheduleComponent } from './components/today-schedule.component';
import { RecentActivityComponent } from './components/recent-activity.component';
import { EscalatedAlertComponent } from './components/escalated-alert.component';
import { AiBriefingCardComponent } from './components/ai-briefing-card.component';
import { CriticalAlertsComponent } from './components/critical-alerts.component';
import { PendingApprovalsComponent } from './components/pending-approvals.component';
import { AnalyticsChartsComponent } from './components/analytics-charts.component';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    StatsCardsComponent,
    QuickActionsComponent,
    TodayScheduleComponent,
    RecentActivityComponent,
    EscalatedAlertComponent,
    AiBriefingCardComponent,
    CriticalAlertsComponent,
    PendingApprovalsComponent,
    AnalyticsChartsComponent,
  ],
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ dashboardTitle() }}</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            Welcome back, <span class="font-semibold text-blue-600">{{ authStore.userDisplayName() }}</span>
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-500">{{ today | date:'EEEE, MMMM d, y' }}</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <app-stats-cards />

      <!-- Escalated Alert Banner -->
      <app-escalated-alert />

      <!-- Executive-only: AI Briefing + Critical Alerts -->
      @if (isExecutive()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div class="lg:col-span-2">
            <app-ai-briefing-card />
          </div>
          <div>
            <app-critical-alerts />
          </div>
        </div>
      }

      <!-- Executive-only: Analytics Charts -->
      @if (isExecutive()) {
        <app-analytics-charts />
      }

      <!-- Admin + Executive: Pending Approvals (prominent for admin) -->
      @if (isAdmin() || isExecutive()) {
        <app-pending-approvals />
      }

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
  readonly rbacStore = inject(RbacStore);
  readonly aiStore = inject(AiStore);
  readonly analyticsStore = inject(AnalyticsStore);
  readonly today = new Date();

  readonly isExecutive = computed(() =>
    this.rbacStore.hasPermission()('audit.read')
  );
  readonly isAdmin = computed(() =>
    this.rbacStore.hasPermission()('events.approve') && !this.isExecutive()
  );
  readonly isSecretary = computed(() =>
    !this.isExecutive() && !this.isAdmin()
  );

  readonly dashboardTitle = computed(() => {
    if (this.isExecutive()) return 'Executive Dashboard';
    if (this.isAdmin()) return 'Admin Dashboard';
    return 'Dashboard';
  });

  ngOnInit(): void {
    this.eventsStore.loadEvents();
    if (this.isExecutive()) {
      this.aiStore.loadTodayBriefing();
      this.analyticsStore.loadMetrics();
    }
  }
}
