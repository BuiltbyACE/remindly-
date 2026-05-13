/**
 * Notification Domain Models
 * Frontend-friendly types for the Notifications feature
 */

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';
export type NotificationStatus = 'unread' | 'read' | 'acknowledged';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  created_at: string;
  read_at?: string;
  acknowledged_at?: string;
  event_id?: string;
  approval_id?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationAcknowledgeRequest {
  notes?: string;
}

export interface NotificationListResponse {
  items: Notification[];
  total: number;
  page: number;
  page_size: number;
}

export interface NotificationFilterOptions {
  status?: NotificationStatus;
  priority?: NotificationPriority;
}

// Priority labels and colors for UI
export const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const PRIORITY_ICONS: Record<NotificationPriority, string> = {
  critical: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  high: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  medium: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  low: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

// Status labels
export const STATUS_LABELS: Record<NotificationStatus, string> = {
  unread: 'Unread',
  read: 'Read',
  acknowledged: 'Acknowledged',
};
