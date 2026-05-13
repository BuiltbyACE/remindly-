/**
 * AiService
 * Handles all API communication for the AI/Briefings domain
 * Extends BaseApiClient for consistency
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';
import type {
  BriefingCreate,
  BriefingResponse,
  BriefingListResponse,
  SummaryCreate,
  SummaryResponse,
  MeetingSummaryCreate,
  VoiceParseRequest,
  ParsedVoiceIntent,
} from '../models/ai.model';

@Injectable({
  providedIn: 'root',
})
export class AiService extends BaseApiClient {
  /**
   * Generate a new briefing for an executive
   */
  generateBriefing(payload: BriefingCreate): Observable<BriefingResponse> {
    return this.post<BriefingResponse>('/api/v1/ai/briefings', payload);
  }

  /**
   * List all briefings for the organization
   */
  listBriefings(): Observable<BriefingListResponse> {
    return this.get<BriefingListResponse>('/api/v1/ai/briefings');
  }

  /**
   * Get a specific briefing by ID
   */
  getBriefing(briefingId: string): Observable<BriefingResponse> {
    return this.get<BriefingResponse>(`/api/v1/ai/briefings/${briefingId}`);
  }

  /**
   * Request a summary for an event
   */
  requestSummary(payload: SummaryCreate): Observable<SummaryResponse> {
    return this.post<SummaryResponse>('/api/v1/ai/summaries', payload);
  }

  /**
   * Get a specific summary by ID
   */
  getSummary(summaryId: string): Observable<SummaryResponse> {
    return this.get<SummaryResponse>(`/api/v1/ai/summaries/${summaryId}`);
  }

  /**
   * List all summaries for a specific event
   */
  listEventSummaries(eventId: string): Observable<SummaryResponse[]> {
    return this.get<SummaryResponse[]>(`/api/v1/ai/events/${eventId}/summaries`);
  }

  /**
   * Parse voice transcript into structured intent
   */
  parseVoiceTranscript(payload: VoiceParseRequest): Observable<ParsedVoiceIntent> {
    return this.post<ParsedVoiceIntent>('/api/v1/ai/parse-voice', payload);
  }

  /**
   * Generate meeting summary from notes
   */
  summarizeMeeting(payload: MeetingSummaryCreate): Observable<SummaryResponse> {
    return this.post<SummaryResponse>('/api/v1/ai/meeting-summaries', payload);
  }
}
