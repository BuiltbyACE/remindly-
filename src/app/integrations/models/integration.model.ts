/**
 * Integration Domain Models
 * Types for OAuth integrations, sync status, and external services
 */

export type IntegrationType = 'google_calendar' | 'outlook' | 'zoom' | 'teams' | 'slack' | 'webhook';
export type IntegrationStatus = 'connected' | 'disconnected' | 'syncing' | 'error';
export type SyncDirection = 'inbound' | 'outbound' | 'bidirectional';

export interface Integration {
  id: string;
  organization_id: string;
  type: IntegrationType;
  name: string;
  status: IntegrationStatus;
  config: IntegrationConfig;
  last_sync_at?: string;
  last_sync_error?: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationConfig {
  client_id?: string;
  scopes?: string[];
  webhook_url?: string;
  sync_direction?: SyncDirection;
  auto_sync?: boolean;
  sync_interval_minutes?: number;
  custom_settings?: Record<string, unknown>;
}

export interface IntegrationCreate {
  type: IntegrationType;
  name: string;
  config?: IntegrationConfig;
}

export interface IntegrationUpdate {
  name?: string;
  config?: Partial<IntegrationConfig>;
}

export interface OAuthUrlResponse {
  authorization_url: string;
  state: string;
}

export interface OAuthCallbackRequest {
  code: string;
  state: string;
}

export interface SyncStatus {
  is_syncing: boolean;
  last_sync_at?: string;
  next_sync_at?: string;
  items_synced?: number;
  items_failed?: number;
  error_message?: string;
}

export interface IntegrationListResponse {
  items: Integration[];
  total: number;
}

// Integration type metadata
export interface IntegrationTypeInfo {
  type: IntegrationType;
  name: string;
  description: string;
  icon: string;
  category: 'calendar' | 'communication' | 'automation';
  supports_oauth: boolean;
  supports_webhook: boolean;
}

export const INTEGRATION_TYPES: IntegrationTypeInfo[] = [
  {
    type: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sync events with Google Calendar',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    category: 'calendar',
    supports_oauth: true,
    supports_webhook: true,
  },
  {
    type: 'outlook',
    name: 'Microsoft Outlook',
    description: 'Sync events with Outlook Calendar',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    category: 'calendar',
    supports_oauth: true,
    supports_webhook: false,
  },
  {
    type: 'zoom',
    name: 'Zoom',
    description: 'Auto-create Zoom meetings for events',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    category: 'communication',
    supports_oauth: true,
    supports_webhook: false,
  },
  {
    type: 'teams',
    name: 'Microsoft Teams',
    description: 'Create Teams meetings and channels',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    category: 'communication',
    supports_oauth: true,
    supports_webhook: false,
  },
  {
    type: 'slack',
    name: 'Slack',
    description: 'Send notifications to Slack channels',
    icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    category: 'communication',
    supports_oauth: true,
    supports_webhook: true,
  },
  {
    type: 'webhook',
    name: 'Custom Webhook',
    description: 'Send events to custom HTTP endpoints',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    category: 'automation',
    supports_oauth: false,
    supports_webhook: true,
  },
];

export const INTEGRATION_STATUS_LABELS: Record<IntegrationStatus, string> = {
  connected: 'Connected',
  disconnected: 'Disconnected',
  syncing: 'Syncing...',
  error: 'Error',
};

export const INTEGRATION_STATUS_COLORS: Record<IntegrationStatus, string> = {
  connected: 'bg-green-100 text-green-800 border-green-200',
  disconnected: 'bg-gray-100 text-gray-800 border-gray-200',
  syncing: 'bg-blue-100 text-blue-800 border-blue-200',
  error: 'bg-red-100 text-red-800 border-red-200',
};
