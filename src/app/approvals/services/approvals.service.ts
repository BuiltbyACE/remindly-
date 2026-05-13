/**
 * ApprovalsService
 * Handles all API communication for the Approvals domain
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';
import type {
  Approval,
  ApprovalCreateRequest,
  ApprovalProcessRequest,
  ApprovalListResponse,
  ApprovalFilterOptions,
  PaginationParams,
} from '../models/approval.model';

@Injectable({
  providedIn: 'root',
})
export class ApprovalsService extends BaseApiClient {
  listApprovals(
    eventId: string,
    filters?: ApprovalFilterOptions,
    pagination?: PaginationParams
  ): Observable<ApprovalListResponse> {
    return this.get<ApprovalListResponse>(`/events/${eventId}/approvals`, {
      page: pagination?.page,
      page_size: pagination?.page_size,
      status: filters?.status,
    });
  }

  createApproval(
    eventId: string,
    request: ApprovalCreateRequest
  ): Observable<Approval> {
    return this.post<Approval>(`/events/${eventId}/approvals`, request);
  }

  processApproval(
    eventId: string,
    approvalId: string,
    request: ApprovalProcessRequest
  ): Observable<Approval> {
    return this.post<Approval>(`/events/${eventId}/approvals/${approvalId}/process`, request);
  }
}
