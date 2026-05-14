/**
 * Event Mapper
 * Converts between API DTOs and frontend domain models
 */

import type { components } from '../../api/types.generated';
import type {
  Event,
  EventCreateRequest,
  EventUpdateRequest,
  EventScheduleRequest,
  EventListResponse,
} from './event.model';

// Use generated types for API schemas
type ApiEventCreate = components['schemas']['EventCreate'];
type ApiEventUpdate = components['schemas']['EventUpdate'];
type ApiEventScheduleRequest = components['schemas']['EventScheduleRequest'];
type ApiEventTransitionRequest = components['schemas']['EventTransitionRequest'];
type ApiEventPriority = components['schemas']['EventPriority'];

export class EventMapper {
  /**
   * Convert API response to domain model
   * Note: Backend returns generic objects, so we validate/transform here
   */
  static fromApiResponse(data: unknown): Event {
    const event = data as Record<string, unknown>;

    return {
      id: String(event['id'] ?? ''),
      organization_id: String(event['organization_id'] ?? ''),
      title: String(event['title'] ?? ''),
      description: event['description'] ? String(event['description']) : null,
      location: event['location'] ? String(event['location']) : null,
      priority: this.parsePriority(event['priority']),
      status: this.parseStatus(event['status']),
      starts_at: event['starts_at'] ? String(event['starts_at']) : null,
      ends_at: event['ends_at'] ? String(event['ends_at']) : null,
      timezone: String(event['timezone'] ?? 'UTC'),
      requires_acknowledgement: Boolean(event['requires_acknowledgement'] ?? false),
      allow_delegation: Boolean(event['allow_delegation'] ?? false),
      reminder_policy_id: event['reminder_policy_id'] ? String(event['reminder_policy_id']) : null,
      created_by: String(event['creator_id'] ?? ''),
      version: Number(event['version'] ?? 1),
      created_at: String(event['created_at'] ?? new Date().toISOString()),
      updated_at: event['updated_at'] ? String(event['updated_at']) : null,
    };
  }

  /**
   * Convert list response
   */
  static fromApiListResponse(data: unknown): EventListResponse {
    let rawList: unknown[];

    if (Array.isArray(data)) {
      rawList = data;
    } else {
      const response = data as Record<string, unknown>;
      rawList = (Array.isArray(response['events']) ? response['events'] :
                 Array.isArray(response['data']) ? response['data'] : []) as unknown[];
    }

    const events = rawList.map(e => this.fromApiResponse(e));

    return {
      events,
      total: events.length,
      limit: 20,
      offset: 0,
    };
  }

  /**
   * Convert domain create request to API format
   */
  static toApiCreateRequest(request: EventCreateRequest): ApiEventCreate {
    return {
      title: request.title,
      description: request.description ?? null,
      location: request.location ?? null,
      priority: (request.priority ?? 'medium') as ApiEventPriority,
      starts_at: request.starts_at ?? null,
      ends_at: request.ends_at ?? null,
      timezone: request.timezone ?? 'UTC',
      requires_acknowledgement: request.requires_acknowledgement ?? false,
      allow_delegation: request.allow_delegation ?? false,
    };
  }

  /**
   * Convert domain update request to API format
   */
  static toApiUpdateRequest(request: EventUpdateRequest): ApiEventUpdate {
    const apiRequest: ApiEventUpdate = {};
    
    if (request.title !== undefined) apiRequest.title = request.title;
    if (request.description !== undefined) apiRequest.description = request.description;
    if (request.location !== undefined) apiRequest.location = request.location;
    if (request.priority !== undefined) apiRequest.priority = request.priority as ApiEventPriority;
    if (request.starts_at !== undefined) apiRequest.starts_at = request.starts_at;
    if (request.ends_at !== undefined) apiRequest.ends_at = request.ends_at;
    if (request.timezone !== undefined) apiRequest.timezone = request.timezone;
    if (request.requires_acknowledgement !== undefined) apiRequest.requires_acknowledgement = request.requires_acknowledgement;
    if (request.allow_delegation !== undefined) apiRequest.allow_delegation = request.allow_delegation;
    
    return apiRequest;
  }

  /**
   * Convert schedule request to API format
   */
  static toApiScheduleRequest(request: EventScheduleRequest): ApiEventScheduleRequest {
    return {
      starts_at: request.starts_at,
      ends_at: request.ends_at,
      timezone: request.timezone,
      location: request.location ?? null,
      expected_version: request.expected_version,
    };
  }

  /**
   * Create transition request
   */
  static toApiTransitionRequest(expectedVersion: number): ApiEventTransitionRequest {
    return {
      expected_version: expectedVersion,
    };
  }

  private static parsePriority(value: unknown): 'low' | 'medium' | 'high' | 'critical' {
    const validPriorities = ['low', 'medium', 'high', 'critical'] as const;
    const priority = String(value ?? 'medium');
    return validPriorities.includes(priority as typeof validPriorities[number]) 
      ? (priority as typeof validPriorities[number])
      : 'medium';
  }

  private static parseStatus(value: unknown): Event['status'] {
    const validStatuses = ['draft', 'pending_approval', 'approved', 'scheduled', 'active', 'completed', 'cancelled', 'escalated'] as const;
    const status = String(value ?? 'draft');
    return validStatuses.includes(status as typeof validStatuses[number])
      ? (status as typeof validStatuses[number])
      : 'draft';
  }
}
