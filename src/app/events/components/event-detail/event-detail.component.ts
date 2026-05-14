/**
 * EventDetail Component
 * Displays full event information with state transitions
 */

import { Component, ChangeDetectionStrategy, inject, input, OnInit, OnDestroy, signal, HostListener, ElementRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { EventsStore } from '../../stores/events.store';
import { RemindersStore } from '../../../reminders/stores/reminders.store';
import { RbacStore } from '../../../auth/stores/rbac.store';
import { StatusChipComponent } from '@shared/components/status-chip/status-chip.component';

import { PriorityBadgeComponent } from '@shared/components/priority-badge/priority-badge.component';

import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { EventLifecycleComponent } from '../event-lifecycle/event-lifecycle.component';
import { ToastService } from '@shared/components/toast/toast.service';
import {
  REMINDER_STATUS_LABELS,
  REMINDER_STATUS_COLORS,
  REMINDER_CHANNEL_LABELS,
} from '../../../reminders/models/reminder.model';
import { EventScheduleRequest, getAvailableActions } from '../../models/event.model';

@Component({
  selector: 'app-event-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, StatusChipComponent, PriorityBadgeComponent, EventLifecycleComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-6">
      @if (store.loading()) {
        <div class="bg-white rounded-lg border border-gray-200 p-8">
          <div class="animate-pulse space-y-4">
            <div class="h-8 bg-gray-200 rounded w-1/3"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            <div class="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      }

      @if (store.notFound()) {
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <div class="text-6xl mb-4">🔍</div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
          <p class="text-gray-600 mb-6">The event you're looking for doesn't exist or may have been deleted.</p>
          <a
            routerLink="/events"
            class="inline-block px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Back to Events
          </a>
        </div>
      }

      @if (store.error(); as error) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
          <p class="text-red-800">{{ error }}</p>
          <button
            type="button"
            (click)="loadEvent()"
            class="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      }

      @if (event(); as event) {
        <!-- Header -->
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <app-status-chip [status]="event.status" />
                <app-priority-badge [priority]="event.priority" />
              </div>
              <h1 class="text-2xl font-bold text-gray-900">{{ event.title }}</h1>
              @if (event.description) {
                <p class="mt-2 text-gray-600">{{ event.description }}</p>
              }
            </div>
            <div class="flex gap-2">
              @if (canEdit()) {
                <a
                  [routerLink]="['/events', event.id, 'edit']"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Edit
                </a>
              }
              @if (canDelete()) {
                <button
                  type="button"
                  (click)="showDeleteConfirm.set(true)"
                  class="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50"
                >
                  Delete
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Lifecycle Visualization -->
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Event Lifecycle</h2>
          <app-event-lifecycle [currentStatus]="event.status" />
        </div>

        <!-- Action Buttons -->
        @if (availableActions().length > 0) {
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div class="flex flex-wrap gap-3">
              @for (action of availableActions(); track action) {
                <button
                  type="button"
                  (click)="executeAction(action)"
                  [disabled]="store.loading()"
                  [class]="getActionButtonClass(action)"
                >
                  {{ getActionLabel(action) }}
                </button>
              }
            </div>
          </div>
        }

        <!-- Reminders Section -->
        @if (event.requires_acknowledgement) {
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">Reminders</h2>
              @if (remindersStore.unacknowledgedCount() > 0) {
                <span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  {{ remindersStore.unacknowledgedCount() }} pending
                </span>
              }
            </div>

            <!-- Escalation Warning -->
            @if (remindersStore.escalatedCount() > 0) {
              <div class="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <svg aria-hidden="true" class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p class="text-sm font-medium text-red-800">Escalated Reminders</p>
                  <p class="text-xs text-red-600">
                    {{ remindersStore.escalatedCount() }} reminder(s) have been escalated and require immediate attention.
                  </p>
                </div>
              </div>
            }

            <!-- Reminder List -->
            @if (remindersStore.loading()) {
              <div class="space-y-3">
                @for (i of [1,2,3]; track i) {
                  <div class="animate-pulse flex gap-3 p-3 border border-gray-100 rounded-lg">
                    <div class="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div class="flex-1 space-y-2">
                      <div class="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                }
              </div>
            } @else if (remindersStore.error(); as error) {
              <div class="text-sm text-red-600">{{ error }}</div>
            } @else if (remindersStore.reminders().length === 0) {
              <div class="text-center py-6 text-gray-500">
                <p class="text-sm">No reminders scheduled for this event</p>
                <button
                  type="button"
                  (click)="loadReminders()"
                  class="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Load Reminders
                </button>
              </div>
            } @else {
              <div class="space-y-2">
                @for (reminder of remindersStore.reminders(); track reminder.id) {
                  <div
                    class="flex items-center justify-between p-3 border rounded-lg"
                    [class.border-gray-200]="reminder.status !== 'escalated'"
                    [class.border-red-300]="reminder.status === 'escalated'"
                    [class.bg-red-50]="reminder.status === 'escalated'"
                    [class.bg-yellow-50]="reminder.status === 'triggered'"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 rounded-full flex items-center justify-center"
                        [class]="getReminderStatusIconClass(reminder.status)"
                      >
                        <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            [attr.d]="getReminderIcon(reminder.status)"
                          />
                        </svg>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900">
                          {{ getReminderStatusLabel(reminder.status) }}
                        </p>
                        <p class="text-xs text-gray-500">
                          {{ getReminderChannelLabel(reminder.channel ?? 'in_app') }} •
                          {{ reminder.scheduled_for | date:'short' }}
                          @if (reminder.acknowledged_at) {
                            • Acknowledged {{ reminder.acknowledged_at | date:'short' }}
                          }
                        </p>
                      </div>
                    </div>

                    @if (reminder.status === 'triggered') {
                      <button
                        type="button"
                        (click)="acknowledgeReminder(reminder.id)"
                        class="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                      >
                        Acknowledge
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Details Grid -->
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Details</h2>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt class="text-sm font-medium text-gray-500">Start Time</dt>
              <dd class="mt-1 text-sm text-gray-900">
                @if (event.starts_at) {
                  {{ event.starts_at | date:'medium' }}
                } @else {
                  <span class="text-gray-400">Not scheduled</span>
                }
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">End Time</dt>
              <dd class="mt-1 text-sm text-gray-900">
                @if (event.ends_at) {
                  {{ event.ends_at | date:'medium' }}
                } @else {
                  <span class="text-gray-400">Not scheduled</span>
                }
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Timezone</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ event.timezone }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Location</dt>
              <dd class="mt-1 text-sm text-gray-900">
                @if (event.location) {
                  {{ event.location }}
                } @else {
                  <span class="text-gray-400">Not specified</span>
                }
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Acknowledgement Required</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ event.requires_acknowledgement ? 'Yes' : 'No' }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Delegation Allowed</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ event.allow_delegation ? 'Yes' : 'No' }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Version</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ event.version }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Created</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ event.created_at | date:'medium' }}</dd>
            </div>
          </dl>
        </div>
      }

      <!-- Delete Confirmation -->
      @if (showDeleteConfirm()) {
        <app-confirm-dialog
          title="Delete Event"
          message="Are you sure you want to delete this event? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          (confirmed)="deleteEvent()"
          (cancelled)="showDeleteConfirm.set(false)"
        />
      }

      <!-- Schedule Modal Placeholder -->
      @if (showScheduleModal()) {
        <div #scheduleModal class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-label="Schedule event">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Schedule Event</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  [value]="scheduleForm().starts_at"
                  (change)="updateScheduleForm('starts_at', $event)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  [value]="scheduleForm().ends_at"
                  (change)="updateScheduleForm('ends_at', $event)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  [value]="scheduleForm().location"
                  (input)="updateScheduleForm('location', $event)"
                  placeholder="Event location..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                (click)="showScheduleModal.set(false)"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="confirmSchedule()"
                [disabled]="!canSchedule()"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class EventDetailComponent implements OnInit, OnDestroy {
  readonly store = inject(EventsStore);
  readonly remindersStore = inject(RemindersStore);
  readonly rbacStore = inject(RbacStore);
  readonly router = inject(Router);
  readonly toast = inject(ToastService);
  private readonly el = inject(ElementRef);

  readonly eventId = input.required<string>();

  readonly showDeleteConfirm = signal(false);
  readonly showScheduleModal = signal(false);
  readonly scheduleForm = signal<Partial<EventScheduleRequest>>({
    starts_at: '',
    ends_at: '',
    timezone: 'UTC',
    location: '',
    expected_version: 1,
  });

  readonly event = () => this.store.selectedEvent();

  readonly canEdit = () => this.rbacStore.hasPermission()('events.write');
  readonly canDelete = () => this.rbacStore.hasPermission()('events.delete');
  readonly canApprove = () => this.rbacStore.hasPermission()('events.approve');

  readonly ACTION_PERMISSIONS: Record<string, string> = {
    request_approval: 'events.write',
    approve: 'events.approve',
    reject: 'events.approve',
    schedule: 'events.write',
    activate: 'events.write',
    complete: 'events.write',
    cancel: 'events.write',
  };

  readonly availableActions = () => {
    const event = this.event();
    if (!event) return [];
    const hasPermission = this.rbacStore.hasPermission();
    return getAvailableActions(event.status).filter(
      action => hasPermission(this.ACTION_PERMISSIONS[action] ?? 'events.read')
    );
  };

  ngOnInit(): void {
    this.loadEvent();
  }

  ngOnDestroy(): void {
    this.remindersStore.reset();
  }

  async loadEvent(): Promise<void> {
    await this.store.selectEvent(this.eventId());
    // Initialize schedule form with event timezone
    const event = this.store.selectedEvent();
    if (event) {
      this.scheduleForm.update(form => ({
        ...form,
        timezone: event.timezone,
        expected_version: event.version,
      }));
      // Load reminders if event requires acknowledgement
      if (event.requires_acknowledgement) {
        await this.remindersStore.loadReminders(event.id);
      }
    }
  }

  async loadReminders(): Promise<void> {
    const event = this.event();
    if (event) {
      await this.remindersStore.loadReminders(event.id);
    }
  }

  async acknowledgeReminder(reminderId: string): Promise<void> {
    const event = this.event();
    if (!event) return;

    const success = await this.remindersStore.acknowledgeReminder(event.id, reminderId);
    if (!success && this.remindersStore.error()) {
      this.toast.error(this.remindersStore.error()!);
    }
  }

  getReminderStatusLabel(status: string): string {
    return REMINDER_STATUS_LABELS[status as keyof typeof REMINDER_STATUS_LABELS] ?? status;
  }

  getReminderStatusIconClass(status: string): string {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-600',
      triggered: 'bg-yellow-100 text-yellow-600',
      acknowledged: 'bg-green-100 text-green-600',
      escalated: 'bg-red-100 text-red-600',
    };
    return colors[status] ?? 'bg-gray-100 text-gray-600';
  }

  getReminderIcon(status: string): string {
    const icons: Record<string, string> = {
      scheduled: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      triggered: 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      acknowledged: 'M5 13l4 4L19 7',
      escalated: 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    };
    return icons[status] ?? icons['scheduled'];
  }

  getReminderChannelLabel(channel: string): string {
    return REMINDER_CHANNEL_LABELS[channel as keyof typeof REMINDER_CHANNEL_LABELS] ?? channel;
  }

  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      request_approval: 'Request Approval',
      approve: 'Approve',
      reject: 'Reject',
      schedule: 'Schedule',
      activate: 'Activate',
      complete: 'Complete',
      cancel: 'Cancel',
    };
    return labels[action] ?? action;
  }

  getActionButtonClass(action: string): string {
    const baseClasses = 'px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50';
    
    const variantClasses: Record<string, string> = {
      request_approval: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
      approve: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      reject: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      schedule: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
      activate: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      complete: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      cancel: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    };
    
    return `${baseClasses} ${variantClasses[action] ?? 'bg-blue-600 text-white'}`;
  }

  async executeAction(action: string): Promise<void> {
    const event = this.event();
    if (!event) return;

    if (action === 'schedule') {
      this.showScheduleModal.set(true);
      return;
    }

    let result: import('../../models/event.model').Event | null = null;

    switch (action) {
      case 'request_approval':
        result = await this.store.requestApproval(event.id);
        break;
      case 'approve':
        result = await this.store.approveEvent(event.id);
        break;
      case 'activate':
        result = await this.store.activateEvent(event.id);
        break;
      case 'complete':
        result = await this.store.completeEvent(event.id);
        break;
      case 'cancel':
        result = await this.store.cancelEvent(event.id);
        break;
    }

    if (result) {
      this.toast.success(`Event ${this.getActionLabel(action).toLowerCase()} successfully`);
    } else if (this.store.error()) {
      this.toast.error(this.store.error()!);
    }
  }

  async confirmSchedule(): Promise<void> {
    const event = this.event();
    const form = this.scheduleForm();
    
    if (!event || !form.starts_at || !form.ends_at) return;

    const request: EventScheduleRequest = {
      starts_at: form.starts_at,
      ends_at: form.ends_at,
      timezone: form.timezone ?? 'UTC',
      location: form.location ?? null,
      expected_version: event.version,
    };

    const result = await this.store.scheduleEvent(event.id, request);
    
    if (result) {
      this.toast.success('Event scheduled successfully');
      this.showScheduleModal.set(false);
    } else if (this.store.error()) {
      this.toast.error(this.store.error()!);
    }
  }

  async deleteEvent(): Promise<void> {
    const event = this.event();
    if (!event) return;

    const success = await this.store.deleteEvent(event.id);
    
    if (success) {
      this.toast.success('Event deleted successfully');
      this.router.navigate(['/events']);
    } else if (this.store.error()) {
      this.toast.error(this.store.error()!);
    }
    
    this.showDeleteConfirm.set(false);
  }

  updateScheduleForm(field: keyof EventScheduleRequest, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    this.scheduleForm.update(form => ({
      ...form,
      [field]: field === 'expected_version' ? parseInt(value, 10) : value,
    }));
  }

  readonly canSchedule = () => {
    const form = this.scheduleForm();
    return form.starts_at && form.ends_at;
  };

  @HostListener('keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (!this.showScheduleModal()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.showScheduleModal.set(false);
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = this.el.nativeElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
}
