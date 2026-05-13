/**
 * SettingsService
 * Handles all API communication for the Settings domain
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';
import type {
  UserSettings,
  UserSettingsUpdate,
  OrganizationSettings,
  OrganizationSettingsUpdate,
  NotificationPreferences,
  SettingsResponse,
} from '../models/settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService extends BaseApiClient {
  /**
   * Get all settings for current user and org
   */
  getSettings(): Observable<SettingsResponse> {
    return this.get<SettingsResponse>('/api/v1/settings');
  }

  /**
   * Get user settings
   */
  getUserSettings(): Observable<UserSettings> {
    return this.get<UserSettings>('/api/v1/settings/user');
  }

  /**
   * Update user settings
   */
  updateUserSettings(settings: UserSettingsUpdate): Observable<UserSettings> {
    return this.patch<UserSettings>('/api/v1/settings/user', settings);
  }

  /**
   * Get organization settings
   */
  getOrganizationSettings(): Observable<OrganizationSettings> {
    return this.get<OrganizationSettings>('/api/v1/settings/organization');
  }

  /**
   * Update organization settings
   */
  updateOrganizationSettings(settings: OrganizationSettingsUpdate): Observable<OrganizationSettings> {
    return this.patch<OrganizationSettings>('/api/v1/settings/organization', settings);
  }

  /**
   * Get notification preferences
   */
  getNotificationPreferences(): Observable<NotificationPreferences> {
    return this.get<NotificationPreferences>('/api/v1/settings/notifications');
  }

  /**
   * Update notification preferences
   */
  updateNotificationPreferences(prefs: Partial<NotificationPreferences>): Observable<NotificationPreferences> {
    return this.patch<NotificationPreferences>('/api/v1/settings/notifications', prefs);
  }

  /**
   * Upload organization logo
   */
  uploadOrganizationLogo(file: File): Observable<{ logo_url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.post<{ logo_url: string }>('/api/v1/settings/organization/logo', formData);
  }
}
