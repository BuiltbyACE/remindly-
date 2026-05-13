/**
 * RemindersService
 * Handles all API communication for the Reminders domain
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';
import type {
  Reminder,
  ReminderListResponse,
  ReminderPolicy,
  ReminderPolicyCreate,
} from '../models/reminder.model';

@Injectable({
  providedIn: 'root',
})
export class RemindersService extends BaseApiClient {
  listEventReminders(eventId: string): Observable<ReminderListResponse> {
    return this.get<ReminderListResponse>(`/events/${eventId}/reminders`);
  }

  acknowledgeReminder(eventId: string, reminderId: string): Observable<Reminder> {
    return this.post<Reminder>(`/events/${eventId}/reminders/${reminderId}/acknowledge`, {});
  }

  listPolicies(): Observable<ReminderPolicy[]> {
    return this.get<ReminderPolicy[]>('/events/reminder-policies');
  }

  getPolicy(policyId: string): Observable<ReminderPolicy> {
    return this.get<ReminderPolicy>(`/events/reminder-policies/${policyId}`);
  }

  createPolicy(policy: ReminderPolicyCreate): Observable<ReminderPolicy> {
    return this.post<ReminderPolicy>('/events/reminder-policies', policy);
  }

  deletePolicy(policyId: string): Observable<void> {
    return this.delete<void>(`/events/reminder-policies/${policyId}`);
  }
}
