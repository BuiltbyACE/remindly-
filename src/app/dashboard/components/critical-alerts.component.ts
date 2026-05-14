import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApprovalsStore } from '../../approvals/stores/approvals.store';
import { RemindersStore } from '../../reminders/stores/reminders.store';
import { NotificationsStore } from '../../notifications/stores/notifications.store';

interface AlertItem {
  id: string;
  type: 'approval_needed' | 'escalated_reminder' | 'critical_notification';
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  routerLink: string;
}

@Component({
  selector: 'app-critical-alerts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (criticalAlerts().length > 0) {
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="p-5 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <svg aria-hidden="true" class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-base font-bold text-gray-900">Requires Immediate Attention</h2>
              <p class="text-xs text-gray-500">{{ criticalAlerts().length }} item(s) need your action</p>
            </div>
          </div>
        </div>

        <div class="p-5 space-y-3">
          @for (alert of criticalAlerts(); track alert.id) {
            <a
              [routerLink]="alert.routerLink"
              class="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50 group"
              [class]="getAlertBorder(alert.severity)"
            >
              <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                   [class]="getAlertIconBg(alert.severity)">
                <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     [class]="getAlertIconColor(alert.severity)">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        [attr.d]="getAlertIcon(alert.type)" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {{ alert.title }}
                </p>
                <p class="text-xs text-gray-500">{{ alert.description }}</p>
              </div>
              <svg aria-hidden="true" class="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          }
        </div>

        @if (criticalAlerts().length > 3) {
          <div class="px-5 pb-5">
            <a
              routerLink="/approvals"
              class="text-sm text-blue-600 hover:text-blue-800 font-semibold"
            >
              View all pending items →
            </a>
          </div>
        }
      </div>
    }
  `,
})
export class CriticalAlertsComponent {
  readonly approvalsStore = inject(ApprovalsStore);
  readonly remindersStore = inject(RemindersStore);
  readonly notificationsStore = inject(NotificationsStore);

  readonly criticalAlerts = computed<AlertItem[]>(() => {
    const alerts: AlertItem[] = [];

    const pendingApprovals = this.approvalsStore.actionableApprovals();
    for (const approval of pendingApprovals) {
      alerts.push({
        id: `approval-${approval.id}`,
        type: 'approval_needed',
        severity: 'high',
        title: `Approval needed: ${approval.event_title ?? 'Event'}`,
        description: `Requested by ${approval.requested_by_name ?? 'Unknown'}`,
        routerLink: `/events/${approval.event_id}`,
      });
    }

    const escalatedCount = this.remindersStore.escalatedCount();
    if (escalatedCount > 0) {
      alerts.push({
        id: 'escalated-reminders',
        type: 'escalated_reminder',
        severity: 'critical',
        title: `${escalatedCount} Escalated Reminder(s)`,
        description: 'Requires immediate acknowledgment',
        routerLink: '/events',
      });
    }

    const criticalNotifications = this.notificationsStore.criticalUnread();
    if (criticalNotifications > 0) {
      alerts.push({
        id: 'critical-notifications',
        type: 'critical_notification',
        severity: 'medium',
        title: `${criticalNotifications} Critical Notification(s)`,
        description: 'Unread high-priority notifications',
        routerLink: '/notifications',
      });
    }

    return alerts;
  });

  getAlertBorder(severity: AlertItem['severity']): string {
    const borders: Record<string, string> = {
      critical: 'border-l-4 border-l-red-500',
      high: 'border-l-4 border-l-orange-400',
      medium: 'border-l-4 border-l-yellow-400',
    };
    return borders[severity] ?? '';
  }

  getAlertIconBg(severity: AlertItem['severity']): string {
    const colors: Record<string, string> = {
      critical: 'bg-red-100',
      high: 'bg-orange-100',
      medium: 'bg-yellow-100',
    };
    return colors[severity] ?? 'bg-gray-100';
  }

  getAlertIconColor(severity: AlertItem['severity']): string {
    const colors: Record<string, string> = {
      critical: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-yellow-600',
    };
    return colors[severity] ?? 'text-gray-600';
  }

  getAlertIcon(type: AlertItem['type']): string {
    const icons: Record<AlertItem['type'], string> = {
      approval_needed: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      escalated_reminder: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      critical_notification: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    };
    return icons[type];
  }
}
