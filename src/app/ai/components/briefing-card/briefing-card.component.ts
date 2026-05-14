/**
 * BriefingCard Component
 * Displays the daily briefing content with sections for insights, events, and alerts
 */

import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import type { BriefingResponse } from '../../models/ai.model';

@Component({
  selector: 'app-briefing-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TitleCasePipe],
  template: `
    <div class="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
      <!-- Header -->
      <div class="p-6 border-b border-[var(--color-border)] bg-gradient-to-r from-blue-50 to-indigo-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg aria-hidden="true" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Daily Briefing</h2>
              @if (briefing(); as b) {
                <p class="text-sm text-gray-500">
                  Generated {{ b.generated_at | date:'short' }}
                </p>
              }
            </div>
          </div>
          
          <!-- Status Badge -->
          @if (briefing(); as b) {
            <span class="px-3 py-1 text-xs font-medium rounded-full"
                  [class.bg-green-100]="b.status === 'published'"
                  [class.text-green-800]="b.status === 'published'"
                  [class.bg-yellow-100]="b.status === 'draft'"
                  [class.text-yellow-800]="b.status === 'draft'">
              {{ b.status === 'published' ? 'Published' : 'Draft' }}
            </span>
          }
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        @if (content(); as c) {
          <!-- Summary -->
          @if (c.summary) {
            <div class="mb-6">
              <p class="text-base text-gray-900 leading-relaxed">{{ c.summary }}</p>
            </div>
          }

          <!-- Events -->
          @if (c.events.length > 0) {
            <div class="mb-6">
              <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Events ({{ c.event_count }})
              </h3>
              <div class="space-y-3">
                @for (event of c.events; track event.title) {
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center justify-between mb-1">
                      <p class="text-sm font-medium text-gray-900">{{ event.title }}</p>
                      <span class="text-xs text-gray-500">{{ event.time }}</span>
                    </div>
                    @if (event.brief_note) {
                      <p class="text-xs text-gray-600 mt-1">{{ event.brief_note }}</p>
                    }
                    <span class="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded"
                          [class.bg-red-100]="event.priority === 'high'"
                          [class.text-red-700]="event.priority === 'high'"
                          [class.bg-yellow-100]="event.priority === 'medium'"
                          [class.text-yellow-700]="event.priority === 'medium'"
                          [class.bg-green-100]="event.priority === 'low'"
                          [class.text-green-700]="event.priority === 'low'">
                      {{ event.priority | titlecase }} Priority
                    </span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Overlapping Events (Scheduling Conflicts) -->
          @if (c.overlapping_events.length > 0) {
            <div class="mb-6">
              <h3 class="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3">Scheduling Conflicts</h3>
              <div class="space-y-2">
                @for (conflict of c.overlapping_events; track conflict) {
                  <div class="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <svg aria-hidden="true" class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p class="text-sm text-red-800">{{ conflict }}</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Urgent Priorities -->
          @if (c.urgent_priorities.length > 0) {
            <div class="mb-6">
              <h3 class="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-3">Urgent Priorities</h3>
              <div class="space-y-2">
                @for (priority of c.urgent_priorities; track priority) {
                  <div class="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <svg aria-hidden="true" class="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-sm text-orange-800">{{ priority }}</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Recommendation -->
          @if (c.recommendation) {
            <div class="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h3 class="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-2">Recommendation</h3>
              <p class="text-sm text-blue-800">{{ c.recommendation }}</p>
            </div>
          }
        } @else {
          <div class="text-center py-8">
            <p class="text-gray-500">No briefing content available</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class BriefingCardComponent {
  readonly briefing = input<BriefingResponse | null>(null);
  
  protected content() {
    return this.briefing()?.content ?? null;
  }
}
