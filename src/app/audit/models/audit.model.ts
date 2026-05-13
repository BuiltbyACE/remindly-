/**
 * Audit Domain Models
 * Types for audit logs, filtering, and export
 */

export type AuditAction =
  | 'event.created'
  | 'event.updated'
  | 'event.deleted'
  | 'event.status_changed'
  | 'approval.requested'
  | 'approval.processed'
  | 'reminder.triggered'
  | 'reminder.acknowledged'
  | 'notification.sent'
  | 'notification.acknowledged'
  | 'user.login'
  | 'user.logout'
  | 'integration.connected'
  | 'integration.disconnected'
  | 'integration.synced'
  | 'voice.command'
  | 'voice.confirmed'
  | 'ai.briefing_generated'
  | 'settings.updated';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLogEntry {
  id: string;
  organization_id: string;
  user_id: string;
  user_email: string;
  action: AuditAction;
  severity: AuditSeverity;
  resource_type: string;
  resource_id: string;
  description: string;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditFilterOptions {
  action?: AuditAction;
  severity?: AuditSeverity;
  user_id?: string;
  resource_type?: string;
  resource_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface AuditListResponse {
  items: AuditLogEntry[];
  total: number;
  page: number;
  page_size: number;
}

export interface AuditExportRequest {
  format: 'csv' | 'json' | 'xlsx';
  filters?: AuditFilterOptions;
  date_from?: string;
  date_to?: string;
}

export interface AuditExportResponse {
  download_url: string;
  expires_at: string;
  record_count: number;
}

export interface AuditStats {
  total_events: number;
  events_today: number;
  events_this_week: number;
  critical_events: number;
  top_actions: { action: AuditAction; count: number }[];
  top_users: { user_id: string; user_email: string; count: number }[];
}

// Action labels and icons
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  'event.created': 'Event Created',
  'event.updated': 'Event Updated',
  'event.deleted': 'Event Deleted',
  'event.status_changed': 'Event Status Changed',
  'approval.requested': 'Approval Requested',
  'approval.processed': 'Approval Processed',
  'reminder.triggered': 'Reminder Triggered',
  'reminder.acknowledged': 'Reminder Acknowledged',
  'notification.sent': 'Notification Sent',
  'notification.acknowledged': 'Notification Acknowledged',
  'user.login': 'User Login',
  'user.logout': 'User Logout',
  'integration.connected': 'Integration Connected',
  'integration.disconnected': 'Integration Disconnected',
  'integration.synced': 'Integration Synced',
  'voice.command': 'Voice Command',
  'voice.confirmed': 'Voice Command Confirmed',
  'ai.briefing_generated': 'AI Briefing Generated',
  'settings.updated': 'Settings Updated',
};

export const AUDIT_SEVERITY_COLORS: Record<AuditSeverity, string> = {
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  critical: 'bg-red-200 text-red-900 border-red-300',
};

export const AUDIT_SEVERITY_ICONS: Record<AuditSeverity, string> = {
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  error: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  critical: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};
