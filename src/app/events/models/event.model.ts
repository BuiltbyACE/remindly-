/**
 * Event Domain Models
 * Frontend-friendly interfaces for the Events domain
 */

export type EventStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'scheduled'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'escalated';

export type EventPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Event {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  location: string | null;
  priority: EventPriority;
  status: EventStatus;
  starts_at: string | null;
  ends_at: string | null;
  timezone: string;
  requires_acknowledgement: boolean;
  allow_delegation: boolean;
  reminder_policy_id: string | null;
  created_by: string;
  version: number;
  created_at: string;
  updated_at: string | null;
}

export interface EventListResponse {
  events: Event[];
  total: number;
  limit: number;
  offset: number;
}

export interface EventCreateRequest {
  title: string;
  description?: string | null;
  location?: string | null;
  priority?: EventPriority;
  starts_at?: string | null;
  ends_at?: string | null;
  timezone?: string;
  requires_acknowledgement?: boolean;
  allow_delegation?: boolean;
}

export interface EventUpdateRequest {
  title?: string | null;
  description?: string | null;
  location?: string | null;
  priority?: EventPriority | null;
  starts_at?: string | null;
  ends_at?: string | null;
  timezone?: string | null;
  requires_acknowledgement?: boolean | null;
  allow_delegation?: boolean | null;
}

export interface EventScheduleRequest {
  starts_at: string;
  ends_at: string;
  timezone: string;
  location?: string | null;
  expected_version: number;
}

export interface EventTransitionRequest {
  expected_version: number;
}

export interface EventFilters {
  status: EventStatus | null;
  search: string | null;
}

export interface EventPagination {
  limit: number;
  offset: number;
  total: number;
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  scheduled: 'Scheduled',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
  escalated: 'Escalated',
};

export const EVENT_PRIORITY_LABELS: Record<EventPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const ALLOWED_TRANSITIONS: Record<EventStatus, string[]> = {
  draft: ['request_approval', 'cancel'],
  pending_approval: ['approve', 'reject', 'cancel'],
  approved: ['schedule', 'cancel'],
  scheduled: ['activate', 'cancel'],
  active: ['complete', 'cancel', 'escalate'],
  completed: [],
  cancelled: [],
  escalated: [],
};

export function canTransition(status: EventStatus, action: string): boolean {
  return ALLOWED_TRANSITIONS[status]?.includes(action) ?? false;
}

export function getAvailableActions(status: EventStatus): string[] {
  return ALLOWED_TRANSITIONS[status] ?? [];
}
