/**
 * VoiceStore
 * Signal-based state management for the Voice domain
 */

import { computed, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { VoiceService } from '../services/voice.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { WebSocketStore } from '../../websocket/websocket.store';
import type {
  VoiceCommandResponse,
  VoiceCommandCreate,
  CommandConfirmation,
  VoiceCommandRiskLevel,
  VoiceCommandStatus,
} from '../models/voice.model';

interface VoiceState {
  commands: VoiceCommandResponse[];
  selectedCommand: VoiceCommandResponse | null;
  isListening: boolean;
  isProcessing: boolean;
  showConfirmation: boolean;
  error: string | null;
  currentTranscript: string;
}

const initialState: VoiceState = {
  commands: [],
  selectedCommand: null,
  isListening: false,
  isProcessing: false,
  showConfirmation: false,
  error: null,
  currentTranscript: '',
};

export const VoiceStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withHooks({
    onInit(store) {
      const webSocketStore = inject(WebSocketStore);
      const toastService = inject(ToastService);

      // Subscribe to voice status changes via WebSocket
      const wsSubscription = webSocketStore
        .messagesOfType('voice.status_changed')
        .subscribe((message) => {
          const command = message.payload as VoiceCommandResponse;

          // Update command in the list
          const currentCommands = store.commands();
          const existingIndex = currentCommands.findIndex((c) => c.id === command.id);

          let updatedCommands: VoiceCommandResponse[];
          if (existingIndex >= 0) {
            updatedCommands = currentCommands.map((c) =>
              c.id === command.id ? command : c
            );
          } else {
            updatedCommands = [command, ...currentCommands];
          }

          // Check if this command needs confirmation
          const needsConfirmation =
            command.status === 'awaiting_confirmation' &&
            (command.risk_level === 'high' || command.risk_level === 'critical');

          patchState(store, {
            commands: updatedCommands,
            selectedCommand: command,
            showConfirmation: needsConfirmation,
            isProcessing: command.status === 'processing',
          });

          // Show toast for important status changes
          if (command.status === 'completed') {
            toastService.success('Voice command executed successfully');
          } else if (command.status === 'failed') {
            toastService.error('Voice command failed to execute');
          } else if (needsConfirmation) {
            toastService.info(`${command.risk_level} risk action requires confirmation`);
          }
        });

      return () => {
        wsSubscription.unsubscribe();
      };
    },
  }),

  withComputed((store) => ({
    // Filter commands by status
    pendingCommands: computed(() =>
      store.commands().filter((c) => c.status === 'pending' || c.status === 'processing')
    ),

    awaitingConfirmation: computed(() =>
      store.commands().filter((c) => c.status === 'awaiting_confirmation')
    ),

    completedCommands: computed(() =>
      store.commands().filter((c) => c.status === 'completed')
    ),

    failedCommands: computed(() =>
      store.commands().filter((c) => c.status === 'failed' || c.status === 'rejected')
    ),

    // Commands needing user confirmation (high/critical risk)
    requiresConfirmation: computed(() => {
      const selected = store.selectedCommand();
      if (!selected) return false;
      return (
        selected.status === 'awaiting_confirmation' &&
        (selected.risk_level === 'high' || selected.risk_level === 'critical')
      );
    }),

    // Current high/critical risk command for confirmation dialog
    confirmationCommand: computed(() => {
      const selected = store.selectedCommand();
      if (!selected) return null;
      if (
        selected.status === 'awaiting_confirmation' &&
        (selected.risk_level === 'high' || selected.risk_level === 'critical')
      ) {
        return selected;
      }
      return null;
    }),
  })),

  withMethods(
    (
      store,
      voiceService = inject(VoiceService),
      toastService = inject(ToastService)
    ) => ({
      /**
       * Load command history
       */
      async loadCommands(limit = 20): Promise<void> {
        try {
          const response = await lastValueFrom(voiceService.listCommands(limit));
          patchState(store, { commands: response?.items ?? [] });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load commands';
          toastService.error(message);
        }
      },

      /**
       * Start listening for voice input
       * In a real implementation, this would activate the Web Speech API
       */
      startListening(): void {
        patchState(store, {
          isListening: true,
          currentTranscript: '',
          error: null,
        });
        toastService.info('Listening... Speak now');
      },

      /**
       * Stop listening for voice input
       */
      stopListening(): void {
        patchState(store, { isListening: false });
      },

      /**
       * Update the current transcript from speech recognition
       */
      updateTranscript(transcript: string): void {
        patchState(store, { currentTranscript: transcript });
      },

      /**
       * Submit a voice command (from text transcript)
       */
      async submitCommand(
        commandText: string,
        source: 'microphone' | 'upload' = 'microphone'
      ): Promise<boolean> {
        patchState(store, { isProcessing: true, isListening: false, error: null });

        try {
          const command = await lastValueFrom(
            voiceService.createCommand({
              command_text: commandText,
              source,
            })
          );

          const needsConfirmation =
            command.status === 'awaiting_confirmation' &&
            (command.risk_level === 'high' || command.risk_level === 'critical');

          patchState(store, {
            commands: [command, ...store.commands()],
            selectedCommand: command,
            showConfirmation: needsConfirmation,
            isProcessing: false,
            currentTranscript: '',
          });

          if (needsConfirmation) {
            toastService.info('Command requires confirmation due to risk level');
          }

          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to submit command';
          patchState(store, { error: message, isProcessing: false });
          toastService.error(message);
          return false;
        }
      },

      /**
       * Confirm or reject a high/critical risk command
       */
      async confirmCommand(
        commandId: string,
        confirmed: boolean,
        modifications?: Record<string, unknown>
      ): Promise<boolean> {
        try {
          const command = await lastValueFrom(
            voiceService.confirmCommand(commandId, {
              confirmed,
              modifications,
            })
          );

          patchState(store, {
            commands: store.commands().map((c) => (c.id === commandId ? command : c)),
            selectedCommand: command,
            showConfirmation: false,
          });

          if (confirmed) {
            toastService.success('Command confirmed and executed');
          } else {
            toastService.info('Command rejected');
          }

          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to confirm command';
          toastService.error(message);
          return false;
        }
      },

      /**
       * Cancel a pending command
       */
      async cancelCommand(commandId: string): Promise<boolean> {
        try {
          const command = await lastValueFrom(voiceService.cancelCommand(commandId));

          patchState(store, {
            commands: store.commands().map((c) => (c.id === commandId ? command : c)),
            selectedCommand: null,
          });

          toastService.info('Command cancelled');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to cancel command';
          toastService.error(message);
          return false;
        }
      },

      /**
       * Select a command for detail view
       */
      selectCommand(command: VoiceCommandResponse | null): void {
        patchState(store, { selectedCommand: command });
      },

      /**
       * Dismiss the confirmation dialog
       */
      dismissConfirmation(): void {
        patchState(store, { showConfirmation: false });
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
