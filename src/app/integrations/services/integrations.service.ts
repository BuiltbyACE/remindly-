/**
 * IntegrationsService
 * Handles all API communication for the Integrations domain
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';
import type {
  Integration,
  IntegrationCreate,
  IntegrationUpdate,
  IntegrationListResponse,
  OAuthUrlResponse,
  OAuthCallbackRequest,
  SyncStatus,
} from '../models/integration.model';

@Injectable({
  providedIn: 'root',
})
export class IntegrationsService extends BaseApiClient {
  /**
   * List all integrations for the organization
   */
  listIntegrations(): Observable<IntegrationListResponse> {
    return this.get<IntegrationListResponse>('/api/v1/integrations');
  }

  /**
   * Get a specific integration by ID
   */
  getIntegration(integrationId: string): Observable<Integration> {
    return this.get<Integration>(`/api/v1/integrations/${integrationId}`);
  }

  /**
   * Create a new integration (for webhook types)
   */
  createIntegration(payload: IntegrationCreate): Observable<Integration> {
    return this.post<Integration>('/api/v1/integrations', payload);
  }

  /**
   * Update an integration
   */
  updateIntegration(
    integrationId: string,
    payload: IntegrationUpdate
  ): Observable<Integration> {
    return this.patch<Integration>(`/api/v1/integrations/${integrationId}`, payload);
  }

  /**
   * Delete an integration
   */
  deleteIntegration(integrationId: string): Observable<void> {
    return this.delete<void>(`/api/v1/integrations/${integrationId}`);
  }

  /**
   * Get OAuth authorization URL
   */
  getOAuthUrl(integrationType: string): Observable<OAuthUrlResponse> {
    return this.get<OAuthUrlResponse>(`/api/v1/integrations/oauth/${integrationType}`);
  }

  /**
   * Complete OAuth flow with callback code
   */
  completeOAuth(
    integrationType: string,
    payload: OAuthCallbackRequest
  ): Observable<Integration> {
    return this.post<Integration>(`/api/v1/integrations/oauth/${integrationType}/callback`, payload);
  }

  /**
   * Trigger manual sync for an integration
   */
  syncIntegration(integrationId: string): Observable<SyncStatus> {
    return this.post<SyncStatus>(`/api/v1/integrations/${integrationId}/sync`, {});
  }

  /**
   * Get sync status for an integration
   */
  getSyncStatus(integrationId: string): Observable<SyncStatus> {
    return this.get<SyncStatus>(`/api/v1/integrations/${integrationId}/sync-status`);
  }

  /**
   * Disconnect an integration (revoke OAuth)
   */
  disconnectIntegration(integrationId: string): Observable<void> {
    return this.post<void>(`/api/v1/integrations/${integrationId}/disconnect`, {});
  }
}
