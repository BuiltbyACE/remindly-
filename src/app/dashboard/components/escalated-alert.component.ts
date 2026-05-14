import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RemindersStore } from '../../reminders/stores/reminders.store';

@Component({
  selector: 'app-escalated-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (escalatedCount() > 0) {
      <div class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
        <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
          <svg aria-hidden="true" class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div class="flex-1">
          <p class="font-semibold text-red-800 text-sm">Urgent: {{ escalatedCount() }} Escalated Reminder(s)</p>
          <p class="text-xs text-red-600">Requires immediate acknowledgment</p>
        </div>
        <a
          routerLink="/events"
          class="flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1">
          View Events
          <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    }
  `,
})
export class EscalatedAlertComponent {
  readonly remindersStore = inject(RemindersStore);
  
  readonly escalatedCount = computed(() => this.remindersStore.escalatedCount());
}
