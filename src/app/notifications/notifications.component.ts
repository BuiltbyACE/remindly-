import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { NotificationsStore } from './stores/notifications.store';
import { NotificationListComponent } from './components/notification-list/notification-list.component';

@Component({
  selector: 'app-notifications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NotificationListComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-[var(--color-text-primary)]">Notifications</h1>
          <p class="text-sm text-[var(--color-text-secondary)] mt-1">
            Stay updated on events, approvals, and reminders
          </p>
        </div>
      </div>

      <!-- Notification List -->
      <app-notification-list
        [showFilters]="true"
        (retry)="loadNotifications()"
      />
    </div>
  `,
})
export class NotificationsComponent implements OnInit {
  private readonly store = inject(NotificationsStore);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.store.loadNotifications();
  }
}
