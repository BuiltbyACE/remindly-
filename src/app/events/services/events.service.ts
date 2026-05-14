import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';
import { EventMapper } from '../models/event.mapper';
import type {
  Event,
  EventListResponse,
  EventCreateRequest,
  EventUpdateRequest,
  EventScheduleRequest,
  EventFilters,
  EventPagination,
} from '../models/event.model';

@Injectable({
  providedIn: 'root',
})
export class EventsService extends BaseApiClient {
  private readonly mapper = EventMapper;

  listEvents(
    filters?: EventFilters,
    pagination?: Partial<EventPagination>,
  ): Observable<EventListResponse> {
    return this.get<unknown>('/api/v1/events', {
      status: filters?.status ?? undefined,
      limit: pagination?.limit ?? 20,
      offset: pagination?.offset ?? 0,
    }).pipe(map(data => this.mapper.fromApiListResponse(data)));
  }

  getEvent(eventId: string): Observable<Event> {
    return this.get<unknown>(`/api/v1/events/${eventId}`)
      .pipe(map(data => this.mapper.fromApiResponse(data)));
  }

  createEvent(request: EventCreateRequest): Observable<Event> {
    return this.post<unknown>('/api/v1/events', this.mapper.toApiCreateRequest(request))
      .pipe(map(data => this.mapper.fromApiResponse(data)));
  }

  updateEvent(
    eventId: string,
    request: EventUpdateRequest,
    expectedVersion: number,
  ): Observable<Event> {
    return this.patch<unknown>(`/api/v1/events/${eventId}`, this.mapper.toApiUpdateRequest(request), {
      expected_version: expectedVersion,
    }).pipe(map(data => this.mapper.fromApiResponse(data)));
  }

  deleteEvent(eventId: string): Observable<void> {
    return this.delete<void>(`/api/v1/events/${eventId}`);
  }

  // ==================== State Transitions ====================

  requestApproval(eventId: string, expectedVersion: number): Observable<Event> {
    return this.post<unknown>(`/api/v1/events/${eventId}/request-approval`, this.mapper.toApiTransitionRequest(expectedVersion))
      .pipe(map(data => this.mapper.fromApiResponse(data)));
  }

  approveEvent(eventId: string, expectedVersion: number): Observable<Event> {
    return this.post<unknown>(`/api/v1/events/${eventId}/approve`, this.mapper.toApiTransitionRequest(expectedVersion))
      .pipe(map(data => this.mapper.fromApiResponse(data)));
  }

  scheduleEvent(eventId: string, request: EventScheduleRequest): Observable<Event> {
    return this.post<unknown>(`/api/v1/events/${eventId}/schedule`, this.mapper.toApiScheduleRequest(request))
      .pipe(map(data => this.mapper.fromApiResponse(data)));
  }

  activateEvent(eventId: string, expectedVersion: number): Observable<Event> {
    return this.post<unknown>(`/api/v1/events/${eventId}/activate`, this.mapper.toApiTransitionRequest(expectedVersion))
      .pipe(map(data => this.mapper.fromApiResponse(data)));
  }

  completeEvent(eventId: string, expectedVersion: number): Observable<Event> {
    return this.post<unknown>(`/api/v1/events/${eventId}/complete`, this.mapper.toApiTransitionRequest(expectedVersion))
      .pipe(map(data => this.mapper.fromApiResponse(data)));
  }

  cancelEvent(eventId: string, expectedVersion: number): Observable<Event> {
    return this.post<unknown>(`/api/v1/events/${eventId}/cancel`, this.mapper.toApiTransitionRequest(expectedVersion))
      .pipe(map(data => this.mapper.fromApiResponse(data)));
  }

  assignPolicy(eventId: string, policyId: string, expectedVersion: number): Observable<Event> {
    return this.post<unknown>(`/api/v1/events/${eventId}/assign-policy`, {
      reminder_policy_id: policyId,
      expected_version: expectedVersion,
    }).pipe(map(data => this.mapper.fromApiResponse(data)));
  }
}
