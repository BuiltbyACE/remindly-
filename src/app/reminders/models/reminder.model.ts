/**
 * Reminder Domain Models
 * Frontend-friendly types for the Reminders feature
 */

export type ReminderStatus = 'scheduled' | 'triggered' | 'acknowledged' | 'escalated';
export type ReminderChannel = 'in_app' | 'email' | 'sms' | 'push';

export interface Reminder {
  id: string;
  event_id: string;
  participant_id?: string;
  policy_id?: string;
  scheduled_for: string;
  status: ReminderStatus;
  channel?: ReminderChannel;
  message?: string;
  sent_at?: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  escalated_at?: string;
  retry_count: number;
  notification_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ReminderPolicy {
  id: string;
  name: string;
  description?: string;
  reminder_offsets: number[]; // Minutes before event
  escalation_offsets: number[]; // Minutes after reminder if not acknowledged
  channels: ReminderChannel[];
  is_default: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface ReminderPolicyCreate {
  name: string;
  description?: string;
  reminder_offsets: number[];
  escalation_offsets: number[];
  channels: ReminderChannel[];
}

export interface ReminderListResponse {
  items: Reminder[];
  total: number;
}

// Status labels and colors for UI
export const REMINDER_STATUS_LABELS: Record<ReminderStatus, string> = {
  scheduled: 'Scheduled',
  triggered: 'Pending Acknowledgment',
  acknowledged: 'Acknowledged',
  escalated: 'Escalated',
};

export const REMINDER_STATUS_COLORS: Record<ReminderStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  triggered: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  acknowledged: 'bg-green-100 text-green-800 border-green-200',
  escalated: 'bg-red-100 text-red-800 border-red-200',
};

export const REMINDER_STATUS_ICONS: Record<ReminderStatus, string> = {
  scheduled: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  triggered: 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  acknowledged: 'M5 13l4 4L19 7',
  escalated: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

// Channel labels
export const REMINDER_CHANNEL_LABELS: Record<ReminderChannel, string> = {
  in_app: 'In-App',
  email: 'Email',
  sms: 'SMS',
  push: 'Push Notification',
};

// Channel icons
export const REMINDER_CHANNEL_ICONS: Record<ReminderChannel, string> = {
  in_app: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  email: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  sms: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  push: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
};
