/**
 * VoiceService
 * Handles all API communication for the Voice domain
 * Extends BaseApiClient for consistency
 */

import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';
import type {
  VoiceCommandCreate,
  VoiceCommandResponse,
  VoiceCommandListResponse,
  CommandConfirmation,
  VoiceCommandRiskLevel,
} from '../models/voice.model';

function deriveRiskLevel(commandType: string): VoiceCommandRiskLevel {
  const riskMap: Record<string, VoiceCommandRiskLevel> = {
    cancel_event: 'high',
    escalate: 'critical',
    acknowledge_reminder: 'medium',
    reschedule_event: 'high',
    create_event: 'medium',
    query_events: 'low',
    summarize_event: 'low',
  };
  return riskMap[commandType] ?? 'low';
}

function fromApiCommand(data: unknown): VoiceCommandResponse {
  const item = data as Record<string, unknown>;
  return {
    id: String(item['id'] ?? ''),
    organization_id: String(item['organization_id'] ?? ''),
    user_id: String(item['user_id'] ?? ''),
    command_text: item['command_text'] ? String(item['command_text']) : null,
    command_type: (String(item['command_type'] ?? 'unknown')) as VoiceCommandResponse['command_type'],
    status: (String(item['status'] ?? 'pending')) as VoiceCommandResponse['status'],
    risk_level: deriveRiskLevel(String(item['command_type'] ?? '')),
    parsed_intent: item['intent_data'] ? (item['intent_data'] as Record<string, unknown>) : null,
    execution_result: item['execution_data'] ? (item['execution_data'] as Record<string, unknown>) : null,
    created_at: String(item['created_at'] ?? ''),
    updated_at: item['updated_at'] ? String(item['updated_at']) : String(item['created_at'] ?? ''),
  };
}

function fromApiListResponse(data: unknown): VoiceCommandListResponse {
  const response = data as Record<string, unknown>;
  const items = Array.isArray(response['commands'])
    ? response['commands'].map(fromApiCommand)
    : Array.isArray(response['items'])
      ? response['items'].map(fromApiCommand)
      : [];
  return {
    items,
    total: Number(response['total'] ?? items.length),
  };
}

@Injectable({
  providedIn: 'root',
})
export class VoiceService extends BaseApiClient {
  /**
   * Create a new voice command (from text or audio)
   */
  createCommand(payload: VoiceCommandCreate): Observable<VoiceCommandResponse> {
    return this.post<unknown>('/api/v1/voice/commands', payload)
      .pipe(map(data => fromApiCommand(data)));
  }

  /**
   * List all voice commands for the organization
   */
  listCommands(limit = 20, offset = 0): Observable<VoiceCommandListResponse> {
    return this.get<unknown>('/api/v1/voice/commands', { limit, offset })
      .pipe(map(data => fromApiListResponse(data)));
  }

  /**
   * Get a specific voice command by ID
   */
  getCommand(commandId: string): Observable<VoiceCommandResponse> {
    return this.get<unknown>(`/api/v1/voice/commands/${commandId}`)
      .pipe(map(data => fromApiCommand(data)));
  }

  /**
   * Confirm or reject a voice command that requires confirmation
   */
  confirmCommand(
    commandId: string,
    payload: CommandConfirmation
  ): Observable<VoiceCommandResponse> {
    return this.post<unknown>(
      `/api/v1/voice/commands/${commandId}/confirm`,
      payload
    ).pipe(map(data => fromApiCommand(data)));
  }

  /**
   * Cancel a pending voice command
   */
  cancelCommand(commandId: string): Observable<VoiceCommandResponse> {
    return this.post<unknown>(
      `/api/v1/voice/commands/${commandId}/cancel`,
      {}
    ).pipe(map(data => fromApiCommand(data)));
  }
}
