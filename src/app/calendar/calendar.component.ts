/**
 * Calendar Component
 * Full-featured calendar with month/week/day views and event management
 */

import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { EventsStore } from '../events/stores/events.store';
import { RbacStore } from '../auth/stores/rbac.store';
import { EventFormComponent } from '../events/components/event-form/event-form.component';
import type { Event, EventCreateRequest, EventUpdateRequest, EventPriority } from '../events/models/event.model';
import { EVENT_PRIORITY_LABELS } from '../events/models/event.model';
import { ToastService } from '../shared/components/toast/toast.service';

type CalendarView = 'month' | 'week' | 'day';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}

@Component({
  selector: 'app-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe, EventFormComponent],
  template: `
    <div class="h-full flex flex-col bg-gray-50">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200 px-4 py-3 lg:px-6 lg:py-4">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex flex-wrap items-center justify-between gap-3 lg:gap-4">
            <!-- View Toggle -->
            <div class="flex items-center bg-gray-100 rounded-lg p-0.5 lg:p-1">
              @for (view of views; track view.value) {
                <button
                  type="button"
                  (click)="setView(view.value)"
                  class="px-2.5 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium rounded-md transition-all duration-200"
                  [class.bg-white]="currentView() === view.value"
                  [class.text-gray-900]="currentView() === view.value"
                  [class.shadow-sm]="currentView() === view.value"
                  [class.text-gray-500]="currentView() !== view.value"
                  [class.hover:text-gray-700]="currentView() !== view.value"
                >
                  {{ view.label }}
                </button>
              }
            </div>

            <!-- Navigation -->
            <div class="flex items-center gap-1 lg:gap-2">
              <button
                type="button"
                (click)="previousPeriod()"
                class="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg class="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                (click)="goToToday()"
                class="px-2 py-1 lg:px-3 lg:py-1.5 text-xs lg:text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                (click)="nextPeriod()"
                class="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg class="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between gap-4">
            <!-- Current Period Title -->
            <h2 class="text-base lg:text-xl font-semibold text-gray-900 truncate">
              {{ periodTitle() }}
            </h2>

            <!-- Actions -->
            <button
              type="button"
              (click)="showCreateModal.set(true)"
              class="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-xs lg:text-sm font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Event</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="flex-1 overflow-auto p-3 lg:p-6">
        @if (store.loading()) {
          <div class="h-full flex flex-col">
            <div class="grid grid-cols-7 gap-px mb-2">
              @for (day of weekDays; track day) {
                <div class="h-5 bg-gray-200 rounded animate-pulse"></div>
              }
            </div>
            <div class="grid grid-cols-7 gap-px flex-1 bg-gray-200 rounded-lg overflow-hidden">
              @for (i of [].constructor(35); track i) {
                <div class="bg-white min-h-[60px] lg:min-h-[120px] p-2">
                  <div class="w-6 h-6 bg-gray-200 rounded-full animate-pulse mb-2"></div>
                  <div class="space-y-1.5 hidden lg:block">
                    <div class="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div class="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              }
            </div>
          </div>
        } @else {
        @switch (currentView()) {
          @case ('month') {
            <div class="h-full flex flex-col">
              <!-- Weekday Headers -->
              <div class="grid grid-cols-7 gap-px mb-2">
                @for (day of weekDays; track day) {
                  <div class="text-center text-xs lg:text-sm font-semibold text-gray-500 py-1.5 lg:py-2">
                    {{ day }}
                  </div>
                }
              </div>

              <!-- Calendar Days -->
              <div class="grid grid-cols-7 gap-px flex-1 bg-gray-200 rounded-lg overflow-hidden">
                @for (day of calendarDays(); track day.date.toISOString()) {
                  <div
                    class="bg-white min-h-[50px] lg:min-h-[120px] p-1 lg:p-2 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col justify-between"
                    [class.bg-gray-50]="!day.isCurrentMonth"
                    [class.ring-2]="selectedDate().toDateString() === day.date.toDateString() && currentView() === 'month'"
                    [class.ring-indigo-500]="selectedDate().toDateString() === day.date.toDateString() && currentView() === 'month'"
                    [class.ring-inset]="selectedDate().toDateString() === day.date.toDateString() && currentView() === 'month'"
                    (click)="selectDate(day.date)"
                  >
                    <div class="flex items-center justify-between mb-1">
                      <span
                        class="text-xs lg:text-sm font-medium"
                        [class.text-gray-900]="day.isCurrentMonth"
                        [class.text-gray-400]="!day.isCurrentMonth"
                        [class.bg-indigo-100]="day.isToday"
                        [class.text-indigo-700]="day.isToday"
                        [class.w-5]="day.isToday"
                        [class.h-5]="day.isToday"
                        [class.lg:w-7]="day.isToday"
                        [class.lg:h-7]="day.isToday"
                        [class.rounded-full]="day.isToday"
                        [class.flex]="day.isToday"
                        [class.items-center]="day.isToday"
                        [class.justify-center]="day.isToday"
                      >
                        {{ day.date.getDate() }}
                      </span>
                    </div>
                    
                    <!-- Desktop Events List -->
                    <div class="hidden lg:block space-y-1">
                      @for (event of day.events.slice(0, 3); track event.id) {
                        <div
                          class="text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                          [class.bg-blue-100]="event.priority === 'low'"
                          [class.text-blue-800]="event.priority === 'low'"
                          [class.bg-yellow-100]="event.priority === 'medium'"
                          [class.text-yellow-800]="event.priority === 'medium'"
                          [class.bg-orange-100]="event.priority === 'high'"
                          [class.text-orange-800]="event.priority === 'high'"
                          [class.bg-red-100]="event.priority === 'critical'"
                          [class.text-red-800]="event.priority === 'critical'"
                          (click)="openEvent(event, $event)"
                        >
                          {{ event.title }}
                        </div>
                      }
                      @if (day.events.length > 3) {
                        <div class="text-xs text-gray-500 pl-2">
                          +{{ day.events.length - 3 }} more
                        </div>
                      }
                    </div>

                    <!-- Mobile Event Dots -->
                    <div class="flex lg:hidden justify-center gap-0.5 mt-auto pb-1">
                      @for (event of day.events.slice(0, 3); track event.id) {
                        <span
                          class="w-1.5 h-1.5 rounded-full"
                          [class.bg-blue-500]="event.priority === 'low'"
                          [class.bg-yellow-500]="event.priority === 'medium'"
                          [class.bg-orange-500]="event.priority === 'high'"
                          [class.bg-red-500]="event.priority === 'critical'"
                        ></span>
                      }
                      @if (day.events.length > 3) {
                        <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Mobile Selected Date Agenda (Bottom list on mobile) -->
              <div class="block lg:hidden mt-4 bg-white rounded-xl border border-gray-200 p-4">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-sm font-semibold text-gray-900">
                    Agenda for {{ selectedDate() | date:'MMMM d' }}
                  </h3>
                  <button
                    type="button"
                    (click)="currentView.set('day')"
                    class="text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-2 py-1 rounded-md"
                  >
                    View Day
                  </button>
                </div>
                @if (getEventsForDate(selectedDate()).length === 0) {
                  <div class="text-center py-6 border border-dashed border-gray-100 rounded-lg">
                    <p class="text-xs text-gray-400">No events scheduled for this day</p>
                  </div>
                } @else {
                  <div class="space-y-2">
                    @for (event of getEventsForDate(selectedDate()); track event.id) {
                      <div
                        (click)="openEvent(event, $event)"
                        class="p-3 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div class="min-w-0">
                          <h4 class="text-xs font-semibold text-gray-900 truncate">{{ event.title }}</h4>
                          @if (event.starts_at) {
                            <p class="text-[10px] text-gray-500 mt-0.5">
                              {{ event.starts_at | date:'shortTime' }}
                              @if (event.location) {
                                · {{ event.location }}
                              }
                            </p>
                          }
                        </div>
                        <div class="flex items-center gap-1.5 flex-shrink-0">
                          <span
                            class="px-1.5 py-0.5 text-[9px] font-semibold rounded-full uppercase"
                            [class.bg-blue-50]="event.priority === 'low'"
                            [class.text-blue-700]="event.priority === 'low'"
                            [class.bg-yellow-50]="event.priority === 'medium'"
                            [class.text-yellow-700]="event.priority === 'medium'"
                            [class.bg-orange-50]="event.priority === 'high'"
                            [class.text-orange-700]="event.priority === 'high'"
                            [class.bg-red-50]="event.priority === 'critical'"
                            [class.text-red-700]="event.priority === 'critical'"
                          >
                            {{ event.priority }}
                          </span>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          @case ('week') {
            <div class="h-full flex flex-col">
              <!-- Time Column + Day Columns -->
              <div class="flex flex-1 overflow-hidden rounded-lg border border-gray-200">
                <!-- Time Labels -->
                <div class="w-12 lg:w-16 flex-shrink-0 bg-white border-r border-gray-200">
                  <div class="h-12 border-b border-gray-200"></div>
                  @for (hour of hours; track hour) {
                    <div class="h-16 px-1 lg:px-2 text-[10px] lg:text-xs text-gray-400 text-right border-b border-gray-100">
                      {{ hour }}:00
                    </div>
                  }
                </div>

                <!-- Day Columns -->
                <div class="flex flex-1 overflow-x-auto">
                  @for (day of weekDaysData(); track day.date.toISOString()) {
                    <div class="flex-1 min-w-[80px] lg:min-w-[120px] border-r border-gray-200 bg-white">
                      <!-- Day Header -->
                      <div class="h-12 px-1 py-1.5 border-b border-gray-200 text-center">
                        <div class="text-[10px] text-gray-500">{{ day.date | date:'EEE' }}</div>
                        <div
                          class="text-sm lg:text-lg font-semibold"
                          [class.text-indigo-600]="day.isToday"
                          [class.text-gray-900]="!day.isToday"
                        >
                          {{ day.date.getDate() }}
                        </div>
                      </div>

                      <!-- Time Slots -->
                      <div class="relative">
                        @for (hour of hours; track hour) {
                          <div class="h-16 border-b border-gray-100 hover:bg-gray-50 cursor-pointer" (click)="selectDateTime(day.date, hour)"></div>
                        }

                        <!-- Events -->
                        @for (event of day.events; track event.id) {
                          <div
                            class="absolute left-0.5 right-0.5 px-1 py-0.5 rounded text-[10px] lg:text-xs cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                            [class.bg-blue-100]="event.priority === 'low'"
                            [class.text-blue-800]="event.priority === 'low'"
                            [class.bg-yellow-100]="event.priority === 'medium'"
                            [class.text-yellow-800]="event.priority === 'medium'"
                            [class.bg-orange-100]="event.priority === 'high'"
                            [class.text-orange-800]="event.priority === 'high'"
                            [class.bg-red-100]="event.priority === 'critical'"
                            [class.text-red-800]="event.priority === 'critical'"
                            [style.top.px]="getEventTop(event)"
                            [style.height.px]="getEventHeight(event)"
                            (click)="openEvent(event, $event)"
                          >
                            <div class="font-medium truncate">{{ event.title }}</div>
                            @if (getEventHeight(event) > 30) {
                              <div class="text-[8px] lg:text-xs opacity-75 truncate">
                                {{ event.starts_at ? (event.starts_at | date:'shortTime') : '' }}
                              </div>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          @case ('day') {
            <div class="h-full flex flex-col rounded-lg border border-gray-200 bg-white">
              <!-- Day Header -->
              <div class="px-4 py-3 lg:px-6 lg:py-4 border-b border-gray-200 text-center">
                <div class="text-xs lg:text-sm text-gray-500">{{ selectedDate() | date:'EEEE' }}</div>
                <div class="text-xl lg:text-3xl font-bold" [class.text-indigo-600]="isToday(selectedDate())">
                  {{ selectedDate() | date:'d' }}
                </div>
                <div class="text-xs lg:text-gray-500">{{ selectedDate() | date:'MMMM yyyy' }}</div>
              </div>

              <!-- Time Slots -->
              <div class="flex-1 overflow-y-auto">
                @for (hour of hours; track hour) {
                  <div class="flex border-b border-gray-100">
                    <div class="w-12 lg:w-16 px-1 lg:px-2 py-3 text-[10px] lg:text-xs text-gray-400 text-right flex-shrink-0">
                      {{ hour }}:00
                    </div>
                    <div class="flex-1 py-2 hover:bg-gray-50 cursor-pointer border-l border-gray-100" (click)="selectDateTime(selectedDate(), hour)">
                      @for (event of getDayEvents(hour); track event.id) {
                        <div
                          class="mx-1 lg:mx-2 mb-1 px-2 py-1.5 lg:px-3 lg:py-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          [class.bg-blue-100]="event.priority === 'low'"
                          [class.text-blue-800]="event.priority === 'low'"
                          [class.bg-yellow-100]="event.priority === 'medium'"
                          [class.text-yellow-800]="event.priority === 'medium'"
                          [class.bg-orange-100]="event.priority === 'high'"
                          [class.text-orange-800]="event.priority === 'high'"
                          [class.bg-red-100]="event.priority === 'critical'"
                          [class.text-red-800]="event.priority === 'critical'"
                          (click)="openEvent(event, $event)"
                        >
                          <div class="font-medium text-xs lg:text-sm">{{ event.title }}</div>
                          <div class="text-[10px] lg:text-xs opacity-75">
                            {{ event.starts_at ? (event.starts_at | date:'shortTime') : '' }}
                            @if (event.location) {
                              · {{ event.location }}
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        }
        }
      </div>

      <!-- Create Event Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 modal-overlay" (click)="closeModal($event)">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto modal" (click)="$event.stopPropagation()">
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 rounded-t-2xl">
              <h3 class="text-lg font-semibold text-white">Create Event</h3>
              <p class="text-indigo-100 text-sm">Add a new event to your calendar</p>
            </div>
            <div class="p-6">
              <app-event-form
                [loading]="store.loading()"
                [errorMessage]="store.error()"
                submitLabel="Create Event"
                cancelLink="/calendar"
                (submitForm)="createEvent($event)"
              />
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CalendarComponent implements OnInit {
  readonly store = inject(EventsStore);
  readonly rbacStore = inject(RbacStore);
  readonly router = inject(Router);
  readonly toast = inject(ToastService);

  views: { value: CalendarView; label: string }[] = [
    { value: 'month', label: 'Month' },
    { value: 'week', label: 'Week' },
    { value: 'day', label: 'Day' },
  ];

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  hours = Array.from({ length: 24 }, (_, i) => i);

  currentView = signal<CalendarView>('month');
  currentDate = signal(new Date());
  selectedDate = signal(new Date());
  showCreateModal = signal(false);
  selectedEvent = signal<Event | null>(null);

  readonly events = computed(() => this.store.events());

  ngOnInit(): void {
    this.store.loadEvents();
  }

  async loadEvents(): Promise<void> {
    await this.store.loadEvents();
  }

  setView(view: CalendarView): void {
    this.currentView.set(view);
  }

  previousPeriod(): void {
    const current = this.currentDate();
    const view = this.currentView();
    let newDate: Date;

    if (view === 'month') {
      newDate = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    } else if (view === 'week') {
      newDate = new Date(current.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      newDate = new Date(current.getTime() - 24 * 60 * 60 * 1000);
    }

    this.currentDate.set(newDate);
  }

  nextPeriod(): void {
    const current = this.currentDate();
    const view = this.currentView();
    let newDate: Date;

    if (view === 'month') {
      newDate = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    } else if (view === 'week') {
      newDate = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else {
      newDate = new Date(current.getTime() + 24 * 60 * 60 * 1000);
    }

    this.currentDate.set(newDate);
  }

  goToToday(): void {
    this.currentDate.set(new Date());
    this.selectedDate.set(new Date());
  }

  periodTitle = computed(() => {
    const date = this.currentDate();
    const view = this.currentView();

    if (view === 'month') {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (view === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  });

  calendarDays = computed((): CalendarDay[] => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: CalendarDay[] = [];

    // Previous month days
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: this.isToday(d),
        events: this.getEventsForDate(d),
      });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: this.isToday(d),
        events: this.getEventsForDate(d),
      });
    }

    // Next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: this.isToday(d),
        events: this.getEventsForDate(d),
      });
    }

    return days;
  });

  weekDaysData = computed(() => {
    const date = this.currentDate();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return {
        date: d,
        isToday: this.isToday(d),
        events: this.getEventsForDate(d),
      };
    });
  });

  readonly isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  protected getEventsForDate(date: Date): Event[] {
    return this.events().filter(event => {
      if (!event.starts_at) return false;
      const eventDate = new Date(event.starts_at);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  }

  selectDate(date: Date): void {
    this.selectedDate.set(date);
    if (this.currentView() === 'month' && window.innerWidth >= 1024) {
      this.currentView.set('day');
    }
  }

  selectDateTime(date: Date, hour: number): void {
    const d = new Date(date);
    d.setHours(hour, 0, 0, 0);
    this.selectedDate.set(d);
    this.showCreateModal.set(true);
  }

  openEvent(event: Event, e: PointerEvent): void {
    e.stopPropagation();
    this.router.navigate(['/events', event.id]);
  }

  getEventTop(event: Event): number {
    if (!event.starts_at) return 0;
    const date = new Date(event.starts_at);
    return date.getHours() * 64 + date.getMinutes();
  }

  getEventHeight(event: Event): number {
    if (!event.starts_at || !event.ends_at) return 60;
    const start = new Date(event.starts_at);
    const end = new Date(event.ends_at);
    const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return Math.max(24, Math.min(minutes * 1.07, 480));
  }

  getDayEvents(hour: number): Event[] {
    const date = this.selectedDate();
    return this.events().filter(event => {
      if (!event.starts_at) return false;
      const eventDate = new Date(event.starts_at);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear() &&
             eventDate.getHours() === hour;
    });
  }

  closeModal(e: PointerEvent): void {
    if ((e.target as HTMLElement).classList.contains('fixed')) {
      this.showCreateModal.set(false);
    }
  }

  async createEvent(request: EventCreateRequest | EventUpdateRequest): Promise<void> {
    const event = await this.store.createEvent(request as EventCreateRequest);
    if (event) {
      this.toast.success('Event created successfully');
      this.showCreateModal.set(false);
      await this.loadEvents();
    } else if (this.store.error()) {
      this.toast.error(this.store.error()!);
    }
  }
}