import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { AiStore } from '../../ai/stores/ai.store';
import { AuthStore } from '../../auth/stores/auth.store';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-ai-briefing-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonLoaderComponent, TitleCasePipe],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <div class="p-5 border-b border-gray-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <svg aria-hidden="true" class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 class="text-base font-bold text-gray-900">AI Briefing</h2>
            <p class="text-xs text-gray-500">Prepared by your AI assistant</p>
          </div>
        </div>
        @if (!aiStore.hasTodayBriefing() && !aiStore.isGenerating()) {
          <button
            (click)="generateBriefing()"
            class="px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Generate
          </button>
        }
      </div>

      <div class="p-5">
        @if (aiStore.isGenerating()) {
          <div class="text-center py-6">
            <div class="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p class="text-sm text-gray-500">Generating your briefing...</p>
          </div>
        } @else if (aiStore.isLoading()) {
          <app-skeleton-loader variant="card" [count]="3" />
        } @else if (briefingContent(); as c) {
          <!-- Summary -->
          @if (c.summary) {
            <p class="text-sm text-gray-700 mb-4 leading-relaxed">{{ c.summary }}</p>
          }

          <!-- Events -->
          @if (c.events.length > 0) {
            <div class="mb-4">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Events ({{ c.event_count }})
              </h3>
              <div class="space-y-2">
                @for (event of c.events; track event.title) {
                  <div class="p-2 rounded-lg bg-gray-50">
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ event.title }}</p>
                      <span class="text-xs text-gray-500 flex-shrink-0 ml-2">{{ event.time }}</span>
                    </div>
                    @if (event.brief_note) {
                      <p class="text-xs text-gray-600 mt-0.5">{{ event.brief_note }}</p>
                    }
                    <span class="inline-block mt-1 px-1.5 py-0.5 text-xs font-medium rounded"
                          [class.bg-red-100]="event.priority === 'high'"
                          [class.text-red-700]="event.priority === 'high'"
                          [class.bg-yellow-100]="event.priority === 'medium'"
                          [class.text-yellow-700]="event.priority === 'medium'"
                          [class.bg-green-100]="event.priority === 'low'"
                          [class.text-green-700]="event.priority === 'low'">
                      {{ event.priority | titlecase }}
                    </span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Scheduling Conflicts -->
          @if (c.overlapping_events.length > 0) {
            <div class="mb-4">
              <h3 class="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">Scheduling Conflicts</h3>
              <div class="space-y-1">
                @for (conflict of c.overlapping_events; track conflict) {
                  <div class="flex items-start gap-1.5 text-sm text-red-700">
                    <span class="w-1 h-1 rounded-full bg-red-500 mt-2 flex-shrink-0"></span>
                    {{ conflict }}
                  </div>
                }
              </div>
            </div>
          }

          <!-- Urgent Priorities -->
          @if (c.urgent_priorities.length > 0) {
            <div class="mb-4">
              <h3 class="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-2">Urgent Priorities</h3>
              <div class="space-y-1">
                @for (priority of c.urgent_priorities; track priority) {
                  <div class="flex items-start gap-1.5 text-sm text-orange-700">
                    <span class="w-1 h-1 rounded-full bg-orange-500 mt-2 flex-shrink-0"></span>
                    {{ priority }}
                  </div>
                }
              </div>
            </div>
          }

          <!-- Recommendation -->
          @if (c.recommendation) {
            <div class="p-3 rounded-lg bg-purple-50 border border-purple-200">
              <p class="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">Recommendation</p>
              <p class="text-sm text-purple-800">{{ c.recommendation }}</p>
            </div>
          }
        } @else {
          <div class="text-center py-6">
            <div class="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-3">
              <svg aria-hidden="true" class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p class="text-sm text-gray-500">No briefing for today</p>
            <p class="text-xs text-gray-400 mt-1">Generate a briefing to get AI-powered insights about your day</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class AiBriefingCardComponent {
  readonly aiStore = inject(AiStore);
  readonly authStore = inject(AuthStore);

  readonly briefingContent = computed(() => this.aiStore.briefingContent());

  async generateBriefing(): Promise<void> {
    const userId = this.authStore.user()?.id;
    if (userId) {
      await this.aiStore.generateBriefing(userId);
    }
  }
}
