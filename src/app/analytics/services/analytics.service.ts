/**
 * AnalyticsService
 * Handles all API communication for the Analytics domain
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';
import type {
  Dashboard,
  AnalyticsRequest,
  AnalyticsResponse,
  AnalyticsTimeRange,
} from '../models/analytics.model';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService extends BaseApiClient {
  /**
   * Get main analytics dashboard
   */
  getDashboard(timeRange: AnalyticsTimeRange = '30d'): Observable<Dashboard> {
    return this.get<Dashboard>('/api/v1/analytics/dashboard', { time_range: timeRange });
  }

  /**
   * Get specific metrics
   */
  getMetrics(request: AnalyticsRequest): Observable<AnalyticsResponse> {
    return this.post<AnalyticsResponse>('/api/v1/analytics/metrics', request);
  }

  /**
   * Get event volume data for charts
   */
  getEventVolume(
    timeRange: AnalyticsTimeRange = '30d'
  ): Observable<{
    labels: string[];
    created: number[];
    completed: number[];
  }> {
    return this.get<{ labels: string[]; created: number[]; completed: number[] }>(
      '/api/v1/analytics/events/volume',
      { time_range: timeRange }
    );
  }

  /**
   * Get approval metrics
   */
  getApprovalMetrics(
    timeRange: AnalyticsTimeRange = '30d'
  ): Observable<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    avg_time_hours: number;
  }> {
    return this.get<{
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      avg_time_hours: number;
    }>('/api/v1/analytics/approvals', { time_range: timeRange });
  }

  /**
   * Get executive summary (for dashboard)
   */
  getExecutiveSummary(): Observable<{
    events_this_week: number;
    pending_approvals: number;
    unread_notifications: number;
    escalated_reminders: number;
    completion_rate: number;
  }> {
    return this.get<{
      events_this_week: number;
      pending_approvals: number;
      unread_notifications: number;
      escalated_reminders: number;
      completion_rate: number;
    }>('/api/v1/analytics/executive-summary');
  }

  /**
   * Export analytics report
   */
  exportReport(
    format: 'pdf' | 'csv',
    timeRange: AnalyticsTimeRange = '30d'
  ): Observable<{ download_url: string }> {
    return this.post<{ download_url: string }>('/api/v1/analytics/export', {
      format,
      time_range: timeRange,
    });
  }
}
