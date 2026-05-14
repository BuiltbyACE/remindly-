import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AiStore } from '../../ai/stores/ai.store';
import { AuthStore } from '../../auth/stores/auth.store';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import type { RiskAlert, ActionItem } from '../../ai/models/ai.model';

@Component({
  selector: 'app-ai-briefing-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SkeletonLoaderComponent],
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
        } @else if (briefingContent()) {
          <!-- Headline -->
          <p class="text-lg font-bold text-gray-900 mb-4">{{ briefingContent()!.headline }}</p>

          <!-- Key Insights -->
          @if (keyInsights().length > 0) {
            <div class="mb-4">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Key Insights</h3>
              <ul class="space-y-2">
                @for (insight of keyInsights(); track insight) {
                  <li class="flex items-start gap-2 text-sm text-gray-700">
                    <span class="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></span>
                    {{ insight }}
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Action Items -->
          @if (actionItems().length > 0) {
            <div class="mb-4">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Action Items</h3>
              <div class="space-y-2">
                @for (item of actionItems(); track item.description) {
                  <div class="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                    <div class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                         [class]="getPriorityDot(item.priority)"></div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-gray-700 truncate">{{ item.description }}</p>
                      @if (item.due_date) {
                        <p class="text-xs text-gray-400">Due: {{ formatDate(item.due_date) }}</p>
                      }
                    </div>
                    @if (item.source_event_id) {
                      <a [routerLink]="['/events', item.source_event_id]"
                         class="text-purple-600 hover:text-purple-800 text-xs font-medium flex-shrink-0">
                        View
                      </a>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <!-- Risk Alerts -->
          @if (riskAlerts().length > 0) {
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Risk Alerts</h3>
              <div class="space-y-2">
                @for (alert of riskAlerts(); track alert.description) {
                  <div class="flex items-start gap-2 p-2 rounded-lg"
                       [class]="getAlertBg(alert.severity)">
                    <svg aria-hidden="true" class="w-4 h-4 mt-0.5 flex-shrink-0"
                         [class]="getAlertIconColor(alert.severity)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900">{{ alert.description }}</p>
                      <p class="text-xs text-gray-500">{{ alert.type.replace('_', ' ') }}</p>
                    </div>
                    @if (alert.related_event_id) {
                      <a [routerLink]="['/events', alert.related_event_id]"
                         class="text-purple-600 hover:text-purple-800 text-xs font-medium flex-shrink-0">
                        View
                      </a>
                    }
                  </div>
                }
              </div>
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

  readonly keyInsights = computed(() => this.briefingContent()?.key_insights ?? []);

  readonly actionItems = computed<ActionItem[]>(() => this.briefingContent()?.action_items ?? []);

  readonly riskAlerts = computed<RiskAlert[]>(() => this.briefingContent()?.risk_alerts ?? []);

  async generateBriefing(): Promise<void> {
    const userId = this.authStore.user()?.id;
    if (userId) {
      await this.aiStore.generateBriefing(userId);
    }
  }

  getPriorityDot(priority: ActionItem['priority']): string {
    const colors: Record<string, string> = {
      high: 'bg-red-500',
      medium: 'bg-orange-400',
      low: 'bg-gray-400',
    };
    return colors[priority] ?? 'bg-gray-400';
  }

  getAlertBg(severity: RiskAlert['severity']): string {
    const colors: Record<string, string> = {
      critical: 'bg-red-50',
      high: 'bg-orange-50',
      medium: 'bg-yellow-50',
    };
    return colors[severity] ?? 'bg-gray-50';
  }

  getAlertIconColor(severity: RiskAlert['severity']): string {
    const colors: Record<string, string> = {
      critical: 'text-red-500',
      high: 'text-orange-500',
      medium: 'text-yellow-500',
    };
    return colors[severity] ?? 'text-gray-500';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
