/**
 * Voice Domain Models
 * Types for voice commands, recognition, and processing
 */

export type VoiceCommandStatus =
  | 'pending'
  | 'processing'
  | 'awaiting_confirmation'
  | 'completed'
  | 'failed'
  | 'rejected';

export type VoiceCommandType =
  | 'create_event'
  | 'reschedule_event'
  | 'cancel_event'
  | 'query_events'
  | 'acknowledge_reminder'
  | 'escalate'
  | 'summarize_event'
  | 'unknown';

export type VoiceCommandSource = 'microphone' | 'telephony' | 'upload';
export type VoiceCommandRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface VoiceCommandCreate {
  command_text?: string | null;
  source?: VoiceCommandSource | null;
  audio_data?: string | null; // Base64 encoded audio for upload source
}

export interface CommandConfirmation {
  confirmed: boolean;
  modifications?: Record<string, unknown> | null;
}

export interface VoiceCommandResponse {
  id: string;
  organization_id: string;
  user_id: string;
  command_text: string | null;
  command_type: VoiceCommandType;
  status: VoiceCommandStatus;
  risk_level: VoiceCommandRiskLevel;
  parsed_intent: Record<string, unknown> | null;
  execution_result: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface VoiceCommandListResponse {
  items: VoiceCommandResponse[];
  total: number;
}

export interface VoiceTranscript {
  id: string;
  command_id: string;
  transcript: string;
  confidence: number;
  language: string;
  created_at: string;
}

// Status helpers
export const VOICE_STATUS_LABELS: Record<VoiceCommandStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  awaiting_confirmation: 'Awaiting Confirmation',
  completed: 'Completed',
  failed: 'Failed',
  rejected: 'Rejected',
};

export const VOICE_STATUS_COLORS: Record<VoiceCommandStatus, string> = {
  pending: 'bg-gray-100 text-gray-800',
  processing: 'bg-blue-100 text-blue-800',
  awaiting_confirmation: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  rejected: 'bg-orange-100 text-orange-800',
};

// Risk level helpers
export const RISK_LEVEL_LABELS: Record<VoiceCommandRiskLevel, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  critical: 'Critical Risk',
};

export const RISK_LEVEL_COLORS: Record<VoiceCommandRiskLevel, { bg: string; border: string; text: string }> = {
  low: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
  medium: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-700' },
  high: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700' },
  critical: { bg: 'bg-red-50', border: 'border-red-600', text: 'text-red-700' },
};

// Command type labels
export const COMMAND_TYPE_LABELS: Record<VoiceCommandType, string> = {
  create_event: 'Create Event',
  reschedule_event: 'Reschedule Event',
  cancel_event: 'Cancel Event',
  query_events: 'Query Events',
  acknowledge_reminder: 'Acknowledge Reminder',
  escalate: 'Escalate',
  summarize_event: 'Summarize Event',
  unknown: 'Unknown Command',
};
