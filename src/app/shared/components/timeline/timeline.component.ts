/**
 * Timeline Component
 * Visual timeline for displaying chronological events/activities
 */

import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { DatePipe } from '@angular/common';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: string;
  iconColor?: string;
  iconBgColor?: string;
  status?: 'completed' | 'pending' | 'failed' | 'in-progress';
  metadata?: Record<string, string>;
}

@Component({
  selector: 'app-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <div class="flow-root">
      <ul role="list" class="-mb-8">
        @for (item of items(); track item.id; let last = $last; let first = $first) {
          <li class="relative pb-8">
            @if (!last) {
              <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
            }
            <div class="relative flex space-x-3">
              <!-- Icon/Status Circle -->
              <div class="flex-shrink-0">
                <div 
                  class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                  [class]="getIconBgClass(item)">
                  @if (item.icon) {
                    <svg aria-hidden="true" class="h-5 w-5" [class]="item.iconColor || 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon" />
                    </svg>
                  } @else {
                    <span class="h-2.5 w-2.5 rounded-full" [class]="getStatusDotClass(item.status)"></span>
                  }
                </div>
              </div>
              
              <!-- Content -->
              <div class="flex-1 min-w-0 py-1.5">
                <div class="text-sm text-gray-500">
                  <span class="font-medium text-gray-900">{{ item.title }}</span>
                  @if (item.description) {
                    <span class="ml-1">{{ item.description }}</span>
                  }
                </div>
                <time class="text-xs text-gray-400" [attr.datetime]="item.timestamp">
                  {{ item.timestamp | date:'MMM d, h:mm a' }}
                </time>
                
                <!-- Metadata -->
                @if (item.metadata) {
                  <dl class="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    @for (entry of getMetadataEntries(item.metadata); track entry[0]) {
                      <div class="flex gap-x-1">
                        <dt class="text-xs text-gray-500">{{ entry[0] }}:</dt>
                        <dd class="text-xs text-gray-700">{{ entry[1] }}</dd>
                      </div>
                    }
                  </dl>
                }
              </div>
            </div>
          </li>
        }
      </ul>
    </div>
  `,
})
export class TimelineComponent {
  /** Array of timeline items to display */
  readonly items = input.required<TimelineItem[]>();

  protected getIconBgClass(item: TimelineItem): string {
    if (item.iconBgColor) return item.iconBgColor;
    
    switch (item.status) {
      case 'completed':
        return 'bg-green-100';
      case 'pending':
        return 'bg-yellow-100';
      case 'failed':
        return 'bg-red-100';
      case 'in-progress':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  }

  protected getStatusDotClass(status?: TimelineItem['status']): string {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      case 'in-progress':
        return 'bg-blue-500 animate-pulse';
      default:
        return 'bg-gray-300';
    }
  }

  protected getMetadataEntries(metadata: Record<string, string>): [string, string][] {
    return Object.entries(metadata);
  }
}
