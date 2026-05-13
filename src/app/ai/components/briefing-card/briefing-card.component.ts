/**
 * BriefingCard Component
 * Displays the daily briefing content with sections for insights, events, and alerts
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import type { BriefingResponse, BriefingContent } from '../../models/ai.model';

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
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <!-- Headline -->
          <div class="mb-6">
            <p class="text-xl font-medium text-gray-900">{{ c.headline }}</p>
          </div>

          <!-- Key Insights -->
          @if (c.key_insights.length > 0) {
            <div class="mb-6">
              <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Key Insights</h3>
              <ul class="space-y-2">
                @for (insight of c.key_insights; track insight) {
                  <li class="flex items-start gap-2">
                    <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-sm text-gray-600">{{ insight }}</span>
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Upcoming Events -->
          @if (c.upcoming_events.length > 0) {
            <div class="mb-6">
              <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Upcoming Events</h3>
              <div class="space-y-3">
                @for (event of c.upcoming_events; track event.event_id) {
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ event.title }}</p>
                      <p class="text-xs text-gray-500">
                        {{ event.scheduled_time | date:'short' }}
                        @if (event.location) {
                          • {{ event.location }}
                        }
                      </p>
                    </div>
                    <span class="px-2 py-1 text-xs font-medium rounded"
                          [class.bg-green-100]="event.preparation_status === 'ready'"
                          [class.text-green-700]="event.preparation_status === 'ready'"
                          [class.bg-yellow-100]="event.preparation_status === 'needs_attention'"
                          [class.text-yellow-700]="event.preparation_status === 'needs_attention'"
                          [class.bg-red-100]="event.preparation_status === 'urgent'"
                          [class.text-red-700]="event.preparation_status === 'urgent'">
                      {{ event.preparation_status === 'ready' ? 'Ready' : 
                         event.preparation_status === 'needs_attention' ? 'Needs Attention' : 'Urgent' }}
                    </span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Action Items -->
          @if (c.action_items.length > 0) {
            <div class="mb-6">
              <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Action Items</h3>
              <div class="space-y-2">
                @for (item of c.action_items; track $index) {
                  <div class="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <input type="checkbox" class="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                    <div class="flex-1">
                      <p class="text-sm text-gray-700">{{ item.description }}</p>
                      @if (item.due_date) {
                        <p class="text-xs text-gray-500">Due {{ item.due_date | date:'short' }}</p>
                      }
                    </div>
                    <span class="px-2 py-0.5 text-xs font-medium rounded"
                          [class.bg-red-100]="item.priority === 'high'"
                          [class.text-red-700]="item.priority === 'high'"
                          [class.bg-yellow-100]="item.priority === 'medium'"
                          [class.text-yellow-700]="item.priority === 'medium'"
                          [class.bg-gray-100]="item.priority === 'low'"
                          [class.text-gray-700]="item.priority === 'low'">
                      {{ item.priority | titlecase }}
                    </span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Risk Alerts -->
          @if (c.risk_alerts.length > 0) {
            <div>
              <h3 class="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3">Risk Alerts</h3>
              <div class="space-y-2">
                @for (alert of c.risk_alerts; track $index) {
                  <div class="flex items-start gap-2 p-3 rounded-lg"
                       [class.bg-red-50]="alert.severity === 'critical'"
                       [class.border]="alert.severity === 'critical'"
                       [class.border-red-200]="alert.severity === 'critical'"
                       [class.bg-orange-50]="alert.severity === 'high'"
                       [class.bg-yellow-50]="alert.severity === 'medium'">
                    <svg class="w-5 h-5 flex-shrink-0 mt-0.5"
                         [class.text-red-500]="alert.severity === 'critical'"
                         [class.text-orange-500]="alert.severity === 'high'"
                         [class.text-yellow-500]="alert.severity === 'medium'"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900">{{ alert.description }}</p>
                      <p class="text-xs text-gray-500 mt-0.5">{{ alert.type | titlecase }}</p>
                    </div>
                  </div>
                }
              </div>
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
