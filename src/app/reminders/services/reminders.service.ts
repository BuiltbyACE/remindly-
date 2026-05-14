/**
 * RemindersService
 * Handles all API communication for the Reminders domain
 */

import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';
import type {
  Reminder,
  ReminderListResponse,
  ReminderPolicy,
  ReminderPolicyCreate,
  ReminderStatus,
} from '../models/reminder.model';

function mapReminderStatus(backendStatus: string): ReminderStatus {
  switch (backendStatus) {
    case 'sent': return 'triggered';
    case 'acknowledged': return 'acknowledged';
    case 'escalated': return 'escalated';
    default: return 'scheduled';
  }
}

function fromApiReminder(data: unknown): Reminder {
  const item = data as Record<string, unknown>;
  return {
    id: String(item['id'] ?? ''),
    event_id: String(item['event_id'] ?? ''),
    participant_id: item['participant_id'] ? String(item['participant_id']) : undefined,
    scheduled_for: String(item['scheduled_for'] ?? ''),
    status: mapReminderStatus(String(item['status'] ?? 'pending')),
    retry_count: Number(item['retry_count'] ?? 0),
    notification_id: item['notification_id'] ? String(item['notification_id']) : undefined,
    sent_at: item['sent_at'] ? String(item['sent_at']) : undefined,
    acknowledged_at: item['acknowledged_at'] ? String(item['acknowledged_at']) : undefined,
    created_at: String(item['created_at'] ?? ''),
    updated_at: item['updated_at'] ? String(item['updated_at']) : String(item['created_at'] ?? ''),
  };
}

function fromApiListResponse(data: unknown): ReminderListResponse {
  const response = data as Record<string, unknown>;
  const items = Array.isArray(response['items'])
    ? response['items'].map(fromApiReminder)
    : Array.isArray(response['data'])
      ? response['data'].map(fromApiReminder)
      : [];
  return { items, total: Number(response['total'] ?? items.length) };
}

@Injectable({
  providedIn: 'root',
})
export class RemindersService extends BaseApiClient {
  listEventReminders(eventId: string): Observable<ReminderListResponse> {
    return this.get<unknown>(`/api/v1/events/${eventId}/reminders`)
      .pipe(map(data => fromApiListResponse(data)));
  }

  acknowledgeReminder(eventId: string, reminderId: string): Observable<Reminder> {
    return this.post<unknown>(`/api/v1/events/${eventId}/reminders/${reminderId}/acknowledge`, {})
      .pipe(map(data => fromApiReminder(data)));
  }

  listPolicies(): Observable<ReminderPolicy[]> {
    return this.get<ReminderPolicy[]>('/api/v1/events/reminder-policies');
  }

  getPolicy(policyId: string): Observable<ReminderPolicy> {
    return this.get<ReminderPolicy>(`/api/v1/events/reminder-policies/${policyId}`);
  }

  createPolicy(policy: ReminderPolicyCreate): Observable<ReminderPolicy> {
    return this.post<ReminderPolicy>('/api/v1/events/reminder-policies', policy);
  }

  deletePolicy(policyId: string): Observable<void> {
    return this.delete<void>(`/api/v1/events/reminder-policies/${policyId}`);
  }
}
