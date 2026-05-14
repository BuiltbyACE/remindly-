/**
 * AiStore
 * Signal-based state management for the AI/Briefings domain
 */

import { computed, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { AiService } from '../services/ai.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { WebSocketStore } from '../../websocket/websocket.store';
import type { BriefingResponse, SummaryResponse } from '../models/ai.model';

interface AiState {
  briefings: BriefingResponse[];
  todayBriefing: BriefingResponse | null;
  summaries: SummaryResponse[];
  isGenerating: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AiState = {
  briefings: [],
  todayBriefing: null,
  summaries: [],
  isGenerating: false,
  isLoading: false,
  error: null,
};

export const AiStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withHooks({
    onInit(store) {
      const webSocketStore = inject(WebSocketStore);
      const toastService = inject(ToastService);

      // Subscribe to briefing WebSocket messages
      const wsSubscription = webSocketStore
        .messagesOfType('briefing.ready')
        .subscribe((message) => {
          const briefing = message.payload as BriefingResponse;
          
          // Update in the list
          const currentBriefings = store.briefings();
          const existingIndex = currentBriefings.findIndex(b => b.id === briefing.id);
          
          let updatedBriefings: BriefingResponse[];
          if (existingIndex >= 0) {
            updatedBriefings = currentBriefings.map(b =>
              b.id === briefing.id ? briefing : b
            );
          } else {
            updatedBriefings = [briefing, ...currentBriefings];
          }

          // Check if this is today's briefing
          const today = new Date().toISOString().split('T')[0];
          const isTodayBriefing = briefing.briefing_date === today;

          patchState(store, {
            briefings: updatedBriefings,
            todayBriefing: isTodayBriefing ? briefing : store.todayBriefing(),
            isGenerating: isTodayBriefing ? false : store.isGenerating(),
          });

          if (isTodayBriefing) {
            toastService.success('Your daily briefing is ready');
          }
        });

      return () => {
        wsSubscription.unsubscribe();
      };
    },
  }),

  withComputed((store) => ({
    hasTodayBriefing: computed(() => !!store.todayBriefing()),
    
    briefingContent: computed(() => store.todayBriefing()?.content ?? null),
    
    publishedBriefings: computed(() =>
      store.briefings().filter(b => b.status === 'published')
    ),
    
    draftBriefings: computed(() =>
      store.briefings().filter(b => b.status === 'draft')
    ),
  })),

  withMethods(
    (store, aiService = inject(AiService), toastService = inject(ToastService)) => ({
      /**
       * Load today's briefing
       */
      async loadTodayBriefing(): Promise<void> {
        patchState(store, { isLoading: true, error: null });

        try {
          const list = await lastValueFrom(aiService.listBriefings());
          const today = new Date().toISOString().split('T')[0];
          const todayBriefing = list.briefings.find(b => b.briefing_date === today) ?? null;

          patchState(store, {
            briefings: list.briefings,
            todayBriefing,
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load briefing';
          patchState(store, { error: message, isLoading: false });
        }
      },

      /**
       * Load all briefings
       */
      async loadBriefings(): Promise<void> {
        patchState(store, { isLoading: true, error: null });

        try {
          const list = await lastValueFrom(aiService.listBriefings());
          patchState(store, {
            briefings: list.briefings,
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load briefings';
          patchState(store, { error: message, isLoading: false });
        }
      },

      /**
       * Generate a new briefing for today
       */
      async generateBriefing(executiveId: string): Promise<boolean> {
        patchState(store, { isGenerating: true, error: null });

        try {
          const today = new Date().toISOString().split('T')[0];
          const briefing = await lastValueFrom(
            aiService.generateBriefing({
              briefing_date: today,
              executive_id: executiveId,
            })
          );

          patchState(store, {
            todayBriefing: briefing,
            briefings: [briefing, ...store.briefings()],
            isGenerating: false,
          });

          toastService.success('Briefing generation started');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to generate briefing';
          patchState(store, { error: message, isGenerating: false });
          toastService.error(message);
          return false;
        }
      },

      /**
       * Request a summary for an event
       */
      async requestSummary(eventId: string, summaryType: SummaryResponse['summary_type']): Promise<boolean> {
        try {
          const summary = await lastValueFrom(
            aiService.requestSummary({
              event_id: eventId,
              summary_type: summaryType,
            })
          );

          patchState(store, {
            summaries: [summary, ...store.summaries()],
          });

          toastService.success('Summary generation requested');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to request summary';
          toastService.error(message);
          return false;
        }
      },

      /**
       * Load summaries for an event
       */
      async loadEventSummaries(eventId: string): Promise<void> {
        try {
          const summaries = await lastValueFrom(
            aiService.listEventSummaries(eventId)
          );

          patchState(store, { summaries });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load summaries';
          toastService.error(message);
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
