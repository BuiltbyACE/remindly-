/**
 * EventForm Component
 * Reusable form for creating and editing events
 */

import { Component, ChangeDetectionStrategy, input, output, inject, OnInit, signal } from '@angular/core';
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
      <div class="space-y-2">
        <label for="title" class="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          Title <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            type="text"
            id="title"
            formControlName="title"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all duration-200"
            [class.border-red-300]="form.get('title')?.invalid && form.get('title')?.touched"
            [class.bg-red-50]="form.get('title')?.invalid && form.get('title')?.touched"
            placeholder="Enter event title..."
          />
          <div class="absolute right-3 top-1/2 -translate-y-1/2">
            @if (form.get('title')?.valid) {
              <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            }
          </div>
        </div>
        @if (form.get('title')?.invalid && form.get('title')?.touched) {
          <p class="text-sm text-red-500 flex items-center gap-1">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            @if (form.get('title')?.errors?.['required']) {
              Title is required
            }
            @if (form.get('title')?.errors?.['maxlength']) {
              Title must not exceed 500 characters
            }
          </p>
        }
      </div>

      <!-- Description -->
      <div class="space-y-2">
        <label for="description" class="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Description
        </label>
        <textarea
          id="description"
          formControlName="description"
          rows="4"
          class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all duration-200 resize-none"
          placeholder="Enter event description..."
        ></textarea>
      </div>

      <!-- Priority & Location Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Priority -->
        <div class="space-y-2">
          <label for="priority" class="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Priority
          </label>
          <div class="relative">
            <select
              id="priority"
              formControlName="priority"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all duration-200 appearance-none cursor-pointer"
            >
              @for (priority of priorityOptions; track priority.value) {
                <option [value]="priority.value">{{ priority.label }}</option>
              }
            </select>
            <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Location -->
        <div class="space-y-2">
          <label for="location" class="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location
          </label>
          <input
            type="text"
            id="location"
            formControlName="location"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all duration-200"
            placeholder="Enter event location..."
          />
        </div>
      </div>

      <!-- Date/Time -->
      <div class="space-y-3">
        <label class="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Date & Time
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Start Date/Time -->
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="datetime-local"
              id="starts_at"
              formControlName="starts_at"
              class="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all duration-200 font-mono text-sm"
            />
          </div>
          <!-- End Date/Time -->
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="datetime-local"
              id="ends_at"
              formControlName="ends_at"
              class="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all duration-200 font-mono text-sm"
            />
          </div>
        </div>
      </div>

      <!-- Timezone -->
      <div class="space-y-2">
        <label for="timezone" class="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Timezone
        </label>
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          </div>
          <input
            type="text"
            id="timezone"
            formControlName="timezone"
            class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all duration-200"
            placeholder="e.g., UTC, America/New_York"
          />
        </div>
      </div>

      <!-- Options -->
      <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div class="flex flex-wrap gap-6">
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative">
              <input
                type="checkbox"
                formControlName="requires_acknowledgement"
                class="sr-only peer"
              />
              <div class="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all duration-200"></div>
              <svg class="absolute w-3 h-3 text-white left-1 top-1 opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span class="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Requires Acknowledgement</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative">
              <input
                type="checkbox"
                formControlName="allow_delegation"
                class="sr-only peer"
              />
              <div class="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all duration-200"></div>
              <svg class="absolute w-3 h-3 text-white left-1 top-1 opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span class="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Allow Delegation</span>
          </label>
        </div>
      </div>

      <!-- External Participants -->
      <div class="space-y-2">
        <label class="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          External Participants
          <span class="text-xs font-normal text-gray-400">(email notifications)</span>
        </label>
        <div class="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl min-h-[44px] focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white focus-within:border-indigo-500 transition-all duration-200">
          @for (email of externalParticipants(); track email) {
            <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {{ email }}
              <button type="button" (click)="removeEmail(email)" class="hover:text-indigo-900 focus:outline-none" aria-label="Remove {{ email }}">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          }
          <input
            type="email"
            [value]="emailInput()"
            (input)="emailInput.set($any($event.target).value)"
            (keydown)="onEmailKeydown($event)"
            (blur)="commitEmail()"
            class="flex-1 min-w-[200px] bg-transparent border-none outline-none text-sm py-1 placeholder-gray-400"
            placeholder="Type email and press Enter..."
          />
        </div>
        @if (emailError()) {
          <p class="text-sm text-red-500 flex items-center gap-1">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ emailError() }}
          </p>
        }
        <p class="text-xs text-gray-400">External participants will receive email reminders when event reminders are triggered.</p>
      </div>

      <!-- Form Error -->
      @if (errorMessage()) {
        <div class="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-red-700">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <a
          [routerLink]="cancelLink()"
          class="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
        >
          Cancel
        </a>
        <button
          type="submit"
          [disabled]="form.invalid || loading()"
          class="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-500 disabled:hover:to-purple-600 transition-all duration-200 shadow-md shadow-indigo-200 hover:shadow-lg"
        >
          @if (loading()) {
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
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

  readonly externalParticipants = signal<string[]>([]);
  readonly emailInput = signal('');
  readonly emailError = signal<string | null>(null);

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
      this.externalParticipants.set(event.external_participants ?? []);
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

      const extEmails = this.externalParticipants();
      if (extEmails.length > 0) {
        updateRequest.external_participants = extEmails;
      } else {
        updateRequest.external_participants = [];
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
        external_participants: this.externalParticipants(),
      };

      this.submitForm.emit(createRequest);
    }
  }

  private formatDateTimeLocal(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  onEmailKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.commitEmail();
    }
  }

  commitEmail(): void {
    const raw = this.emailInput().trim().replace(/,+$/, '');
    if (!raw) return;
    this.emailInput.set('');
    if (!this.validateEmail(raw)) {
      this.emailError.set('Please enter a valid email address');
      return;
    }
    this.emailError.set(null);
    const current = this.externalParticipants();
    if (current.includes(raw)) return;
    this.externalParticipants.set([...current, raw]);
  }

  removeEmail(email: string): void {
    this.externalParticipants.set(this.externalParticipants().filter(e => e !== email));
  }

  private validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
