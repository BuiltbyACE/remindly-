/**
 * Approval Domain Models
 * Frontend-friendly types for the Approvals feature
 */

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Approval {
  id: string;
  event_id: string;
  requested_by: string;
  requested_by_name: string;
  status: ApprovalStatus;
  requested_at: string;
  processed_at?: string;
  processed_by?: string;
  processed_by_name?: string;
  comments?: string;
  event_title?: string;
}

export interface ApprovalCreateRequest {
  comments?: string;
}

export interface ApprovalProcessRequest {
  action: 'approve' | 'reject';
  comments?: string;
}

export interface ApprovalListResponse {
  items: Approval[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApprovalFilterOptions {
  status?: ApprovalStatus;
  event_id?: string;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
}

// Status labels and colors for UI
export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};
