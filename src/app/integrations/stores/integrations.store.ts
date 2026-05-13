/**
 * IntegrationsStore
 * Signal-based state management for the Integrations domain
 */

import { computed, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { IntegrationsService } from '../services/integrations.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import type {
  Integration,
  IntegrationCreate,
  IntegrationUpdate,
  IntegrationType,
  OAuthCallbackRequest,
} from '../models/integration.model';

interface IntegrationsState {
  integrations: Integration[];
  selectedIntegration: Integration | null;
  availableTypes: IntegrationType[];
  loading: boolean;
  oauthLoading: boolean;
  syncingIntegrationId: string | null;
  error: string | null;
}

const initialState: IntegrationsState = {
  integrations: [],
  selectedIntegration: null,
  availableTypes: ['google_calendar', 'outlook', 'zoom', 'teams', 'slack', 'webhook'],
  loading: false,
  oauthLoading: false,
  syncingIntegrationId: null,
  error: null,
};

export const IntegrationsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    // Connected integrations
    connectedIntegrations: computed(() =>
      store.integrations().filter((i) => i.status === 'connected')
    ),

    // Disconnected/error integrations
    disconnectedIntegrations: computed(() =>
      store.integrations().filter((i) => i.status === 'disconnected' || i.status === 'error')
    ),

    // Currently syncing
    isSyncing: computed(() => !!store.syncingIntegrationId()),

    // Calendar integrations
    calendarIntegrations: computed(() =>
      store.integrations().filter((i) => ['google_calendar', 'outlook'].includes(i.type))
    ),

    // Communication integrations
    communicationIntegrations: computed(() =>
      store.integrations().filter((i) => ['zoom', 'teams', 'slack'].includes(i.type))
    ),
  })),

  withMethods(
    (
      store,
      integrationsService = inject(IntegrationsService),
      toastService = inject(ToastService)
    ) => ({
      /**
       * Load all integrations
       */
      async loadIntegrations(): Promise<void> {
        patchState(store, { loading: true, error: null });

        try {
          const response = await lastValueFrom(integrationsService.listIntegrations());
          patchState(store, {
            integrations: response?.items ?? [],
            loading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load integrations';
          patchState(store, { error: message, loading: false });
        }
      },

      /**
       * Select an integration for detail view
       */
      selectIntegration(integration: Integration | null): void {
        patchState(store, { selectedIntegration: integration });
      },

      /**
       * Create a webhook integration
       */
      async createIntegration(payload: IntegrationCreate): Promise<boolean> {
        patchState(store, { loading: true, error: null });

        try {
          const integration = await lastValueFrom(
            integrationsService.createIntegration(payload)
          );

          patchState(store, {
            integrations: [integration, ...store.integrations()],
            loading: false,
          });

          toastService.success('Integration created successfully');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create integration';
          patchState(store, { error: message, loading: false });
          toastService.error(message);
          return false;
        }
      },

      /**
       * Update an integration
       */
      async updateIntegration(
        integrationId: string,
        payload: IntegrationUpdate
      ): Promise<boolean> {
        try {
          const updated = await lastValueFrom(
            integrationsService.updateIntegration(integrationId, payload)
          );

          patchState(store, {
            integrations: store
              .integrations()
              .map((i) => (i.id === integrationId ? updated : i)),
            selectedIntegration:
              store.selectedIntegration()?.id === integrationId
                ? updated
                : store.selectedIntegration(),
          });

          toastService.success('Integration updated');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update integration';
          toastService.error(message);
          return false;
        }
      },

      /**
       * Delete an integration
       */
      async deleteIntegration(integrationId: string): Promise<boolean> {
        try {
          await lastValueFrom(integrationsService.deleteIntegration(integrationId));

          patchState(store, {
            integrations: store.integrations().filter((i) => i.id !== integrationId),
            selectedIntegration:
              store.selectedIntegration()?.id === integrationId
                ? null
                : store.selectedIntegration(),
          });

          toastService.success('Integration deleted');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete integration';
          toastService.error(message);
          return false;
        }
      },

      /**
       * Start OAuth flow - get authorization URL
       */
      async initiateOAuth(integrationType: IntegrationType): Promise<string | null> {
        patchState(store, { oauthLoading: true, error: null });

        try {
          const response = await lastValueFrom(
            integrationsService.getOAuthUrl(integrationType)
          );

          patchState(store, { oauthLoading: false });
          return response.authorization_url;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to start OAuth';
          patchState(store, { oauthLoading: false, error: message });
          toastService.error(message);
          return null;
        }
      },

      /**
       * Complete OAuth flow with callback code
       */
      async completeOAuth(
        integrationType: IntegrationType,
        code: string,
        state: string
      ): Promise<boolean> {
        patchState(store, { oauthLoading: true, error: null });

        try {
          const integration = await lastValueFrom(
            integrationsService.completeOAuth(integrationType, { code, state })
          );

          patchState(store, {
            integrations: [integration, ...store.integrations()],
            oauthLoading: false,
          });

          toastService.success('Integration connected successfully');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to complete OAuth';
          patchState(store, { oauthLoading: false, error: message });
          toastService.error(message);
          return false;
        }
      },

      /**
       * Disconnect an integration
       */
      async disconnectIntegration(integrationId: string): Promise<boolean> {
        try {
          await lastValueFrom(integrationsService.disconnectIntegration(integrationId));

          // Update status locally
          const updated = store
            .integrations()
            .map((i) => (i.id === integrationId ? { ...i, status: 'disconnected' as const } : i));

          patchState(store, { integrations: updated });
          toastService.success('Integration disconnected');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to disconnect';
          toastService.error(message);
          return false;
        }
      },

      /**
       * Trigger manual sync
       */
      async syncIntegration(integrationId: string): Promise<boolean> {
        patchState(store, { syncingIntegrationId: integrationId });

        try {
          await lastValueFrom(integrationsService.syncIntegration(integrationId));

          // Refresh integration to get updated sync status
          const updated = await lastValueFrom(
            integrationsService.getIntegration(integrationId)
          );

          patchState(store, {
            integrations: store
              .integrations()
              .map((i) => (i.id === integrationId ? updated : i)),
            syncingIntegrationId: null,
          });

          toastService.success('Sync completed');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Sync failed';
          patchState(store, { syncingIntegrationId: null });
          toastService.error(message);
          return false;
        }
      },

      /**
       * Clear error state
       */
      clearError(): void {
        patchState(store, { error: null });
      },

      /**
       * Reset store state
       */
      reset(): void {
        patchState(store, initialState);
      },
    })
  )
);
