import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { EventsStore } from '../../events/stores/events.store';
import { NotificationsStore } from '../../notifications/stores/notifications.store';
import { ApprovalsStore } from '../../approvals/stores/approvals.store';
import { RemindersStore } from '../../reminders/stores/reminders.store';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import type { Event } from '../../events/models/event.model';
import type { Notification } from '../../notifications/models/notification.model';
import type { Approval } from '../../approvals/models/approval.model';
import type { Reminder } from '../../reminders/models/reminder.model';

type ActivityType =
  | 'event_created'
  | 'event_updated'
  | 'event_scheduled'
  | 'event_completed'
  | 'notification_received'
  | 'approval_requested'
  | 'approval_processed'
  | 'reminder_triggered';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  routerLink: string;
  source: 'event' | 'notification' | 'approval' | 'reminder';
}

@Component({
  selector: 'app-recent-activity',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, SkeletonLoaderComponent],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <div class="p-5 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-bold text-gray-900">Recent Activity</h2>
          <a
            routerLink="/events"
            class="text-sm text-blue-600 hover:text-blue-800 font-semibold"
          >
            View All
          </a>
        </div>
      </div>

      <div class="p-5">
        @if (isLoading()) {
          <app-skeleton-loader variant="list" [count]="5" />
        } @else if (recentActivity().length === 0) {
          <div class="text-center py-8">
            <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <svg aria-hidden="true" class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-sm text-gray-500">No recent activity</p>
          </div>
        } @else {
          <div class="space-y-4">
            @for (activity of recentActivity().slice(0, 5); track activity.id) {
              <a
                [routerLink]="activity.routerLink"
                class="flex items-start gap-3 hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors group"
              >
                <!-- Activity Icon -->
                <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                     [class]="getActivityIconBg(activity.type, activity.source)">
                  <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                       [class]="getActivityIconColor(activity.type, activity.source)">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getActivityIcon(activity.type)" />
                  </svg>
                </div>

                <!-- Activity Details -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {{ activity.title }}
                  </p>
                  <p class="text-xs text-gray-500">{{ activity.description }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <p class="text-xs text-gray-400">
                      {{ activity.timestamp | date:'MMM d, h:mm a' }}
                    </p>
                    @if (activity.priority) {
                      <span class="w-2 h-2 rounded-full"
                            [class]="getPriorityDot(activity.priority)"></span>
                    }
                  </div>
                </div>
              </a>
            }
          </div>

          @if (recentActivity().length > 5) {
            <div class="mt-4 pt-4 border-t border-gray-200">
              <a
                routerLink="/events"
                class="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                View all activity
                <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class RecentActivityComponent {
  readonly eventsStore = inject(EventsStore);
  readonly notificationsStore = inject(NotificationsStore);
  readonly approvalsStore = inject(ApprovalsStore);
  readonly remindersStore = inject(RemindersStore);

  readonly isLoading = computed(() =>
    this.eventsStore.loading() ||
    this.notificationsStore.loading() ||
    this.approvalsStore.loading()
  );

  readonly recentActivity = computed<ActivityItem[]>(() => {
    const eventActivities = this.eventsStore.events().map(e => this.mapEventToActivity(e));
    const notificationActivities = this.notificationsStore.notifications().map(n => this.mapNotificationToActivity(n));
    const approvalActivities = this.approvalsStore.approvals().map(a => this.mapApprovalToActivity(a));
    const reminderActivities = this.remindersStore.reminders().map(r => this.mapReminderToActivity(r));

    return [...eventActivities, ...notificationActivities, ...approvalActivities, ...reminderActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  private mapEventToActivity(event: Event): ActivityItem {
    let type: ActivityType = 'event_created';
    let description = 'New event created';

    switch (event.status) {
      case 'pending_approval':
        type = 'event_updated';
        description = 'Event submitted for approval';
        break;
      case 'approved':
        type = 'event_updated';
        description = 'Event approved';
        break;
      case 'scheduled':
        type = 'event_scheduled';
        description = `Scheduled for ${event.starts_at ? new Date(event.starts_at).toLocaleDateString() : 'TBD'}`;
        break;
      case 'active':
        type = 'event_updated';
        description = 'Event is now active';
        break;
      case 'completed':
        type = 'event_completed';
        description = 'Event completed';
        break;
      case 'cancelled':
        type = 'event_updated';
        description = 'Event cancelled';
        break;
    }

    return {
      id: event.id,
      type,
      title: event.title ?? 'Untitled Event',
      description,
      timestamp: event.updated_at ?? event.created_at,
      priority: event.priority,
      routerLink: `/events/${event.id}`,
      source: 'event',
    };
  }

  private mapNotificationToActivity(notification: Notification): ActivityItem {
    return {
      id: notification.id,
      type: 'notification_received',
      title: notification.title ?? 'Notification',
      description: notification.message ?? '',
      timestamp: notification.created_at,
      priority: notification.priority,
      routerLink: notification.event_id ? `/events/${notification.event_id}` : '/notifications',
      source: 'notification',
    };
  }

  private mapApprovalToActivity(approval: Approval): ActivityItem {
    const isPending = approval.status === 'pending';
    return {
      id: approval.id,
      type: isPending ? 'approval_requested' : 'approval_processed',
      title: approval.event_title ?? 'Approval Request',
      description: isPending
        ? `Approval requested by ${approval.requested_by_name ?? 'Unknown'}`
        : `Approval ${approval.status} by ${approval.processed_by_name ?? 'Unknown'}`,
      timestamp: approval.processed_at ?? approval.requested_at,
      priority: isPending ? 'high' : 'medium',
      routerLink: `/events/${approval.event_id}`,
      source: 'approval',
    };
  }

  private mapReminderToActivity(reminder: Reminder): ActivityItem {
    const isTriggered = reminder.status === 'triggered';
    return {
      id: reminder.id,
      type: 'reminder_triggered',
      title: isTriggered ? 'Reminder Triggered' : 'Reminder Acknowledged',
      description: 'Event reminder',
      timestamp: reminder.acknowledged_at ?? reminder.scheduled_for,
      priority: isTriggered ? 'high' : 'medium',
      routerLink: `/events/${reminder.event_id}`,
      source: 'reminder',
    };
  }

  getActivityIcon(type: ActivityType): string {
    const icons: Record<ActivityType, string> = {
      event_created: 'M12 4v16m8-8H4',
      event_updated: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      event_scheduled: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      event_completed: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      notification_received: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      approval_requested: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      approval_processed: 'M5 13l4 4L19 7',
      reminder_triggered: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    };
    return icons[type];
  }

  getActivityIconBg(type: ActivityType, source: ActivityItem['source']): string {
    const sourceColors: Record<ActivityItem['source'], string> = {
      event: 'bg-blue-100',
      notification: 'bg-purple-100',
      approval: 'bg-yellow-100',
      reminder: 'bg-orange-100',
    };
    return sourceColors[source] ?? 'bg-gray-100';
  }

  getActivityIconColor(type: ActivityType, source: ActivityItem['source']): string {
    const sourceColors: Record<ActivityItem['source'], string> = {
      event: 'text-blue-600',
      notification: 'text-purple-600',
      approval: 'text-yellow-600',
      reminder: 'text-orange-600',
    };
    return sourceColors[source] ?? 'text-gray-600';
  }

  getPriorityDot(priority: ActivityItem['priority']): string {
    const colors: Record<string, string> = {
      low: 'bg-gray-400',
      medium: 'bg-blue-400',
      high: 'bg-orange-400',
      critical: 'bg-red-500',
    };
    return colors[priority ?? 'low'];
  }
}
