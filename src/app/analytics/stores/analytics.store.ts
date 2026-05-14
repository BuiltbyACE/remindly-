/**
 * AnalyticsStore
 * Signal-based state management for the Analytics domain
 */

import { computed, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { AnalyticsService } from '../services/analytics.service';
import { ToastService } from '@shared/components/toast/toast.service';
import type {
  Dashboard,
  AnalyticsResponse,
  AnalyticsTimeRange,
  EventVolumeMetrics,
  ApprovalMetrics,
} from '../models/analytics.model';

interface AnalyticsState {
  dashboard: Dashboard | null;
  metrics: AnalyticsResponse | null;
  timeRange: AnalyticsTimeRange;
  loading: boolean;
  exportLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  dashboard: null,
  metrics: null,
  timeRange: '30d',
  loading: false,
  exportLoading: false,
  error: null,
};

export const AnalyticsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    // Quick stats from metrics
    totalEvents: computed(() => store.metrics()?.event_metrics?.total_events ?? 0),
    pendingApprovals: computed(() => store.metrics()?.approval_metrics?.pending_approvals ?? 0),
    avgApprovalTime: computed(() => store.metrics()?.approval_metrics?.avg_approval_time_hours ?? 0),
    escalationRate: computed(() => store.metrics()?.reminder_metrics?.escalation_rate ?? 0),

    // Has data
    hasData: computed(() => !!store.metrics()),
  })),

  withMethods(
    (store, analyticsService = inject(AnalyticsService), toastService = inject(ToastService)) => ({
      /**
       * Load main dashboard
       */
      async loadDashboard(): Promise<void> {
        patchState(store, { loading: true, error: null });

        try {
          const dashboard = await lastValueFrom(
            analyticsService.getDashboard(store.timeRange())
          );
          patchState(store, { dashboard, loading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load dashboard';
          patchState(store, { error: message, loading: false });
        }
      },

      /**
       * Load detailed metrics
       */
      async loadMetrics(): Promise<void> {
        patchState(store, { loading: true, error: null });

        try {
          const metrics = await lastValueFrom(
            analyticsService.getMetrics({
              time_range: store.timeRange(),
              metrics: ['events', 'approvals', 'reminders', 'notifications', 'executive'],
            })
          );
          patchState(store, { metrics, loading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load metrics';
          patchState(store, { error: message, loading: false });
        }
      },

      /**
       * Set time range and reload
       */
      async setTimeRange(range: AnalyticsTimeRange): Promise<void> {
        patchState(store, { timeRange: range });
        await this.loadDashboard();
        await this.loadMetrics();
      },

      /**
       * Export analytics report
       */
      async exportReport(format: 'pdf' | 'csv'): Promise<string | null> {
        patchState(store, { exportLoading: true });

        try {
          const response = await lastValueFrom(
            analyticsService.exportReport(format, store.timeRange())
          );
          patchState(store, { exportLoading: false });
          toastService.success(`Report exported as ${format.toUpperCase()}`);
          return response.download_url;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Export failed';
          patchState(store, { exportLoading: false });
          toastService.error(message);
          return null;
        }
      },

      /**
       * Clear error state
       */
      clearError(): void {
        patchState(store, { error: null });
      },

      /**
       * Reset store state
       */
      reset(): void {
        patchState(store, initialState);
      },
    })
  )
);
