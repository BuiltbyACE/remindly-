export type DocumentStatus = 'pending_approval' | 'approved' | 'rejected';

export interface Document {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  file_name: string;
  file_size: number;
  mime_type: string;
  status: DocumentStatus;
  uploaded_by: string;
  uploaded_by_name: string;
  approved_by: string | null;
  approved_by_name: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface DocumentCreateRequest {
  title: string;
  description?: string | null;
}

export interface DocumentUpdateRequest {
  title?: string | null;
  description?: string | null;
}

export interface DocumentReport {
  summary: {
    total_documents: number;
    pending_approval: number;
    approved: number;
    rejected: number;
    total_size_mb: number;
  };
  documents: Document[];
}

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function isRenderableMime(mimeType: string): boolean {
  return ['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(mimeType);
}
