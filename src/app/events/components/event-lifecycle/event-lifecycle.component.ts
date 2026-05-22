/**
 * EventLifecycle Component
 * Visualizes the event state machine progression
 */

import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import type { EventStatus } from '../../models/event.model';

type LifecycleStep = {
  status: EventStatus;
  label: string;
  icon: string;
  position: number;
};

const LIFECYCLE_STEPS: LifecycleStep[] = [
  { status: 'draft', label: 'Draft', icon: 'edit', position: 0 },
  { status: 'pending_approval', label: 'Pending', icon: 'clock', position: 1 },
  { status: 'approved', label: 'Approved', icon: 'check', position: 2 },
  { status: 'scheduled', label: 'Scheduled', icon: 'calendar', position: 3 },
  { status: 'active', label: 'Active', icon: 'play', position: 4 },
  { status: 'completed', label: 'Completed', icon: 'flag', position: 5 },
];

@Component({
  selector: 'app-event-lifecycle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="py-6">
      <!-- Timeline Container -->
      <div class="relative">
        <!-- Background Track -->
        <div class="absolute top-6 left-0 right-0 h-1.5 bg-gray-100 rounded-full"></div>

        <!-- Progress Track -->
        <div
          class="absolute top-6 left-0 h-1.5 rounded-full transition-all duration-500 ease-out"
          [class]="progressTrackClass()"
          [style.width.%]="progressWidth()"
        ></div>

        <!-- Steps -->
        <div class="relative flex justify-between">
          @for (step of steps(); track step.status) {
            <div class="flex flex-col items-center group">
              <!-- Step Circle -->
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg cursor-default"
                [class]="stepClass(step)"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  @switch (step.icon) {
                    @case ('edit') {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    }
                    @case ('clock') {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    }
                    @case ('check') {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    }
                    @case ('calendar') {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    }
                    @case ('play') {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    }
                    @case ('flag') {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    }
                  }
                </svg>
              </div>

              <!-- Step Label -->
              <span
                class="mt-3 text-sm font-semibold transition-colors duration-300"
                [class]="labelClass(step)"
              >
                {{ step.label }}
              </span>
            </div>
          }
        </div>
      </div>

      <!-- Cancelled State -->
      @if (isCancelled()) {
        <div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <p class="text-sm text-red-700">
            <span class="font-semibold">Event Cancelled</span> — This event has been cancelled and cannot be modified.
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

  progressWidth(): number {
    if (this.isCancelled()) return 0;
    const pos = this.currentPosition();
    if (pos < 0) return 0;
    return (pos / (LIFECYCLE_STEPS.length - 1)) * 100;
  }

  progressTrackClass(): string {
    if (this.isCancelled()) return 'bg-red-400';
    const pos = this.currentPosition();
    if (pos < 0) return 'bg-blue-500';
    return 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500';
  }

  stepClass(step: LifecycleStep): string {
    const position = this.currentPosition();
    const isCurrent = step.position === position;
    const isCompleted = step.position < position;

    if (this.isCancelled()) {
      return 'bg-gray-100 text-gray-400';
    }

    if (isCurrent) {
      return 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-indigo-300 ring-4 ring-indigo-100 scale-110';
    }

    if (isCompleted) {
      return 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md shadow-green-200';
    }

    return 'bg-white text-gray-400 border-2 border-gray-200';
  }

  labelClass(step: LifecycleStep): string {
    const position = this.currentPosition();
    const isCurrent = step.position === position;
    const isCompleted = step.position < position;

    if (this.isCancelled()) {
      return 'text-gray-400';
    }

    if (isCurrent) {
      return 'text-indigo-600';
    }

    if (isCompleted) {
      return 'text-emerald-600';
    }

    return 'text-gray-400';
  }
}
