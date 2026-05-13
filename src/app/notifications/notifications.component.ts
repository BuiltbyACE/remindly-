import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-notifications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-semibold text-[var(--color-text-primary)]">Notifications</h1>
      <div class="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)] text-center">
        <p class="text-[var(--color-text-secondary)]">Your notifications will be displayed here</p>
      </div>
    </div>
  `,
})
export class NotificationsComponent {}
