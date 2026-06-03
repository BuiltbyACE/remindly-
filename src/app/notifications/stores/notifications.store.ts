/**
 * NotificationsStore
 * Signal-based state management for the Notifications domain
 */

import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { lastValueFrom, Subscription } from 'rxjs';
import { NotificationsService } from '../services/notifications.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { WebSocketStore } from '../../websocket/websocket.store';
import type {
  Notification,
  NotificationPriority,
  NotificationStatus,
  NotificationFilterOptions,
} from '../models/notification.model';

interface NotificationsState {
  notifications: Notification[];
  selectedNotification: Notification | null;
  loading: boolean;
  error: string | null;
  filters: NotificationFilterOptions;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

const initialState: NotificationsState = {
  notifications: [],
  selectedNotification: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
};

export const NotificationsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withHooks({
    onInit(store) {
      const webSocketStore = inject(WebSocketStore);
      const toastService = inject(ToastService);
      let wsSubscription: Subscription | null = null;

      // Subscribe to notification-related WebSocket messages
      // Backend emits 'notification.new' and 'notification.updated'
      // See app/websocket/enums.py — WebSocketMessageType
      wsSubscription = webSocketStore
        .messagesOfTypes(['notification.new', 'notification.updated'])
        .subscribe((message) => {
          const notification = message.payload as Notification;

          // Add new notification to the list
          if (message.type === 'notification.new') {
            const currentNotifications = store.notifications();
            if (!currentNotifications.find((n) => n.id === notification.id)) {
              patchState(store, {
                notifications: [notification, ...currentNotifications],
                pagination: {
                  ...store.pagination(),
                  total: store.pagination().total + 1,
                },
              });

              // ── Fire a native phone notification immediately ──────────────
              // This is what makes the phone buzz/popup in real time when:
              //   • A secretary creates an event  → executive gets alerted
              //   • An executive approves          → secretary gets alerted
              //   • A reminder fires               → user gets alerted
              const title = (notification as any).subject || 'Remindly';
              const body  = (notification as any).body || (notification as any).message || '';
              const eventId = (notification as any).event_id;
              const approvalId = (notification as any).approval_id;
              const actionUrl = eventId
                ? `/events/${eventId}`
                : approvalId
                  ? `/approvals/${approvalId}`
                  : '/notifications';

              if ('serviceWorker' in navigator && Notification.permission === 'granted') {
                navigator.serviceWorker.ready.then(sw => {
                  sw.showNotification(title, {
                    body,
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/icon-72x72.png',
                    tag: `notif-${notification.id}`,
                    data: { url: actionUrl },
                    vibrate: [200, 100, 200, 100, 200],
                    requireInteraction: notification.priority === 'high' || notification.priority === 'critical',
                    actions: [
                      { action: 'open', title: eventId ? '📅 View Event' : approvalId ? '✅ View Approval' : '🔔 Open' },
                      { action: 'dismiss', title: 'Dismiss' },
                    ],
                  } as NotificationOptions & Record<string, unknown>);
                }).catch(() => { /* SW not ready yet — ignore */ });
              }

              // Also show an in-app toast for critical/high priority
              if (notification.priority === 'critical' || notification.priority === 'high') {
                toastService.warning(`${title}: ${body}`);
              }
            }
          }

          // Update existing notification
          if (message.type === 'notification.updated') {
            const currentNotifications = store.notifications();
            const updatedNotifications = currentNotifications.map((n) =>
              n.id === notification.id ? notification : n
            );
            patchState(store, { notifications: updatedNotifications });

            // Update selected if same
            const selected = store.selectedNotification();
            if (selected?.id === notification.id) {
              patchState(store, { selectedNotification: notification });
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
    unreadCount: computed(() =>
      store.notifications().filter((n) => n.status === 'unread').length
    ),

    criticalUnread: computed(() =>
      store
        .notifications()
        .filter((n) => n.status === 'unread' && n.priority === 'critical').length
    ),

    highPriorityUnread: computed(() =>
      store
        .notifications()
        .filter((n) => n.status === 'unread' && n.priority === 'high').length
    ),

    // Filtered by status
    unreadNotifications: computed(() =>
      store.notifications().filter((n) => n.status === 'unread')
    ),

    readNotifications: computed(() =>
      store.notifications().filter((n) => n.status === 'read' || n.status === 'acknowledged')
    ),

    // Filtered by priority
    criticalNotifications: computed(() =>
      store.notifications().filter((n) => n.priority === 'critical')
    ),

    // Apply current filters
    filteredNotifications: computed(() => {
      const notifications = store.notifications();
      const filters = store.filters();

      return notifications.filter((notification) => {
        if (filters.status && notification.status !== filters.status) return false;
        if (filters.priority && notification.priority !== filters.priority) return false;
        return true;
      });
    }),
  })),

  withMethods(
    (
      store,
      notificationsService = inject(NotificationsService),
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

      selectNotification(notification: Notification | null): void {
        patchState(store, { selectedNotification: notification });
      },

      setFilters(filters: NotificationFilterOptions): void {
        patchState(store, {
          filters,
          pagination: { ...store.pagination(), page: 1 },
        });
      },

      setPage(page: number): void {
        patchState(store, { pagination: { ...store.pagination(), page } });
      },

      // Load notifications
      async loadNotifications(): Promise<void> {
        patchState(store, { loading: true, error: null });

        try {
          const response = await lastValueFrom(
            notificationsService.listMyNotifications(
              store.filters(),
              store.pagination().page,
              store.pagination().pageSize
            )
          );

          patchState(store, {
            notifications: response?.items ?? [],
            pagination: {
              page: response?.page ?? 1,
              pageSize: response?.page_size ?? store.pagination().pageSize,
              total: response?.total ?? 0,
            },
            loading: false,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to load notifications';
          patchState(store, { error: message, loading: false });
        }
      },

      // Mark notification as read (dismiss)
      async dismissNotification(notificationId: string): Promise<boolean> {
        try {
          const notification = await lastValueFrom(
            notificationsService.acknowledgeNotification(notificationId)
          );

          if (notification) {
            // Update in the list
            const updatedNotifications = store
              .notifications()
              .map((n) => (n.id === notificationId ? notification : n));

            patchState(store, {
              notifications: updatedNotifications,
              selectedNotification:
                store.selectedNotification()?.id === notificationId
                  ? notification
                  : store.selectedNotification(),
            });

            return true;
          }
          return false;
        } catch (error) {
          let message = 'Failed to dismiss notification';
          if (error instanceof HttpErrorResponse && error.error?.detail) {
            message = error.error.detail;
          } else if (error instanceof Error) {
            message = error.message;
          }
          toastService.error(message);
          return false;
        }
      },

      // Acknowledge notification (with optional notes)
      async acknowledgeNotification(
        notificationId: string,
        notes?: string
      ): Promise<boolean> {
        try {
          const notification = await lastValueFrom(
            notificationsService.acknowledgeNotification(notificationId, { notes })
          );

          if (notification) {
            // Update in the list
            const updatedNotifications = store
              .notifications()
              .map((n) => (n.id === notificationId ? notification : n));

            patchState(store, {
              notifications: updatedNotifications,
              selectedNotification:
                store.selectedNotification()?.id === notificationId
                  ? notification
                  : store.selectedNotification(),
            });

            toastService.success('Notification acknowledged');
            return true;
          }
          return false;
        } catch (error) {
          let message = 'Failed to acknowledge notification';
          if (error instanceof HttpErrorResponse && error.error?.detail) {
            message = error.error.detail;
          } else if (error instanceof Error) {
            message = error.message;
          }
          toastService.error(message);
          return false;
        }
      },

      // Dismiss all unread notifications
      async dismissAllUnread(): Promise<void> {
        const unreadNotifications = store.notifications().filter(n => n.status === 'unread');
        if (unreadNotifications.length === 0) return;

        // Optimistically update UI immediately
        const updatedNotifications = store.notifications().map((n) =>
          n.status === 'unread' ? { ...n, status: 'acknowledged' as const } : n
        );
        patchState(store, { notifications: updatedNotifications });

        const results = await Promise.allSettled(
          unreadNotifications.map(n =>
            lastValueFrom(notificationsService.acknowledgeNotification(n.id))
          )
        );

        let finalNotifications = [...store.notifications()];
        let succeeded = 0;
        let failed = 0;

        results.forEach((result, index) => {
          const original = unreadNotifications[index];
          if (result.status === 'fulfilled') {
            succeeded++;
            finalNotifications = finalNotifications.map(n => n.id === original.id ? result.value : n);
          } else {
            failed++;
            finalNotifications = finalNotifications.map(n => n.id === original.id ? original : n);
          }
        });

        patchState(store, { notifications: finalNotifications });

        if (succeeded > 0) {
          toastService.success(`${succeeded} notification${succeeded > 1 ? 's' : ''} marked as read`);
        }
        if (failed > 0) {
          toastService.error(`${failed} notification${failed > 1 ? 's' : ''} failed to mark as read`);
        }
      },

      // Reset store state
      reset(): void {
        patchState(store, initialState);
      },
    })
  )
);
