/**
 * NotificationItem Component
 * Single notification card with actions
 */

import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NotificationsStore } from '../../stores/notifications.store';
import {
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  PRIORITY_ICONS,
  STATUS_LABELS,
  type Notification,
} from '../../models/notification.model';

@Component({
  selector: 'app-notification-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe],
  template: `
    <div
      class="p-4 border-b border-[var(--color-border)] transition-colors group"
      [class.bg-blue-50]="notification().status === 'unread'"
      [class.hover:bg-[var(--color-surface-alt)]]="notification().status !== 'unread'"
    >
      <div class="flex items-start gap-3">
        <!-- Priority Icon -->
        <div
          class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
          [class]="getPriorityBgClass(notification().priority)"
        >
          <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getPriorityIcon(notification().priority)" />
          </svg>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div>
              <!-- Title & Priority Badge -->
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-sm font-medium text-[var(--color-text-primary)]">
                  {{ notification().title }}
                </h3>
                <span
                  class="px-1.5 py-0.5 text-xs font-medium rounded border"
                  [class]="getPriorityClass(notification().priority)"
                >
                  {{ getPriorityLabel(notification().priority) }}
                </span>
                @if (notification().status === 'unread') {
                  <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                }
              </div>

              <!-- Message -->
              <p class="text-sm text-[var(--color-text-secondary)]">
                {{ notification().message }}
              </p>

              <!-- Metadata -->
              <div class="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-muted)]">
                <span>{{ notification().created_at | date:'MMM d, h:mm a' }}</span>
                <span>{{ getStatusLabel(notification().status) }}</span>
                @if (notification().event_id) {
                  <a
                    [routerLink]="['/events', notification().event_id]"
                    class="text-blue-600 hover:text-blue-800"
                  >
                    View Event →
                  </a>
                }
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              @if (notification().status === 'unread') {
                <button
                  type="button"
                  (click)="onDismiss(); $event.stopPropagation()"
                  class="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)] rounded-lg transition-colors"
                  title="Mark as read"
                >
                  <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              }
              
              @if (notification().status !== 'acknowledged') {
                <button
                  type="button"
                  (click)="onAcknowledge(); $event.stopPropagation()"
                  class="p-1.5 text-[var(--color-text-muted)] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Acknowledge"
                >
                  <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NotificationItemComponent {
  readonly store = inject(NotificationsStore);

  readonly notification = input.required<Notification>();
  readonly dismissed = output<string>();
  readonly acknowledged = output<string>();

  getPriorityClass(priority: Notification['priority']): string {
    return PRIORITY_COLORS[priority];
  }

  getPriorityBgClass(priority: Notification['priority']): string {
    const bgColors: Record<Notification['priority'], string> = {
      critical: 'bg-red-100 text-red-600',
      high: 'bg-orange-100 text-orange-600',
      medium: 'bg-yellow-100 text-yellow-600',
      low: 'bg-gray-100 text-gray-600',
    };
    return bgColors[priority];
  }

  getPriorityLabel(priority: Notification['priority']): string {
    return PRIORITY_LABELS[priority];
  }

  getPriorityIcon(priority: Notification['priority']): string {
    return PRIORITY_ICONS[priority];
  }

  getStatusLabel(status: Notification['status']): string {
    return STATUS_LABELS[status];
  }

  async onDismiss(): Promise<void> {
    const success = await this.store.dismissNotification(this.notification().id);
    if (success) {
      this.dismissed.emit(this.notification().id);
    }
  }

  async onAcknowledge(): Promise<void> {
    const success = await this.store.acknowledgeNotification(this.notification().id);
    if (success) {
      this.acknowledged.emit(this.notification().id);
    }
  }
}
