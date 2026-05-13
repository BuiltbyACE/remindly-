/**
 * AuditService
 * Handles all API communication for the Audit domain
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';
import type {
  AuditLogEntry,
  AuditListResponse,
  AuditFilterOptions,
  AuditExportRequest,
  AuditExportResponse,
  AuditStats,
} from '../models/audit.model';

@Injectable({
  providedIn: 'root',
})
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
    if (filters?.severity) params['severity'] = filters.severity;
    if (filters?.user_id) params['user_id'] = filters.user_id;
    if (filters?.resource_type) params['resource_type'] = filters.resource_type;
    if (filters?.resource_id) params['resource_id'] = filters.resource_id;
    if (filters?.date_from) params['date_from'] = filters.date_from;
    if (filters?.date_to) params['date_to'] = filters.date_to;
    if (filters?.search) params['search'] = filters.search;

    return this.get<AuditListResponse>('/api/v1/audit', params);
  }

  /**
   * Get a specific audit log entry
   */
  getAuditLog(entryId: string): Observable<AuditLogEntry> {
    return this.get<AuditLogEntry>(`/api/v1/audit/${entryId}`);
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
