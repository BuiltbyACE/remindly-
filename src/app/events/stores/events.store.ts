import { Injectable, inject, computed, signal, OnDestroy } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { filter as rxFilter } from 'rxjs/operators';
import { EventsService } from '../services/events.service';
import { WebSocketStore } from '../../websocket/websocket.store';
import { WebSocketService } from '../../websocket/websocket.service';
import { RemindersStore } from '../../reminders/stores/reminders.store';
import { AuthStore } from '../../auth/stores/auth.store';
import { RbacStore } from '../../auth/stores/rbac.store';
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
  private readonly webSocketService = inject(WebSocketService);
  private readonly remindersStore = inject(RemindersStore);
  private readonly authStore = inject(AuthStore);
  private readonly rbacStore = inject(RbacStore);
  private readonly subscriptions: Subscription[] = [];

  constructor() {
    this.initializeWebSocketSubscriptions();
  }

  // Secretary role checker
  private readonly isSecretary = computed(() => {
    const hasExecutivePerm = this.rbacStore.hasPermission()('audit.read');
    const hasAdminPerm = this.rbacStore.hasPermission()('events.approve') && !hasExecutivePerm;
    return !hasExecutivePerm && !hasAdminPerm;
  });

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) sub.unsubscribe();
    this.subscriptions.length = 0;
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
    // Re-fetch events on WebSocket reconnect to catch missed updates
    this.subscriptions.push(
      this.webSocketService.connectionAck$.pipe(
        rxFilter(() => this.state().events.length > 0)
      ).subscribe(() => {
        this.silentRefresh();
      })
    );

    // Subscribe to event.updated (create, update, status change)
    this.subscriptions.push(
      this.webSocketStore
        .messagesOfType('event.updated')
        .subscribe((message) => {
          this.handleWebSocketMessage(message);
        })
    );

    // Subscribe to event.deleted
    this.subscriptions.push(
      this.webSocketStore
        .messagesOfType('event.deleted')
        .subscribe((message) => {
          this.handleDeleteWebSocketMessage(message);
        })
    );
  }

  /**
   * Handle WebSocket messages for events (upsert: adds new or updates existing)
   * Backend WS payload format: { event_id, title, status, version }
   */
  private handleWebSocketMessage(message: { type: string; payload: unknown }): void {
    const payload = message.payload as Record<string, unknown>;
    const eventId = payload['event_id'] as string | undefined;
    if (!eventId) return;

    const current = this.state();
    const existingIndex = current.events.findIndex(e => e.id === eventId);
    const isSelected = current.selectedEvent?.id === eventId;

    if (existingIndex < 0 && !isSelected) return;

    const source = existingIndex >= 0 ? current.events[existingIndex] : current.selectedEvent!;
    const merged: Event = {
      ...source,
      title: (payload['title'] as string) ?? source.title,
      status: (payload['status'] as string) ?? source.status,
      version: (payload['version'] as number) ?? source.version,
    } as Event;

    const updatedEvents = existingIndex >= 0
      ? current.events.map(e => e.id === eventId ? merged : e)
      : current.events;

    this.patchState({
      events: updatedEvents,
      selectedEvent: isSelected ? merged : current.selectedEvent,
    });
  }

  /**
   * Handle event.deleted messages — remove from list and clear selection if needed
   * Backend WS payload format: { event_id, title }
   */
  private handleDeleteWebSocketMessage(message: { type: string; payload: unknown }): void {
    const payload = message.payload as Record<string, unknown>;
    const eventId = payload['event_id'] as string | undefined;
    if (!eventId) return;

    const current = this.state();

    const updatedEvents = current.events.filter(e => e.id !== eventId);

    const updatedSelected =
      current.selectedEvent?.id === eventId
        ? null
        : current.selectedEvent;

    this.patchState({
      events: updatedEvents,
      selectedEvent: updatedSelected,
      pagination: {
        ...current.pagination,
        total: Math.max(0, current.pagination.total - 1),
      },
    });
  }

  /**
   * Silently re-fetch events without showing loading state
   * Used after WebSocket reconnect to catch missed updates
   */
  private async silentRefresh(): Promise<void> {
    try {
      const currentState = this.state();
      const secretaryFilters = { ...currentState.filters };
      if (this.isSecretary()) {
        const userId = this.authStore.user()?.id;
        if (userId) secretaryFilters.creator_id = userId;
      }
      const response = await lastValueFrom(
        this.eventsService.listEvents(secretaryFilters, currentState.pagination)
      );
      this.patchState({
        events: response.events,
        pagination: {
          limit: response.limit,
          offset: response.offset,
          total: response.total,
        },
      });
    } catch {
      // silent failure — stale data is better than no data
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
   * For secretary role, filter events to only show their own events
   */
  async loadEvents(): Promise<void> {
    this.patchState({ loading: true, error: null, notFound: false });

    try {
      const currentState = this.state();
      
      // Prepare filters - add creator_id filter for secretary role
      const secretaryFilters = { ...currentState.filters };
      if (this.isSecretary()) {
        // For secretary, only show their own events
        // Assuming we can get user ID from auth store
        const userId = this.authStore.user()?.id;
        if (userId) {
          secretaryFilters.creator_id = userId;
        }
      }
      
      const response = await lastValueFrom(
        this.eventsService.listEvents(secretaryFilters, currentState.pagination)
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
      // Handle 404 gracefully for secretary role - hide instead of show error
      const is404 = !!(err && typeof err === 'object' && 'status' in err && 
                    (err as { status: number }).status === 404);
      this.patchState({ 
        error: is404 ? null : (err instanceof Error ? err.message : 'Failed to load events'),
        notFound: is404,  // This will be used to hide event instead of showing error
        loading: false 
      });
    }
  }

  /**
   * Select a specific event by ID
   * For secretary role, handle 404 gracefully by hiding event instead of showing error
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
      const is404 = (err && typeof err === 'object' && 'status' in err && 
                      (err as { status: number }).status === 404) as boolean;
      this.patchState({
        error: is404 ? null : (err instanceof Error ? err.message : 'Failed to load event'),
        notFound: is404,  // Used to hide event in UI instead of showing error
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
      
      const current = this.state();
      this.patchState({
        events: [event, ...current.events],
        selectedEvent: event,
        loading: false,
      });
      
      this.showNativeNotification('Remindly', 'Event created successfully');
      
      // Refresh list in background
      this.loadEvents();
      
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

      this.updateEventInState(event);
      this.patchState({ loading: false });

      this.showNativeNotification('Remindly', 'Event updated successfully');

      // Refresh list in background
      this.loadEvents();

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

      const current = this.state();
      const updatedEvents = current.events.filter(e => e.id !== eventId);
      const updatedSelected = current.selectedEvent?.id === eventId ? null : current.selectedEvent;

      this.patchState({
        events: updatedEvents,
        selectedEvent: updatedSelected,
        loading: false,
      });

      this.showNativeNotification('Remindly', 'Event deleted successfully');

      // Refresh list in background
      this.loadEvents();

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

      this.showNativeNotification('Remindly', 'Event scheduled successfully');

      // Refresh list in background
      this.loadEvents();

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

  private showNativeNotification(title: string, body: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
      });
    }
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

      const actionLabels: Record<string, string> = {
        'request-approval': 'Approval requested successfully',
        'approve': 'Event approved successfully',
        'activate': 'Event activated successfully',
        'complete': 'Event completed successfully',
        'cancel': 'Event cancelled successfully',
      };
      const label = actionLabels[action] || `${action} action completed successfully`;
      this.showNativeNotification('Remindly', label);

      // Refresh list in background
      this.loadEvents();

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
