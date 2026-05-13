/**
 * StatusChip Component
 * Displays event status with appropriate styling
 */

import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import type { EventStatus } from '../../../events/models/event.model';
import { EVENT_STATUS_LABELS } from '../../../events/models/event.model';

@Component({
  selector: 'app-status-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      [class]="statusClass()"
    >
      {{ label() }}
    </span>
  `,
})
export class StatusChipComponent {
  readonly status = input.required<EventStatus>();

  readonly label = () => EVENT_STATUS_LABELS[this.status()] ?? this.status();

  readonly statusClass = () => {
    const classes: Record<EventStatus, string> = {
      draft: 'bg-gray-100 text-gray-800 border border-gray-200',
      pending_approval: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      approved: 'bg-blue-100 text-blue-800 border border-blue-200',
      scheduled: 'bg-purple-100 text-purple-800 border border-purple-200',
      active: 'bg-green-100 text-green-800 border border-green-200',
      completed: 'bg-gray-100 text-gray-600 border border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border border-red-200',
    };
    return classes[this.status()] ?? classes.draft;
  };
}
