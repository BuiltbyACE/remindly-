/**
 * EventsListPage
 * Page-level component for event list view
 */

import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { EventsStore } from '../stores/events.store';
import { EventListComponent } from '../components/event-list/event-list.component';

@Component({
  selector: 'app-events-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EventListComponent],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Events</h1>
        <p class="text-gray-600 mt-1">Manage your events and track their lifecycle</p>
      </div>

      <app-event-list />
    </div>
  `,
})
export class EventsListPageComponent implements OnInit {
  readonly store = inject(EventsStore);

  ngOnInit(): void {
    // Ensure we have fresh data when navigating to this page
    this.store.loadEvents();
  }
}
