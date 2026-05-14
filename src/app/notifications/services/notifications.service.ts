/**
 * NotificationsService
 * Handles all API communication for the Notifications domain
 */

import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';
import type {
  Notification,
  NotificationAcknowledgeRequest,
  NotificationListResponse,
  NotificationFilterOptions,
  NotificationStatus,
} from '../models/notification.model';

function fromApiNotification(data: unknown): Notification {
  const item = data as Record<string, unknown>;
  const status = String(item['status'] ?? 'queued');
  return {
    id: String(item['id'] ?? ''),
    type: String(item['channel'] ?? ''),
    title: String(item['subject'] ?? ''),
    message: String(item['body'] ?? ''),
    priority: (String(item['priority'] ?? 'medium')) as Notification['priority'],
    status: (status === 'delivered' ? 'read' : status === 'queued' || status === 'sent' ? 'unread' : status) as Notification['status'],
    created_at: String(item['created_at'] ?? ''),
    read_at: item['sent_at'] ? String(item['sent_at']) : undefined,
    acknowledged_at: item['acknowledged_at'] ? String(item['acknowledged_at']) : undefined,
    event_id: item['event_id'] ? String(item['event_id']) : undefined,
  };
}

function fromApiListResponse(data: unknown): NotificationListResponse {
  if (Array.isArray(data)) {
    const items = data.map(fromApiNotification);
    return { items, total: items.length, page: 1, page_size: items.length };
  }
  const response = data as Record<string, unknown>;
  const items = Array.isArray(response['items'])
    ? response['items'].map(fromApiNotification)
    : Array.isArray(response['data'])
      ? response['data'].map(fromApiNotification)
      : [];
  return {
    items,
    total: Number(response['total'] ?? items.length),
    page: Number(response['page'] ?? 1),
    page_size: Number(response['page_size'] ?? 20),
  };
}

@Injectable({
  providedIn: 'root',
})
export class NotificationsService extends BaseApiClient {
  listMyNotifications(
    filters?: NotificationFilterOptions,
    page?: number,
    pageSize?: number
  ): Observable<NotificationListResponse> {
    return this.get<NotificationListResponse>('/api/v1/notifications/my', {
      page,
      page_size: pageSize,
    }).pipe(map(data => fromApiListResponse(data)));
  }

  getNotification(notificationId: string): Observable<Notification> {
    return this.get<unknown>(`/api/v1/notifications/${notificationId}`)
      .pipe(map(data => fromApiNotification(data)));
  }

  acknowledgeNotification(
    notificationId: string,
    request?: NotificationAcknowledgeRequest
  ): Observable<Notification> {
    return this.post<unknown>(`/api/v1/notifications/${notificationId}/acknowledge`, request || {})
      .pipe(map(data => fromApiNotification(data)));
  }
}
