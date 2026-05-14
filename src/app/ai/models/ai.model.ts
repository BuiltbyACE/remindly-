/**
 * AI Domain Models
 * Types for Briefings, Summaries, and AI-generated content
 */

// Briefing Types
export type BriefingStatus = 'draft' | 'published';

export interface BriefingCreate {
  briefing_date: string;   // YYYY-MM-DD
  executive_id: string;    // UUID
}

export interface BriefingResponse {
  id: string;
  organization_id: string;
  executive_id: string;
  briefing_date: string;
  content: BriefingContent | null;
  status: BriefingStatus;
  model_used: string | null;
  tokens_used: number | null;
  generated_at: string | null;
  error_log: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface BriefingContent {
  summary: string;
  event_count: number;
  events: BriefingEvent[];
  overlapping_events: string[];
  urgent_priorities: string[];
  recommendation: string;
}

export interface BriefingEvent {
  title: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  brief_note: string;
}

export interface BriefingListResponse {
  briefings: BriefingResponse[];
}

// Summary Types
export type SummaryType = 'executive' | 'detailed' | 'action_items' | 'key_decisions' | 'attendee_notes';
export type SummaryStatus = 'pending' | 'generating' | 'completed' | 'failed';

export interface SummaryCreate {
  event_id: string;
  summary_type: SummaryType;
}

export interface SummaryResponse {
  id: string;
  event_id: string;
  summary_type: SummaryType;
  status: SummaryStatus;
  content: Record<string, unknown> | null;
  created_at: string;
}

export interface MeetingSummaryCreate {
  event_id: string;
  notes: string;
}

// Voice Parsing
export interface VoiceParseRequest {
  transcript: string;
}

export interface ParsedVoiceIntent {
  title: string | null;
  date: string | null;
  start_time: string | null;
  venue: string | null;
  participants: string[];
  priority: string | null;
  confidence: number;
}

// Status helpers
export const BRIEFING_STATUS_LABELS: Record<BriefingStatus, string> = {
  draft: 'Draft',
  published: 'Published',
};

export const SUMMARY_STATUS_LABELS: Record<SummaryStatus, string> = {
  pending: 'Pending',
  generating: 'Generating...',
  completed: 'Completed',
  failed: 'Failed',
};

export const SUMMARY_TYPE_LABELS: Record<SummaryType, string> = {
  executive: 'Executive Summary',
  detailed: 'Detailed Summary',
  action_items: 'Action Items',
  key_decisions: 'Key Decisions',
  attendee_notes: 'Attendee Notes',
};
