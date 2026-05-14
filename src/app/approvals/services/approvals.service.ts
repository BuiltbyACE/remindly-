/**
 * ApprovalsService
 * Handles all API communication for the Approvals domain
 */

import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';
import type {
  Approval,
  ApprovalCreateRequest,
  ApprovalProcessRequest,
  ApprovalListResponse,
  ApprovalFilterOptions,
  PaginationParams,
} from '../models/approval.model';

function fromApiApproval(data: unknown): Approval {
  const item = data as Record<string, unknown>;
  return {
    id: String(item['id'] ?? ''),
    event_id: String(item['event_id'] ?? ''),
    requested_by: String(item['approver_membership_id'] ?? ''),
    requested_by_name: '',
    comments: item['comments'] ? String(item['comments']) : undefined,
    status: (String(item['status'] ?? 'pending')) as Approval['status'],
    processed_at: item['processed_at'] ? String(item['processed_at']) : undefined,
    requested_at: String(item['created_at'] ?? ''),
  };
}

function fromApiListResponse(data: unknown): ApprovalListResponse {
  const response = data as Record<string, unknown>;
  const items = Array.isArray(response['items'])
    ? response['items'].map(fromApiApproval)
    : Array.isArray(response['data'])
      ? response['data'].map(fromApiApproval)
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
export class ApprovalsService extends BaseApiClient {
  listApprovals(
    eventId: string,
    filters?: ApprovalFilterOptions,
    pagination?: PaginationParams
  ): Observable<ApprovalListResponse> {
    return this.get<unknown>(`/api/v1/events/${eventId}/approvals`, {
      page: pagination?.page,
      page_size: pagination?.page_size,
      status: filters?.status,
    }).pipe(map(data => fromApiListResponse(data)));
  }

  createApproval(
    eventId: string,
    request: ApprovalCreateRequest
  ): Observable<Approval> {
    return this.post<unknown>(`/api/v1/events/${eventId}/approvals`, {
      approver_membership_id: request.approver_membership_id,
      comments: request.comments,
    }).pipe(map(data => fromApiApproval(data)));
  }

  processApproval(
    eventId: string,
    approvalId: string,
    request: ApprovalProcessRequest
  ): Observable<Approval> {
    return this.post<unknown>(`/api/v1/events/${eventId}/approvals/${approvalId}/process`, {
      status: request.action === 'approve' ? 'approved' : 'rejected',
      comments: request.comments,
    }).pipe(map(data => fromApiApproval(data)));
  }
}
