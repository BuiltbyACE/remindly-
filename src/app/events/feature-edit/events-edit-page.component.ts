/**
 * EventsEditPage
 * Page-level component for editing existing events
 */

import { Component, ChangeDetectionStrategy, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EventsStore } from '../stores/events.store';
import { EventFormComponent } from '../components/event-form/event-form.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import type { EventUpdateRequest } from '../models/event.model';

@Component({
  selector: 'app-events-edit-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EventFormComponent, RouterLink],
  template: `
    <div class="p-6 max-w-3xl mx-auto">
      <div class="mb-6">
        <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <a routerLink="/events" class="hover:text-blue-600">Events</a>
          <span>/</span>
          @if (store.selectedEvent(); as event) {
            <a [routerLink]="['/events', event.id]" class="hover:text-blue-600 truncate max-w-xs">
              {{ event.title }}
            </a>
          }
          <span>/</span>
          <span class="text-gray-900">Edit</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Edit Event</h1>
      </div>

      @if (store.loading() && !store.selectedEvent()) {
        <div class="bg-white rounded-lg border border-gray-200 p-8">
          <div class="animate-pulse space-y-4">
            <div class="h-8 bg-gray-200 rounded w-1/3"></div>
            <div class="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      }

      @if (store.selectedEvent(); as event) {
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <app-event-form
            [event]="event"
            [loading]="store.loading()"
            [errorMessage]="store.error()"
            submitLabel="Save Changes"
            [cancelLink]="'/events/' + event.id"
            (submitForm)="onSubmit($event)"
          />
        </div>
      }

      @if (store.error() && !store.selectedEvent()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800">{{ store.error() }}</p>
          <button
            type="button"
            (click)="loadEvent()"
            class="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      }
    </div>
  `,
})
export class EventsEditPageComponent implements OnInit {
  readonly store = inject(EventsStore);
  readonly router = inject(Router);
  readonly toast = inject(ToastService);

  readonly eventId = input.required<string>();

  ngOnInit(): void {
    this.loadEvent();
  }

  async loadEvent(): Promise<void> {
    await this.store.selectEvent(this.eventId());
  }

  async onSubmit(request: EventUpdateRequest): Promise<void> {
    this.store.clearError();
    
    const event = await this.store.updateEvent(this.eventId(), request);
    
    if (event) {
      this.toast.success('Event updated successfully');
      this.router.navigate(['/events', this.eventId()]);
    } else if (this.store.error()) {
      this.toast.error(this.store.error()!);
    }
  }
}
