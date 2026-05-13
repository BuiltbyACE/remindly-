import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { NotificationItemComponent } from '../notification-item/notification-item.component';
import { NotificationsStore } from '../../stores/notifications.store';
import {
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  STATUS_LABELS,
  type NotificationPriority,
  type NotificationStatus,
} from '../../models/notification.model';

@Component({
  selector: 'app-notification-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NotificationItemComponent],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-[var(--color-border)]">
      <!-- Header with Filters -->
      <div class="p-4 border-b border-[var(--color-border)]">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-[var(--color-text-primary)]">
              Notifications
              @if (store.unreadCount() > 0) {
                <span class="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {{ store.unreadCount() }} unread
                </span>
              }
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)] mt-0.5">
              @if (store.criticalUnread() > 0) {
                <span class="text-red-600 font-medium">{{ store.criticalUnread() }} critical</span>
                <span class="text-[var(--color-text-muted)]"> • </span>
              }
              {{ store.notifications().length }} total
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-1.5">
            <div class="flex gap-1">
              <button
                type="button"
                (click)="setStatusFilter(null)"
                [class]="getFilterClasses('status', null)"
              >
                All
              </button>
              <button
                type="button"
                (click)="setStatusFilter('unread')"
                [class]="getFilterClasses('status', 'unread')"
              >
                Unread
              </button>
              <button
                type="button"
                (click)="setStatusFilter('acknowledged')"
                [class]="getFilterClasses('status', 'acknowledged')"
              >
                Acknowledged
              </button>
            </div>

            <div class="flex gap-1 ml-1.5">
              @for (priority of priorities; track priority) {
                <button
                  type="button"
                  (click)="setPriorityFilter(priority)"
                  [class]="getPriorityFilterClasses(priority)"
                >
                  {{ getPriorityLabel(priority) }}
                </button>
              }
            </div>

            @if (store.unreadCount() > 0) {
              <button
                type="button"
                (click)="markAllRead()"
                class="ml-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (store.loading()) {
        <div class="p-6">
          <div class="space-y-3">
            @for (i of [1,2,3,4]; track i) {
              <div class="animate-pulse flex gap-3">
                <div class="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Error State -->
      @else if (store.error(); as error) {
        <div class="p-6 text-center">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p class="text-sm text-[var(--color-text-secondary)]">{{ error }}</p>
          <button
            type="button"
            (click)="retry.emit()"
            class="mt-3 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Retry
          </button>
        </div>
      }

      <!-- Empty State -->
      @else if (filteredNotifications().length === 0) {
        <div class="p-10 text-center">
          <div class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p class="text-[var(--color-text-secondary)]">
            @if (store.filters().status || store.filters().priority) {
              No notifications match your filters
            } @else {
              No notifications yet
            }
          </p>
        </div>
      }

      <!-- Notification List -->
      @else {
        <div class="divide-y divide-[var(--color-border)]">
          @for (notification of filteredNotifications(); track notification.id) {
            <app-notification-item
              [notification]="notification"
              (dismissed)="onDismissed($event)"
              (acknowledged)="onAcknowledged($event)"
            />
          }
        </div>

        <!-- Pagination -->
        @if (store.pagination().total > store.pagination().pageSize) {
          <div class="p-3 border-t border-[var(--color-border)] flex items-center justify-between">
            <p class="text-sm text-[var(--color-text-muted)]">
              Showing {{ (store.pagination().page - 1) * store.pagination().pageSize + 1 }} -
              {{ min(store.pagination().page * store.pagination().pageSize, store.pagination().total) }}
              of {{ store.pagination().total }}
            </p>
            <div class="flex gap-2">
              <button
                type="button"
                (click)="previousPage()"
                [disabled]="store.pagination().page === 1"
                class="px-2.5 py-1.5 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-alt)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                (click)="nextPage()"
                [disabled]="store.pagination().page * store.pagination().pageSize >= store.pagination().total"
                class="px-2.5 py-1.5 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-alt)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class NotificationListComponent {
  readonly store = inject(NotificationsStore);

  readonly showFilters = input<boolean>(true);
  readonly retry = output<void>();

  readonly priorities: NotificationPriority[] = ['critical', 'high', 'medium', 'low'];

  readonly filteredNotifications = () => this.store.filteredNotifications();

  setStatusFilter(status: NotificationStatus | null): void {
    this.store.setFilters({ ...this.store.filters(), status: status || undefined });
  }

  setPriorityFilter(priority: NotificationPriority): void {
    const currentFilters = this.store.filters();
    const newPriority = currentFilters.priority === priority ? undefined : priority;
    this.store.setFilters({ ...currentFilters, priority: newPriority });
  }

  getFilterClasses(type: 'status' | 'priority', value: NotificationStatus | NotificationPriority | null): string {
    const baseClasses = 'px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors';
    const currentValue = type === 'status' ? this.store.filters().status : this.store.filters().priority;
    const isActive = value === null ? !currentValue : currentValue === value;

    if (isActive) {
      return `${baseClasses} bg-blue-600 text-white`;
    }
    return `${baseClasses} border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]`;
  }

  getPriorityFilterClasses(priority: NotificationPriority): string {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-lg border transition-colors';
    const isActive = this.store.filters().priority === priority;

    if (isActive) {
      return `${baseClasses} ${PRIORITY_COLORS[priority]}`;
    }
    return `${baseClasses} border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]`;
  }

  getPriorityLabel(priority: NotificationPriority): string {
    return PRIORITY_LABELS[priority];
  }

  getStatusLabel(status: NotificationStatus): string {
    return STATUS_LABELS[status];
  }

  async markAllRead(): Promise<void> {
    await this.store.dismissAllUnread();
  }

  onDismissed(id: string): void {
  }

  onAcknowledged(id: string): void {
  }

  previousPage(): void {
    const currentPage = this.store.pagination().page;
    if (currentPage > 1) {
      this.store.setPage(currentPage - 1);
      this.store.loadNotifications();
    }
  }

  nextPage(): void {
    const { page, pageSize, total } = this.store.pagination();
    if (page * pageSize < total) {
      this.store.setPage(page + 1);
      this.store.loadNotifications();
    }
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
