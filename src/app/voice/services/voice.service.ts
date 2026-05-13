/**
 * VoiceService
 * Handles all API communication for the Voice domain
 * Extends BaseApiClient for consistency
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';
import type {
  VoiceCommandCreate,
  VoiceCommandResponse,
  VoiceCommandListResponse,
  CommandConfirmation,
} from '../models/voice.model';

@Injectable({
  providedIn: 'root',
})
export class VoiceService extends BaseApiClient {
  /**
   * Create a new voice command (from text or audio)
   */
  createCommand(payload: VoiceCommandCreate): Observable<VoiceCommandResponse> {
    return this.post<VoiceCommandResponse>('/api/v1/voice/commands', payload);
  }

  /**
   * List all voice commands for the organization
   */
  listCommands(limit = 20, offset = 0): Observable<VoiceCommandListResponse> {
    return this.get<VoiceCommandListResponse>('/api/v1/voice/commands', { limit, offset });
  }

  /**
   * Get a specific voice command by ID
   */
  getCommand(commandId: string): Observable<VoiceCommandResponse> {
    return this.get<VoiceCommandResponse>(`/api/v1/voice/commands/${commandId}`);
  }

  /**
   * Confirm or reject a voice command that requires confirmation
   */
  confirmCommand(
    commandId: string,
    payload: CommandConfirmation
  ): Observable<VoiceCommandResponse> {
    return this.post<VoiceCommandResponse>(
      `/api/v1/voice/commands/${commandId}/confirm`,
      payload
    );
  }

  /**
   * Cancel a pending voice command
   */
  cancelCommand(commandId: string): Observable<VoiceCommandResponse> {
    return this.post<VoiceCommandResponse>(
      `/api/v1/voice/commands/${commandId}/cancel`,
      {}
    );
  }
}
