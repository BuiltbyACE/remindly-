/**
 * AuditService
 * Handles all API communication for the Audit domain
 */

import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';
import type {
  AuditLogEntry,
  AuditListResponse,
  AuditFilterOptions,
  AuditExportRequest,
  AuditExportResponse,
  AuditStats,
} from '../models/audit.model';

function fromApiEntry(data: unknown): AuditLogEntry {
  const item = data as Record<string, unknown>;
  return {
    id: String(item['id'] ?? ''),
    organization_id: item['organization_id'] ? String(item['organization_id']) : '',
    user_id: item['actor_user_id'] ? String(item['actor_user_id']) : '',
    user_email: '',
    action: (String(item['action'] ?? '')) as AuditLogEntry['action'],
    severity: 'info' as AuditLogEntry['severity'],
    resource_type: String(item['resource_type'] ?? ''),
    resource_id: item['resource_id'] ? String(item['resource_id']) : '',
    description: `${item['action'] ?? ''} ${item['resource_type'] ?? ''}`,
    metadata: item['changes'] ? (item['changes'] as Record<string, unknown>) : {},
    ip_address: null,
    user_agent: null,
    created_at: String(item['timestamp'] ?? ''),
  };
}

function fromApiListResponse(data: unknown): AuditListResponse {
  const response = data as Record<string, unknown>;
  const items = Array.isArray(response['data'])
    ? response['data'].map(fromApiEntry)
    : Array.isArray(response['items'])
      ? response['items'].map(fromApiEntry)
      : [];
  return {
    items,
    total: items.length,
    page: 1,
    page_size: items.length,
  };
}

export class AuditService extends BaseApiClient {
  /**
   * List audit log entries with filtering
   */
  listAuditLogs(
    page = 1,
    pageSize = 50,
    filters?: AuditFilterOptions
  ): Observable<AuditListResponse> {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (filters?.action) params['action'] = filters.action;
    if (filters?.user_id) params['user_id'] = filters.user_id;
    if (filters?.resource_type) params['resource_type'] = filters.resource_type;
    if (filters?.resource_id) params['resource_id'] = filters.resource_id;

    return this.get<unknown>('/api/v1/audit/logs', params)
      .pipe(map(data => fromApiListResponse(data)));
  }

  /**
   * Get a specific audit log entry
   */
  getAuditLog(entryId: string): Observable<AuditLogEntry> {
    return this.get<unknown>(`/api/v1/audit/logs/${entryId}`)
      .pipe(map(data => fromApiEntry(data)));
  }

  /**
   * Export audit logs
   */
  exportAuditLogs(request: AuditExportRequest): Observable<AuditExportResponse> {
    return this.post<AuditExportResponse>('/api/v1/audit/export', request);
  }

  /**
   * Get audit statistics
   */
  getAuditStats(dateFrom?: string, dateTo?: string): Observable<AuditStats> {
    const params: Record<string, string> = {};
    if (dateFrom) params['date_from'] = dateFrom;
    if (dateTo) params['date_to'] = dateTo;
    return this.get<AuditStats>('/api/v1/audit/stats', params);
  }

  /**
   * Get available filter values (actions, severities, resource types)
   */
  getFilterOptions(): Observable<{
    actions: string[];
    severities: string[];
    resource_types: string[];
  }> {
    return this.get<{ actions: string[]; severities: string[]; resource_types: string[] }>(
      '/api/v1/audit/filter-options'
    );
  }
}
