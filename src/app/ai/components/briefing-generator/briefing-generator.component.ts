/**
 * BriefingGenerator Component
 * Button and loading state for generating new briefings
 */

import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { AiStore } from '../../stores/ai.store';

@Component({
  selector: 'app-briefing-generator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <svg aria-hidden="true" class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-900">Generate Briefing</h3>
            <p class="text-xs text-gray-500">Create today's AI-powered daily briefing</p>
          </div>
        </div>

        <button
          type="button"
          (click)="generate()"
          [disabled]="aiStore.isGenerating() || aiStore.isLoading() || !executiveId()"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          @if (aiStore.isGenerating()) {
            <svg aria-hidden="true" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          } @else {
            <svg aria-hidden="true" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate
          }
        </button>
      </div>

      <!-- Error Message -->
      @if (aiStore.error(); as error) {
        <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      }
    </div>
  `,
})
export class BriefingGeneratorComponent {
  readonly aiStore = inject(AiStore);
  
  /** Executive ID to generate briefing for */
  readonly executiveId = input.required<string>();
  
  /** Optional callback when generation completes */
  readonly generated = output<void>();

  async generate(): Promise<void> {
    const success = await this.aiStore.generateBriefing(this.executiveId());
    if (success) {
      this.generated.emit();
    }
  }
}
