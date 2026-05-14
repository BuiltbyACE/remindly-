/**
 * SkeletonLoader Component
 * Provides consistent loading placeholders across the application
 * Supports multiple variants: text, circle, rectangle, card, list
 */

import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export type SkeletonVariant = 'text' | 'circle' | 'rectangle' | 'card' | 'list' | 'stat';

@Component({
  selector: 'app-skeleton-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div role="status" aria-label="Loading content">
      @switch (variant()) {
        @case ('text') {
          <div class="motion-safe:animate-pulse motion-reduce:opacity-75">
            <div class="h-4 bg-gray-200 rounded w-3/4" [class]="customClass()"></div>
          </div>
        }
        @case ('circle') {
          <div class="motion-safe:animate-pulse motion-reduce:opacity-75">
            <div class="rounded-full bg-gray-200" 
                 [class]="'w-' + size() + ' h-' + size() + ' ' + customClass()"
                 [style.width.px]="sizeInPx()"
                 [style.height.px]="sizeInPx()">
            </div>
          </div>
        }
        @case ('rectangle') {
          <div class="motion-safe:animate-pulse motion-reduce:opacity-75">
            <div class="bg-gray-200 rounded" 
                 [class]="customClass()"
                 [style.width.px]="width()"
                 [style.height.px]="height()">
            </div>
          </div>
        }
        @case ('card') {
          <div class="motion-safe:animate-pulse motion-reduce:opacity-75 bg-white rounded-xl p-5 border border-gray-100" [class]="customClass()">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-lg bg-gray-200"></div>
              <div class="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div class="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        }
        @case ('stat') {
          <div class="motion-safe:animate-pulse motion-reduce:opacity-75 bg-white rounded-xl p-5 border border-gray-100" [class]="customClass()">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-lg bg-gray-200"></div>
              <div class="h-4 bg-gray-200 rounded w-28"></div>
            </div>
            <div class="h-8 bg-gray-200 rounded w-12 mb-1"></div>
            <div class="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        }
        @case ('list') {
          <div class="motion-safe:animate-pulse motion-reduce:opacity-75 space-y-3" [class]="customClass()">
            @for (i of repeatArray(); track i) {
              <div class="flex gap-4 p-3 border border-gray-100 rounded-lg">
                <div class="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            }
          </div>
        }
        @default {
          <div class="motion-safe:animate-pulse motion-reduce:opacity-75">
            <div class="h-4 bg-gray-200 rounded w-full" [class]="customClass()"></div>
          </div>
        }
      }
    </div>
  `,
})
export class SkeletonLoaderComponent {
  /** Skeleton variant determines the layout */
  readonly variant = input<SkeletonVariant>('text');
  
  /** Number of items to show for list variant */
  readonly count = input<number>(3);
  
  /** Size for circle variant (Tailwind spacing scale: 8, 10, 12, etc.) */
  readonly size = input<number>(10);
  
  /** Size in pixels for circle when exact size needed */
  readonly sizeInPx = input<number>();
  
  /** Width in pixels for rectangle variant */
  readonly width = input<number>(200);
  
  /** Height in pixels for rectangle variant */
  readonly height = input<number>(100);
  
  /** Additional CSS classes */
  readonly customClass = input<string>('');

  protected repeatArray(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i);
  }
}
