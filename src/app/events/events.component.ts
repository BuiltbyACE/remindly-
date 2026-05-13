import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-events',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-[var(--color-text-primary)]">Events</h1>
        <button class="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
          + New Event
        </button>
      </div>
      
      <div class="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)] text-center">
        <p class="text-[var(--color-text-secondary)]">Events list will be displayed here</p>
      </div>
    </div>
  `,
})
export class EventsComponent {}
