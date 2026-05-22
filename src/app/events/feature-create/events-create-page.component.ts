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
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900">Create Event</h1>
          <p class="text-gray-500 mt-2">Create a new event in your organization</p>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <h2 class="text-lg font-semibold text-white">Event Details</h2>
          </div>
          <div class="p-6">
            <app-event-form
              [loading]="store.loading()"
              [errorMessage]="store.error()"
              submitLabel="Create Event"
              cancelLink="/events"
              (submitForm)="onSubmit($event)"
            />
          </div>
        </div>
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
