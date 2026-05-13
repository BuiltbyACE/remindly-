/**
 * Settings Domain Models
 * Types for user preferences and organization configuration
 */

// User Settings
export type ThemeMode = 'light' | 'dark' | 'system';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';

export interface UserSettings {
  theme: ThemeMode;
  date_format: DateFormat;
  time_format: TimeFormat;
  timezone: string;
  language: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_sound: boolean;
  desktop_notifications: boolean;
  default_calendar_view: 'day' | 'week' | 'month';
  items_per_page: number;
  compact_mode: boolean;
  high_contrast: boolean;
  reduced_motion: boolean;
}

export interface UserSettingsUpdate {
  theme?: ThemeMode;
  date_format?: DateFormat;
  time_format?: TimeFormat;
  timezone?: string;
  language?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  sms_notifications?: boolean;
  notification_sound?: boolean;
  desktop_notifications?: boolean;
  default_calendar_view?: 'day' | 'week' | 'month';
  items_per_page?: number;
  compact_mode?: boolean;
  high_contrast?: boolean;
  reduced_motion?: boolean;
}

// Organization Settings
export type DefaultReminderPolicy = '24h' | '1h' | '15m' | 'custom';

export interface OrganizationSettings {
  org_name: string;
  org_logo_url: string | null;
  default_timezone: string;
  default_reminder_policy: DefaultReminderPolicy;
  require_approval_for_events: boolean;
  allow_delegation: boolean;
  max_events_per_user: number;
  retention_days: number;
  custom_fields: Record<string, string>;
}

export interface OrganizationSettingsUpdate {
  org_name?: string;
  org_logo_url?: string | null;
  default_timezone?: string;
  default_reminder_policy?: DefaultReminderPolicy;
  require_approval_for_events?: boolean;
  allow_delegation?: boolean;
  max_events_per_user?: number;
  retention_days?: number;
  custom_fields?: Record<string, string>;
}

// Notification Preferences
export interface NotificationPreferences {
  event_created: boolean;
  event_updated: boolean;
  event_reminder: boolean;
  approval_requested: boolean;
  approval_processed: boolean;
  reminder_escalated: boolean;
  daily_digest: boolean;
  weekly_digest: boolean;
  urgent_only: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
}

// API Response types
export interface SettingsResponse {
  user_settings: UserSettings;
  org_settings: OrganizationSettings;
  notification_preferences: NotificationPreferences;
}

// Default values
export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'system',
  date_format: 'MM/DD/YYYY',
  time_format: '12h',
  timezone: 'UTC',
  language: 'en',
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false,
  notification_sound: true,
  desktop_notifications: true,
  default_calendar_view: 'week',
  items_per_page: 20,
  compact_mode: false,
  high_contrast: false,
  reduced_motion: false,
};

export const DEFAULT_ORG_SETTINGS: OrganizationSettings = {
  org_name: '',
  org_logo_url: null,
  default_timezone: 'UTC',
  default_reminder_policy: '24h',
  require_approval_for_events: false,
  allow_delegation: true,
  max_events_per_user: 100,
  retention_days: 365,
  custom_fields: {},
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  event_created: true,
  event_updated: true,
  event_reminder: true,
  approval_requested: true,
  approval_processed: true,
  reminder_escalated: true,
  daily_digest: false,
  weekly_digest: true,
  urgent_only: false,
  quiet_hours_start: null,
  quiet_hours_end: null,
};

// Available options
export const AVAILABLE_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Australia/Sydney',
];

export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ar', name: 'العربية' },
];
