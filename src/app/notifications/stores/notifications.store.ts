/**
 * NotificationsStore
 * Signal-based state management for the Notifications domain
 */

import { computed, inject } from '@angular/core';
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

              // Show toast for critical notifications
              if (notification.priority === 'critical') {
                toastService.warning(`${notification.title}: ${notification.message}`);
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
          const message =
            error instanceof Error ? error.message : 'Failed to dismiss notification';
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
          const message =
            error instanceof Error ? error.message : 'Failed to acknowledge notification';
          toastService.error(message);
          return false;
        }
      },

      // Dismiss all unread notifications
      async dismissAllUnread(): Promise<void> {
        const unread = store.notifications().filter((n) => n.status === 'unread');
        
        for (const notification of unread) {
          await this.dismissNotification(notification.id);
        }
        
        toastService.success(`${unread.length} notifications marked as read`);
      },

      // Reset store state
      reset(): void {
        patchState(store, initialState);
      },
    })
  )
);
