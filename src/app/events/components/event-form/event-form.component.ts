/**
 * EventForm Component
 * Reusable form for creating and editing events
 */

import { Component, ChangeDetectionStrategy, input, output, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { Event, EventCreateRequest, EventUpdateRequest, EventPriority } from '../../models/event.model';
import { EVENT_PRIORITY_LABELS } from '../../models/event.model';

@Component({
  selector: 'app-event-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
      <!-- Title -->
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
          Title <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          formControlName="title"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          [class.border-red-300]="form.get('title')?.invalid && form.get('title')?.touched"
          placeholder="Enter event title..."
        />
        @if (form.get('title')?.invalid && form.get('title')?.touched) {
          <p class="mt-1 text-sm text-red-600">
            @if (form.get('title')?.errors?.['required']) {
              Title is required
            }
            @if (form.get('title')?.errors?.['minlength']) {
              Title must be at least 1 character
            }
            @if (form.get('title')?.errors?.['maxlength']) {
              Title must not exceed 500 characters
            }
          </p>
        }
      </div>

      <!-- Description -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          formControlName="description"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter event description..."
        ></textarea>
      </div>

      <!-- Priority -->
      <div>
        <label for="priority" class="block text-sm font-medium text-gray-700 mb-1">
          Priority
        </label>
        <select
          id="priority"
          formControlName="priority"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          @for (priority of priorityOptions; track priority.value) {
            <option [value]="priority.value">{{ priority.label }}</option>
          }
        </select>
      </div>

      <!-- Location -->
      <div>
        <label for="location" class="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          type="text"
          id="location"
          formControlName="location"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter event location..."
        />
      </div>

      <!-- Date/Time -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="starts_at" class="block text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <input
            type="datetime-local"
            id="starts_at"
            formControlName="starts_at"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label for="ends_at" class="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>
          <input
            type="datetime-local"
            id="ends_at"
            formControlName="ends_at"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Timezone -->
      <div>
        <label for="timezone" class="block text-sm font-medium text-gray-700 mb-1">
          Timezone
        </label>
        <input
          type="text"
          id="timezone"
          formControlName="timezone"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Options -->
      <div class="flex flex-wrap gap-6">
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            formControlName="requires_acknowledgement"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span class="text-sm text-gray-700">Requires Acknowledgement</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            formControlName="allow_delegation"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span class="text-sm text-gray-700">Allow Delegation</span>
        </label>
      </div>

      <!-- Form Error -->
      @if (errorMessage()) {
        <div class="p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-800">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <a
          [routerLink]="cancelLink()"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </a>
        <button
          type="submit"
          [disabled]="form.invalid || loading()"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          @if (loading()) {
            Saving...
          } @else {
            {{ submitLabel() }}
          }
        </button>
      </div>
    </form>
  `,
})
export class EventFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  // Inputs
  readonly event = input<Event | null>(null);
  readonly loading = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly submitLabel = input('Save Event');
  readonly cancelLink = input('/events');

  // Outputs
  readonly submitForm = output<EventCreateRequest | EventUpdateRequest>();

  readonly priorityOptions = Object.entries(EVENT_PRIORITY_LABELS).map(([value, label]) => ({
    value: value as EventPriority,
    label,
  }));

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(500)]],
    description: [''],
    priority: ['medium' as EventPriority],
    location: [''],
    starts_at: [''],
    ends_at: [''],
    timezone: ['UTC'],
    requires_acknowledgement: [false],
    allow_delegation: [false],
  });

  ngOnInit(): void {
    const event = this.event();
    if (event) {
      // Edit mode - populate form
      this.form.patchValue({
        title: event.title,
        description: event.description ?? '',
        priority: event.priority,
        location: event.location ?? '',
        starts_at: this.formatDateTimeLocal(event.starts_at),
        ends_at: this.formatDateTimeLocal(event.ends_at),
        timezone: event.timezone,
        requires_acknowledgement: event.requires_acknowledgement,
        allow_delegation: event.allow_delegation,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const event = this.event();

    if (event) {
      // Update request
      const updateRequest: EventUpdateRequest = {};
      
      if (formValue.title !== undefined) updateRequest.title = formValue.title || null;
      if (formValue.description !== undefined) updateRequest.description = formValue.description || null;
      if (formValue.priority !== undefined) updateRequest.priority = formValue.priority;
      if (formValue.location !== undefined) updateRequest.location = formValue.location || null;
      if (formValue.starts_at !== undefined) updateRequest.starts_at = formValue.starts_at || null;
      if (formValue.ends_at !== undefined) updateRequest.ends_at = formValue.ends_at || null;
      if (formValue.timezone !== undefined) updateRequest.timezone = formValue.timezone || null;
      if (formValue.requires_acknowledgement !== undefined) {
        updateRequest.requires_acknowledgement = formValue.requires_acknowledgement;
      }
      if (formValue.allow_delegation !== undefined) {
        updateRequest.allow_delegation = formValue.allow_delegation;
      }

      this.submitForm.emit(updateRequest);
    } else {
      // Create request
      const createRequest: EventCreateRequest = {
        title: formValue.title || '',
        description: formValue.description || null,
        priority: formValue.priority || 'medium',
        location: formValue.location || null,
        starts_at: formValue.starts_at || null,
        ends_at: formValue.ends_at || null,
        timezone: formValue.timezone || 'UTC',
        requires_acknowledgement: formValue.requires_acknowledgement ?? false,
        allow_delegation: formValue.allow_delegation ?? false,
      };

      this.submitForm.emit(createRequest);
    }
  }

  private formatDateTimeLocal(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Format for datetime-local input: YYYY-MM-DDTHH:mm
    return date.toISOString().slice(0, 16);
  }
}
