/**
 * Events Store
 * Lightweight signal-based state management for Events domain
 */

import { Injectable, inject, computed, signal, OnDestroy } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { EventsService } from '../services/events.service';
import { WebSocketStore } from '../../websocket/websocket.store';
import { RemindersStore } from '../../reminders/stores/reminders.store';
import type {
  Event,
  EventListResponse,
  EventCreateRequest,
  EventUpdateRequest,
  EventScheduleRequest,
  EventFilters,
  EventPagination,
  EventStatus,
} from '../models/event.model';

export interface EventsState {
  events: Event[];
  selectedEvent: Event | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  pagination: EventPagination;
  filters: EventFilters;
}

@Injectable({
  providedIn: 'root',
})
export class EventsStore implements OnDestroy {
  private readonly eventsService = inject(EventsService);
  private readonly webSocketStore = inject(WebSocketStore);
  private readonly remindersStore = inject(RemindersStore);
  private wsSubscription: Subscription | null = null;

  constructor() {
    this.initializeWebSocketSubscriptions();
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
      this.wsSubscription = null;
    }
  }

  /**
   * Load reminders for a specific event
   * Delegates to RemindersStore
   */
  async loadRemindersForEvent(eventId: string): Promise<void> {
    await this.remindersStore.loadReminders(eventId);
  }

  /**
   * Initialize WebSocket subscriptions for real-time updates
   */
  private initializeWebSocketSubscriptions(): void {
    // Subscribe to event-related WebSocket messages
    // Backend emits 'event.updated' for all event changes (create, update, status change)
    // See app/websocket/enums.py — WebSocketMessageType.EVENT_UPDATED
    this.wsSubscription = this.webSocketStore
      .messagesOfType('event.updated')
      .subscribe((message) => {
        this.handleWebSocketMessage(message);
      });
  }

  /**
   * Handle WebSocket messages for events (upsert: adds new or updates existing)
   */
  private handleWebSocketMessage(message: { type: string; payload: unknown }): void {
    const event = message.payload as Event;
    const currentEvents = this.state().events;
    const existingIndex = currentEvents.findIndex(e => e.id === event.id);

    if (existingIndex >= 0) {
      // Update existing event
      const updatedEvents = currentEvents.map(e =>
        e.id === event.id ? event : e
      );
      const updatedSelected =
        this.state().selectedEvent?.id === event.id
          ? event
          : this.state().selectedEvent;

      this.patchState({
        events: updatedEvents,
        selectedEvent: updatedSelected,
      });
    } else {
      // Add new event
      this.patchState({
        events: [event, ...currentEvents],
        pagination: {
          ...this.state().pagination,
          total: this.state().pagination.total + 1,
        },
      });
    }
  }

  // State signals
  private readonly state = signal<EventsState>({
    events: [],
    selectedEvent: null,
    loading: false,
    error: null,
    notFound: false,
    pagination: {
      limit: 20,
      offset: 0,
      total: 0,
    },
    filters: {
      status: null,
      search: null,
    },
  });

  // Public readonly signals
  readonly events = computed(() => this.state().events);
  readonly selectedEvent = computed(() => this.state().selectedEvent);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly notFound = computed(() => this.state().notFound);
  readonly pagination = computed(() => this.state().pagination);
  readonly filters = computed(() => this.state().filters);

  // Computed values
  readonly hasEvents = computed(() => this.state().events.length > 0);
  readonly currentPage = computed(() => 
    Math.floor(this.state().pagination.offset / this.state().pagination.limit) + 1
  );
  readonly totalPages = computed(() => 
    Math.ceil(this.state().pagination.total / this.state().pagination.limit)
  );
  readonly hasNextPage = computed(() => 
    this.state().pagination.offset + this.state().pagination.limit < this.state().pagination.total
  );
  readonly hasPreviousPage = computed(() => 
    this.state().pagination.offset > 0
  );

  // ==================== Actions ====================

  /**
   * Load events with current filters and pagination
   */
  async loadEvents(): Promise<void> {
    this.patchState({ loading: true, error: null });

    try {
      const currentState = this.state();
      const response = await lastValueFrom(
        this.eventsService.listEvents(currentState.filters, currentState.pagination)
      );

      this.patchState({
        events: response.events,
        pagination: {
          limit: response.limit,
          offset: response.offset,
          total: response.total,
        },
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load events';
      this.patchState({ error: message, loading: false });
    }
  }

  /**
   * Select a specific event by ID
   */
  async selectEvent(eventId: string): Promise<void> {
    this.patchState({ loading: true, error: null });

    try {
      const event = await lastValueFrom(this.eventsService.getEvent(eventId));
      this.patchState({
        selectedEvent: event,
        loading: false,
      });
    } catch (err: unknown) {
      const is404 = (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404) as boolean;
      this.patchState({
        error: is404 ? null : (err instanceof Error ? err.message : 'Failed to load event'),
        notFound: is404,
        loading: false,
      });
    }
  }

  /**
   * Clear selected event
   */
  clearSelection(): void {
    this.patchState({ selectedEvent: null, notFound: false });
  }

  /**
   * Create a new event
   */
  async createEvent(request: EventCreateRequest): Promise<Event | null> {
    this.patchState({ loading: true, error: null });

    try {
      const event = await lastValueFrom(this.eventsService.createEvent(request));
      
      // Refresh the list to include the new event
      await this.loadEvents();
      
      this.patchState({ loading: false });
      return event;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create event';
      this.patchState({ error: message, loading: false });
      return null;
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(
    eventId: string,
    request: EventUpdateRequest,
  ): Promise<Event | null> {
    this.patchState({ loading: true, error: null });

    try {
      const currentEvent = this.state().selectedEvent;
      if (!currentEvent) {
        throw new Error('No event selected');
      }

      const event = await lastValueFrom(
        this.eventsService.updateEvent(eventId, request, currentEvent.version)
      );

      // Update selected event if it's the same
      if (this.state().selectedEvent?.id === eventId) {
        this.patchState({ selectedEvent: event });
      }

      // Refresh the list
      await this.loadEvents();

      this.patchState({ loading: false });
      return event;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update event';
      this.patchState({ error: message, loading: false });
      return null;
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<boolean> {
    this.patchState({ loading: true, error: null });

    try {
      await lastValueFrom(this.eventsService.deleteEvent(eventId));

      // Clear selection if deleted event was selected
      if (this.state().selectedEvent?.id === eventId) {
        this.patchState({ selectedEvent: null });
      }

      // Refresh the list
      await this.loadEvents();

      this.patchState({ loading: false });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete event';
      this.patchState({ error: message, loading: false });
      return false;
    }
  }

  // ==================== State Transitions ====================

  /**
   * Request approval for a draft event
   */
  async requestApproval(eventId: string): Promise<Event | null> {
    return this.executeTransition(eventId, 'request-approval', (id, version) =>
      this.eventsService.requestApproval(id, version)
    );
  }

  /**
   * Approve an event
   */
  async approveEvent(eventId: string): Promise<Event | null> {
    return this.executeTransition(eventId, 'approve', (id, version) =>
      this.eventsService.approveEvent(id, version)
    );
  }

  /**
   * Schedule an approved event
   */
  async scheduleEvent(eventId: string, request: EventScheduleRequest): Promise<Event | null> {
    this.patchState({ loading: true, error: null });

    try {
      const event = await lastValueFrom(
        this.eventsService.scheduleEvent(eventId, request)
      );

      this.updateEventInState(event);
      this.patchState({ loading: false });
      return event;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to schedule event';
      this.patchState({ error: message, loading: false });
      return null;
    }
  }

  /**
   * Activate a scheduled event
   */
  async activateEvent(eventId: string): Promise<Event | null> {
    return this.executeTransition(eventId, 'activate', (id, version) =>
      this.eventsService.activateEvent(id, version)
    );
  }

  /**
   * Complete an active event
   */
  async completeEvent(eventId: string): Promise<Event | null> {
    return this.executeTransition(eventId, 'complete', (id, version) =>
      this.eventsService.completeEvent(id, version)
    );
  }

  /**
   * Cancel an event
   */
  async cancelEvent(eventId: string): Promise<Event | null> {
    return this.executeTransition(eventId, 'cancel', (id, version) =>
      this.eventsService.cancelEvent(id, version)
    );
  }

  // ==================== Filters & Pagination ====================

  /**
   * Set status filter
   */
  setStatusFilter(status: EventStatus | null): void {
    this.patchState({
      filters: { ...this.state().filters, status },
      pagination: { ...this.state().pagination, offset: 0 }, // Reset to first page
    });
  }

  /**
   * Set search filter
   */
  setSearchFilter(search: string | null): void {
    this.patchState({
      filters: { ...this.state().filters, search },
      pagination: { ...this.state().pagination, offset: 0 }, // Reset to first page
    });
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.patchState({
      filters: { status: null, search: null },
      pagination: { ...this.state().pagination, offset: 0 },
    });
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    const current = this.state().pagination;
    if (current.offset + current.limit < current.total) {
      this.patchState({
        pagination: {
          ...current,
          offset: current.offset + current.limit,
        },
      });
    }
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    const current = this.state().pagination;
    if (current.offset > 0) {
      this.patchState({
        pagination: {
          ...current,
          offset: Math.max(0, current.offset - current.limit),
        },
      });
    }
  }

  /**
   * Go to specific page
   */
  goToPage(pageNumber: number): void {
    const current = this.state().pagination;
    const newOffset = (pageNumber - 1) * current.limit;
    if (newOffset >= 0 && newOffset < current.total) {
      this.patchState({
        pagination: { ...current, offset: newOffset },
      });
    }
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.patchState({ error: null });
  }

  // ==================== Private Helpers ====================

  private patchState(partial: Partial<EventsState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }

  private async executeTransition(
    eventId: string,
    action: string,
    serviceCall: (id: string, version: number) => ReturnType<EventsService['requestApproval']>
  ): Promise<Event | null> {
    this.patchState({ loading: true, error: null });

    try {
      // Find the event to get its version
      let event = this.state().selectedEvent;
      if (!event || event.id !== eventId) {
        // Load the event first to get current version
        event = await lastValueFrom(this.eventsService.getEvent(eventId));
      }

      const updatedEvent = await lastValueFrom(serviceCall(eventId, event.version));

      this.updateEventInState(updatedEvent);
      this.patchState({ loading: false });
      return updatedEvent;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : `Failed to ${action} event`;
      this.patchState({ error: message, loading: false });
      return null;
    }
  }

  private updateEventInState(updatedEvent: Event): void {
    const current = this.state();

    // Update in list
    const updatedEvents = current.events.map(e =>
      e.id === updatedEvent.id ? updatedEvent : e
    );

    // Update selected if same
    const updatedSelected =
      current.selectedEvent?.id === updatedEvent.id ? updatedEvent : current.selectedEvent;

    this.patchState({
      events: updatedEvents,
      selectedEvent: updatedSelected,
    });
  }
}
