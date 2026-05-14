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
    DatePipe, StatsCardsComponent, QuickActionsComponent, TodayScheduleComponent,
    RecentActivityComponent, EscalatedAlertComponent, AiBriefingCardComponent,
    CriticalAlertsComponent, PendingApprovalsComponent, AnalyticsChartsComponent,
  ],
  styles: [`
    :host { display: block; }

    /* ── Hero ── clean blue, no orbs */
    .hero {
      background: linear-gradient(135deg, #0D2137 0%, #1565C0 100%);
      border-radius: 14px;
      padding: 28px 32px;
      color: #fff;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }

    .hero-title {
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 4px;
      letter-spacing: -.01em;
    }

    .hero-sub {
      font-size: 13.5px;
      opacity: .8;
      margin: 0;
    }

    .hero-sub strong { color: #90CAF9; font-weight: 600; }

    .date-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,.12);
      border: 1px solid rgba(255,255,255,.2);
      border-radius: 8px;
      padding: 7px 14px;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
    }

    /* ── Section heading ── */
    .section-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .09em;
      text-transform: uppercase;
      color: #94A3B8;
      margin: 0 0 10px;
    }

    /* ── Two-col grid ── */
    .two-col {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 14px;
      align-items: start;
    }
    @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }

    /* ── Spacing ── */
    .section { margin-bottom: 24px; }
  `],
  template: `
    <div>
      <!-- Hero -->
      <div class="hero">
        <div>
          <h1 class="hero-title">{{ dashboardTitle() }}</h1>
          <p class="hero-sub">
            Welcome back, <strong>{{ authStore.userDisplayName() }}</strong>
          </p>
        </div>
        <span class="date-chip">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          {{ today | date:'EEE, MMM d, y' }}
        </span>
      </div>

      <!-- Stats -->
      <div class="section">
        <p class="section-title">Overview</p>
        <app-stats-cards />
      </div>

      <!-- Escalated alert -->
      <app-escalated-alert />

      <!-- Executive: AI + Alerts -->
      @if (isExecutive()) {
        <div class="section">
          <p class="section-title">Intelligence</p>
          <div class="two-col">
            <app-ai-briefing-card />
            <app-critical-alerts />
          </div>
        </div>
      }

      <!-- Executive: Analytics -->
      @if (isExecutive()) {
        <div class="section">
          <p class="section-title">Analytics</p>
          <app-analytics-charts />
        </div>
      }

      <!-- Pending Approvals -->
      @if (isAdmin() || isExecutive()) {
        <div class="section">
          <p class="section-title">Pending Action</p>
          <app-pending-approvals />
        </div>
      }

      <!-- Schedule + Activity -->
      <div class="section">
        <p class="section-title">Schedule & Activity</p>
        <div class="two-col">
          <app-today-schedule />
          <app-recent-activity />
        </div>
      </div>

      <!-- Quick Actions -->
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

  readonly isExecutive = computed(() => this.rbacStore.hasPermission()('audit.read'));
  readonly isAdmin = computed(() => this.rbacStore.hasPermission()('events.approve') && !this.isExecutive());
  readonly isSecretary = computed(() => !this.isExecutive() && !this.isAdmin());

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
