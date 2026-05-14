/**
 * EventsCreatePage
 * Page-level component for creating new events
 */

import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EventsStore } from '../stores/events.store';
import { EventFormComponent } from '../components/event-form/event-form.component';
import { ToastService } from '@shared/components/toast/toast.service';
import type { EventCreateRequest, EventUpdateRequest } from '../models/event.model';

@Component({
  selector: 'app-events-create-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EventFormComponent],
  template: `
    <div class="p-6 max-w-3xl mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Create Event</h1>
        <p class="text-gray-600 mt-1">Create a new event in your organization</p>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <app-event-form
          [loading]="store.loading()"
          [errorMessage]="store.error()"
          submitLabel="Create Event"
          cancelLink="/events"
          (submitForm)="onSubmit($event)"
        />
      </div>
    </div>
  `,
})
export class EventsCreatePageComponent {
  readonly store = inject(EventsStore);
  readonly router = inject(Router);
  readonly toast = inject(ToastService);

  async onSubmit(request: EventCreateRequest | EventUpdateRequest): Promise<void> {
    this.store.clearError();
    
    const event = await this.store.createEvent(request as EventCreateRequest);
    
    if (event) {
      this.toast.success('Event created successfully');
      this.router.navigate(['/events', event.id]);
    } else if (this.store.error()) {
      this.toast.error(this.store.error()!);
    }
  }
}
