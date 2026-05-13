/**
 * AuditStore
 * Signal-based state management for the Audit domain
 */

import { computed, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { AuditService } from '../services/audit.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import type {
  AuditLogEntry,
  AuditFilterOptions,
  AuditStats,
  AuditAction,
  AuditSeverity,
} from '../models/audit.model';

interface AuditState {
  entries: AuditLogEntry[];
  selectedEntry: AuditLogEntry | null;
  stats: AuditStats | null;
  filters: AuditFilterOptions;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  availableActions: AuditAction[];
  availableSeverities: AuditSeverity[];
  availableResourceTypes: string[];
  loading: boolean;
  exportLoading: boolean;
  error: string | null;
}

const initialState: AuditState = {
  entries: [],
  selectedEntry: null,
  stats: null,
  filters: {},
  pagination: { page: 1, pageSize: 50, total: 0 },
  availableActions: [],
  availableSeverities: [],
  availableResourceTypes: [],
  loading: false,
  exportLoading: false,
  error: null,
};

export const AuditStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    // Filtered entries
    filteredEntries: computed(() => {
      let entries = store.entries();
      const filters = store.filters();

      if (filters.action) {
        entries = entries.filter((e) => e.action === filters.action);
      }
      if (filters.severity) {
        entries = entries.filter((e) => e.severity === filters.severity);
      }
      if (filters.user_id) {
        entries = entries.filter((e) => e.user_id === filters.user_id);
      }
      if (filters.resource_type) {
        entries = entries.filter((e) => e.resource_type === filters.resource_type);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        entries = entries.filter(
          (e) =>
            e.description.toLowerCase().includes(search) ||
            e.user_email.toLowerCase().includes(search)
        );
      }

      return entries;
    }),

    // Entries by severity
    criticalEntries: computed(() => store.entries().filter((e) => e.severity === 'critical')),
    errorEntries: computed(() => store.entries().filter((e) => e.severity === 'error')),

    // Has active filters
    hasActiveFilters: computed(() => Object.keys(store.filters()).length > 0),
  })),

  withMethods(
    (store, auditService = inject(AuditService), toastService = inject(ToastService)) => ({
      /**
       * Load audit log entries
       */
      async loadEntries(page = 1): Promise<void> {
        patchState(store, { loading: true, error: null });

        try {
          const response = await lastValueFrom(
            auditService.listAuditLogs(page, store.pagination().pageSize, store.filters())
          );

          patchState(store, {
            entries: response?.items ?? [],
            pagination: {
              page: response?.page ?? 1,
              pageSize: response?.page_size ?? 50,
              total: response?.total ?? 0,
            },
            loading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load audit logs';
          patchState(store, { error: message, loading: false });
        }
      },

      /**
       * Load filter options
       */
      async loadFilterOptions(): Promise<void> {
        try {
          const options = await lastValueFrom(auditService.getFilterOptions());
          patchState(store, {
            availableActions: options.actions as AuditAction[],
            availableSeverities: options.severities as AuditSeverity[],
            availableResourceTypes: options.resource_types,
          });
        } catch (error) {
          console.error('Failed to load filter options:', error);
        }
      },

      /**
       * Load audit statistics
       */
      async loadStats(dateFrom?: string, dateTo?: string): Promise<void> {
        try {
          const stats = await lastValueFrom(auditService.getAuditStats(dateFrom, dateTo));
          patchState(store, { stats });
        } catch (error) {
          console.error('Failed to load audit stats:', error);
        }
      },

      /**
       * Set filters
       */
      setFilters(filters: AuditFilterOptions): void {
        patchState(store, {
          filters: { ...store.filters(), ...filters },
          pagination: { ...store.pagination(), page: 1 },
        });
        this.loadEntries(1);
      },

      /**
       * Clear all filters
       */
      clearFilters(): void {
        patchState(store, {
          filters: {},
          pagination: { ...store.pagination(), page: 1 },
        });
        this.loadEntries(1);
      },

      /**
       * Select an entry for detail view
       */
      selectEntry(entry: AuditLogEntry | null): void {
        patchState(store, { selectedEntry: entry });
      },

      /**
       * Export audit logs
       */
      async exportLogs(format: 'csv' | 'json' | 'xlsx'): Promise<string | null> {
        patchState(store, { exportLoading: true });

        try {
          const response = await lastValueFrom(
            auditService.exportAuditLogs({
              format,
              filters: store.filters(),
            })
          );

          patchState(store, { exportLoading: false });
          toastService.success(`Audit log exported as ${format.toUpperCase()}`);
          return response.download_url;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Export failed';
          patchState(store, { exportLoading: false });
          toastService.error(message);
          return null;
        }
      },

      /**
       * Go to next page
       */
      nextPage(): void {
        const current = store.pagination();
        if (current.page * current.pageSize < current.total) {
          this.loadEntries(current.page + 1);
        }
      },

      /**
       * Go to previous page
       */
      previousPage(): void {
        const current = store.pagination();
        if (current.page > 1) {
          this.loadEntries(current.page - 1);
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
