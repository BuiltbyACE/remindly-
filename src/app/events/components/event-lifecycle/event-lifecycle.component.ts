/**
 * EventLifecycle Component
 * Visualizes the event state machine progression
 */

import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import type { EventStatus } from '../../models/event.model';
import { EVENT_STATUS_LABELS, canTransition } from '../../models/event.model';

type LifecycleStep = {
  status: EventStatus;
  label: string;
  position: number;
};

const LIFECYCLE_STEPS: LifecycleStep[] = [
  { status: 'draft', label: 'Draft', position: 0 },
  { status: 'pending_approval', label: 'Pending', position: 1 },
  { status: 'approved', label: 'Approved', position: 2 },
  { status: 'scheduled', label: 'Scheduled', position: 3 },
  { status: 'active', label: 'Active', position: 4 },
  { status: 'completed', label: 'Completed', position: 5 },
];

@Component({
  selector: 'app-event-lifecycle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="py-4">
      <div class="flex items-center justify-between">
        @for (step of steps(); track step.status) {
          <div class="flex flex-col items-center">
            <!-- Step indicator -->
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              [class]="stepClass(step)"
            >
              {{ step.position + 1 }}
            </div>
            <!-- Step label -->
            <span
              class="mt-2 text-xs font-medium"
              [class]="labelClass(step)"
            >
              {{ step.label }}
            </span>
          </div>

          @if (!$last) {
            <!-- Connector line -->
            <div
              class="flex-1 h-0.5 mx-2"
              [class]="connectorClass(step)"
            ></div>
          }
        }
      </div>

      <!-- Cancelled state warning -->
      @if (isCancelled()) {
        <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-800">
            <span class="font-semibold">Cancelled:</span> This event has been cancelled and cannot be modified.
          </p>
        </div>
      }
    </div>
  `,
})
export class EventLifecycleComponent {
  readonly currentStatus = input.required<EventStatus>();

  readonly steps = () => LIFECYCLE_STEPS;

  readonly isCancelled = () => this.currentStatus() === 'cancelled';

  private readonly currentPosition = () => {
    const step = LIFECYCLE_STEPS.find(s => s.status === this.currentStatus());
    return step?.position ?? -1;
  };

  stepClass(step: LifecycleStep): string {
    const position = this.currentPosition();
    const isCurrent = step.position === position;
    const isCompleted = step.position < position;
    const isPending = step.position > position;

    if (this.isCancelled()) {
      return 'bg-gray-200 text-gray-400';
    }

    if (isCurrent) {
      return 'bg-blue-600 text-white ring-2 ring-blue-200';
    }

    if (isCompleted) {
      return 'bg-green-500 text-white';
    }

    return 'bg-gray-200 text-gray-500';
  }

  labelClass(step: LifecycleStep): string {
    const position = this.currentPosition();
    const isCurrent = step.position === position;

    if (this.isCancelled()) {
      return 'text-gray-400';
    }

    if (isCurrent) {
      return 'text-blue-700';
    }

    if (step.position < position) {
      return 'text-green-600';
    }

    return 'text-gray-500';
  }

  connectorClass(step: LifecycleStep): string {
    const position = this.currentPosition();

    if (this.isCancelled()) {
      return 'bg-gray-200';
    }

    if (step.position < position) {
      return 'bg-green-500';
    }

    return 'bg-gray-200';
  }
}
