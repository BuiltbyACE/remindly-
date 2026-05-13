/**
 * EventsDetailPage
 * Page-level component for event detail view
 */

import { Component, ChangeDetectionStrategy, inject, input, OnInit } from '@angular/core';
import { EventsStore } from '../stores/events.store';
import { EventDetailComponent } from '../components/event-detail/event-detail.component';

@Component({
  selector: 'app-events-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EventDetailComponent],
  template: `
    <div class="p-6">
      <div class="mb-6 flex items-center gap-2 text-sm text-gray-600">
        <a routerLink="/events" class="hover:text-blue-600">Events</a>
        <span>/</span>
        @if (store.selectedEvent(); as event) {
          <span class="text-gray-900 font-medium truncate max-w-xs">{{ event.title }}</span>
        } @else {
          <span class="text-gray-400">Loading...</span>
        }
      </div>

      <app-event-detail [eventId]="eventId()" />
    </div>
  `,
})
export class EventsDetailPageComponent implements OnInit {
  readonly store = inject(EventsStore);
  readonly eventId = input.required<string>();

  ngOnInit(): void {
    // Clear any previous selection and load the event
    this.store.clearSelection();
  }
}
