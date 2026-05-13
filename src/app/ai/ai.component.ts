/**
 * AI Component
 * Displays AI-generated daily briefings and provides generation controls
 */

import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AiStore } from './stores/ai.store';
import { AuthService } from '../auth/services/auth.service';
import { BriefingCardComponent } from './components/briefing-card/briefing-card.component';
import { BriefingGeneratorComponent } from './components/briefing-generator/briefing-generator.component';
import { SkeletonLoaderComponent } from '../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-ai',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    BriefingCardComponent,
    BriefingGeneratorComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-[var(--color-text-primary)]">AI Briefing</h1>
      </div>

      <!-- Loading State -->
      @if (aiStore.isLoading()) {
        <app-skeleton-loader variant="card" />
      }

      <!-- Error State -->
      @if (aiStore.error(); as error) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-4">
          <p class="text-sm text-red-700">{{ error }}</p>
          <button
            type="button"
            (click)="reload()"
            class="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      }

      <!-- Briefing Generator (always show if no error) -->
      @if (!aiStore.error() && !aiStore.isLoading()) {
        <app-briefing-generator
          [executiveId]="currentUserId()"
          (generated)="onBriefingGenerated()"
        />
      }

      <!-- Today's Briefing -->
      @if (!aiStore.isLoading()) {
        @if (aiStore.todayBriefing(); as briefing) {
          <app-briefing-card [briefing]="briefing" />
        } @else {
          <app-empty-state
            icon="document"
            title="No briefing yet"
            description="Generate your daily AI-powered briefing to see insights, upcoming events, and action items."
            iconVariant="primary"
          />
        }
      }

      <!-- Past Briefings List -->
      @if (aiStore.publishedBriefings().length > 1) {
        <div class="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Past Briefings</h2>
          <div class="space-y-2">
            @for (briefing of aiStore.publishedBriefings().slice(1, 5); track briefing.id) {
              <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ briefing.briefing_date }}</p>
                  @if (briefing.content?.headline; as headline) {
                    <p class="text-xs text-gray-500 truncate max-w-md">{{ headline }}</p>
                  }
                </div>
                <span class="text-xs text-gray-400">
                  {{ briefing.created_at | date:'short' }}
                </span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class AiComponent implements OnInit {
  readonly aiStore = inject(AiStore);
  readonly authService = inject(AuthService);

  readonly currentUserId = () => {
    // Get user ID from auth service - for now return placeholder
    // In production, this should come from the authenticated user
    return 'current-user';
  };

  ngOnInit(): void {
    this.aiStore.loadTodayBriefing();
  }

  reload(): void {
    this.aiStore.clearError();
    this.aiStore.loadTodayBriefing();
  }

  onBriefingGenerated(): void {
    // Briefing is loading, will update via WebSocket or polling
  }
}

