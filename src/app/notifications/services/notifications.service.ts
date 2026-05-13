/**
 * NotificationsService
 * Handles all API communication for the Notifications domain
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';
import type {
  Notification,
  NotificationAcknowledgeRequest,
  NotificationListResponse,
  NotificationFilterOptions,
  NotificationStatus,
} from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService extends BaseApiClient {
  listMyNotifications(
    filters?: NotificationFilterOptions,
    page?: number,
    pageSize?: number
  ): Observable<NotificationListResponse> {
    return this.get<NotificationListResponse>('/notifications/my', {
      page,
      page_size: pageSize,
      status: filters?.status,
    });
  }

  getNotification(notificationId: string): Observable<Notification> {
    return this.get<Notification>(`/notifications/${notificationId}`);
  }

  acknowledgeNotification(
    notificationId: string,
    request?: NotificationAcknowledgeRequest
  ): Observable<Notification> {
    return this.post<Notification>(`/notifications/${notificationId}/acknowledge`, request || {});
  }
}
