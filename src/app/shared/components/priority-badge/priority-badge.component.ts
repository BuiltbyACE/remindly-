/**
 * PriorityBadge Component
 * Displays event priority with appropriate styling
 */

import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import type { EventPriority } from '../../../events/models/event.model';
import { EVENT_PRIORITY_LABELS } from '../../../events/models/event.model';

@Component({
  selector: 'app-priority-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
      [class]="priorityClass()"
    >
      @if (showDot()) {
        <span class="w-1.5 h-1.5 rounded-full mr-1.5" [class]="dotClass()"></span>
      }
      {{ label() }}
    </span>
  `,
})
export class PriorityBadgeComponent {
  readonly priority = input.required<EventPriority>();
  readonly showDot = input(true);

  readonly label = () => EVENT_PRIORITY_LABELS[this.priority()] ?? this.priority();

  readonly priorityClass = () => {
    const classes: Record<EventPriority, string> = {
      low: 'bg-gray-50 text-gray-600',
      medium: 'bg-blue-50 text-blue-600',
      high: 'bg-orange-50 text-orange-600',
      critical: 'bg-red-50 text-red-600',
    };
    return classes[this.priority()] ?? classes.low;
  };

  readonly dotClass = () => {
    const classes: Record<EventPriority, string> = {
      low: 'bg-gray-400',
      medium: 'bg-blue-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500',
    };
    return classes[this.priority()] ?? classes.low;
  };
}
