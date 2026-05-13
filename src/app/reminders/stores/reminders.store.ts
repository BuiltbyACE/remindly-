/**
 * RemindersStore
 * Signal-based state management for the Reminders domain
 */

import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { lastValueFrom, Subscription } from 'rxjs';
import { RemindersService } from '../services/reminders.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { WebSocketStore } from '../../websocket/websocket.store';
import type {
  Reminder,
  ReminderStatus,
  ReminderPolicy,
  ReminderPolicyCreate,
} from '../models/reminder.model';

interface RemindersState {
  reminders: Reminder[];
  policies: ReminderPolicy[];
  selectedReminder: Reminder | null;
  selectedPolicy: ReminderPolicy | null;
  loading: boolean;
  error: string | null;
  currentEventId: string | null;
}

const initialState: RemindersState = {
  reminders: [],
  policies: [],
  selectedReminder: null,
  selectedPolicy: null,
  loading: false,
  error: null,
  currentEventId: null,
};

export const RemindersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withHooks({
    onInit(store) {
      const webSocketStore = inject(WebSocketStore);
      const toastService = inject(ToastService);
      let wsSubscription: Subscription | null = null;

      // Subscribe to reminder-related WebSocket messages
      wsSubscription = webSocketStore
        .messagesOfType('reminder.triggered')
        .subscribe((message) => {
          const reminder = message.payload as Reminder;

          // Only update if reminder is for current event
          if (reminder.event_id === store.currentEventId()) {
            const currentReminders = store.reminders();
            const existingIndex = currentReminders.findIndex((r) => r.id === reminder.id);

            let updatedReminders: Reminder[];
            if (existingIndex >= 0) {
              // Update existing
              updatedReminders = currentReminders.map((r) =>
                r.id === reminder.id ? reminder : r
              );
            } else {
              // Add new
              updatedReminders = [...currentReminders, reminder];
            }

            patchState(store, { reminders: updatedReminders });

            // Show toast for triggered reminders
            if (reminder.status === 'triggered') {
              toastService.info(`Reminder: ${reminder.message || 'Event reminder triggered'}`);
            }
          }
        });

      // Cleanup on destroy
      return () => {
        if (wsSubscription) {
          wsSubscription.unsubscribe();
          wsSubscription = null;
        }
      };
    },
  }),

  withComputed((store) => ({
    // Computed signals for filtered counts
    unacknowledgedCount: computed(() =>
      store.reminders().filter((r) => r.status === 'triggered').length
    ),

    escalatedCount: computed(() =>
      store.reminders().filter((r) => r.status === 'escalated').length
    ),

    acknowledgedCount: computed(() =>
      store.reminders().filter((r) => r.status === 'acknowledged').length
    ),

    scheduledCount: computed(() =>
      store.reminders().filter((r) => r.status === 'scheduled').length
    ),

    // Filtered by status
    triggeredReminders: computed(() =>
      store.reminders().filter((r) => r.status === 'triggered')
    ),

    escalatedReminders: computed(() =>
      store.reminders().filter((r) => r.status === 'escalated')
    ),

    acknowledgedReminders: computed(() =>
      store.reminders().filter((r) => r.status === 'acknowledged')
    ),

    scheduledReminders: computed(() =>
      store.reminders().filter((r) => r.status === 'scheduled')
    ),

    // Check if event has reminders requiring attention
    hasUnacknowledgedReminders: computed(() =>
      store.reminders().some((r) => r.status === 'triggered' || r.status === 'escalated')
    ),

    // Default policy
    defaultPolicy: computed(() =>
      store.policies().find((p) => p.is_default)
    ),
  })),

  withMethods(
    (
      store,
      remindersService = inject(RemindersService),
      toastService = inject(ToastService)
    ) => ({
      // Actions
      setLoading(loading: boolean): void {
        patchState(store, { loading });
      },

      setError(error: string | null): void {
        patchState(store, { error, loading: false });
      },

      clearError(): void {
        patchState(store, { error: null });
      },

      selectReminder(reminder: Reminder | null): void {
        patchState(store, { selectedReminder: reminder });
      },

      selectPolicy(policy: ReminderPolicy | null): void {
        patchState(store, { selectedPolicy: policy });
      },

      setCurrentEventId(eventId: string | null): void {
        patchState(store, { currentEventId: eventId });
      },

      // Load reminders for an event
      async loadReminders(eventId: string): Promise<void> {
        patchState(store, { loading: true, error: null, currentEventId: eventId });

        try {
          const response = await lastValueFrom(
            remindersService.listEventReminders(eventId)
          );

          patchState(store, {
            reminders: response?.items ?? [],
            loading: false,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to load reminders';
          patchState(store, { error: message, loading: false });
        }
      },

      // Acknowledge a reminder
      async acknowledgeReminder(eventId: string, reminderId: string): Promise<boolean> {
        try {
          const reminder = await lastValueFrom(
            remindersService.acknowledgeReminder(eventId, reminderId)
          );

          if (reminder) {
            // Update in the list
            const updatedReminders = store
              .reminders()
              .map((r) => (r.id === reminderId ? reminder : r));

            patchState(store, {
              reminders: updatedReminders,
              selectedReminder:
                store.selectedReminder()?.id === reminderId
                  ? reminder
                  : store.selectedReminder(),
            });

            toastService.success('Reminder acknowledged');
            return true;
          }
          return false;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to acknowledge reminder';
          toastService.error(message);
          return false;
        }
      },

      // Load all reminder policies
      async loadPolicies(): Promise<void> {
        patchState(store, { loading: true, error: null });

        try {
          const policies = await lastValueFrom(
            remindersService.listPolicies()
          );

          patchState(store, {
            policies: policies ?? [],
            loading: false,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to load reminder policies';
          patchState(store, { error: message, loading: false });
        }
      },

      // Create a new reminder policy
      async createPolicy(policy: ReminderPolicyCreate): Promise<boolean> {
        try {
          const newPolicy = await lastValueFrom(
            remindersService.createPolicy(policy)
          );

          if (newPolicy) {
            patchState(store, {
              policies: [...store.policies(), newPolicy],
            });

            toastService.success('Reminder policy created');
            return true;
          }
          return false;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to create policy';
          toastService.error(message);
          return false;
        }
      },

      // Delete a reminder policy
      async deletePolicy(policyId: string): Promise<boolean> {
        try {
          await lastValueFrom(
            remindersService.deletePolicy(policyId)
          );

          patchState(store, {
            policies: store.policies().filter((p) => p.id !== policyId),
            selectedPolicy:
              store.selectedPolicy()?.id === policyId
                ? null
                : store.selectedPolicy(),
          });

          toastService.success('Reminder policy deleted');
          return true;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to delete policy';
          toastService.error(message);
          return false;
        }
      },

      // Reset store state
      reset(): void {
        patchState(store, initialState);
      },
    })
  )
);
