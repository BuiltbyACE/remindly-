/**
 * PageHeader Component
 * Standardized page titles with breadcrumbs, actions, and back navigation
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  routerLink?: string[];
}

@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="mb-6" [class]="customClass()">
      <!-- Breadcrumbs -->
      @if (breadcrumbs().length > 0) {
        <nav class="flex mb-2" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-2 text-sm">
            @for (crumb of breadcrumbs(); track crumb.label; let last = $last; let first = $first) {
              <li class="flex items-center">
                @if (!first) {
                  <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                }
                @if (!last && crumb.routerLink) {
                  <a [routerLink]="crumb.routerLink" class="text-gray-500 hover:text-gray-700">
                    {{ crumb.label }}
                  </a>
                } @else {
                  <span class="text-gray-900 font-medium" [class]="last ? 'font-medium' : ''">
                    {{ crumb.label }}
                  </span>
                }
              </li>
            }
          </ol>
        </nav>
      }

      <!-- Back Button + Title Row -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          @if (showBackButton() && backRouterLink()) {
            <a [routerLink]="backRouterLink()" 
               class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
               aria-label="Go back">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
          }
          
          <div>
            <h1 class="text-2xl font-bold text-gray-900" [class]="titleClass()">
              {{ title() }}
            </h1>
            @if (subtitle(); as sub) {
              <p class="mt-1 text-sm text-gray-500" [class]="subtitleClass()">
                {{ sub }}
              </p>
            }
          </div>
        </div>

        <!-- Actions Slot -->
        @if (hasActions()) {
          <div class="flex items-center gap-3">
            <ng-content select="[actions]"></ng-content>
          </div>
        }
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  /** Main page title */
  readonly title = input.required<string>();
  
  /** Optional subtitle/description */
  readonly subtitle = input<string>('');
  
  /** Breadcrumb trail */
  readonly breadcrumbs = input<BreadcrumbItem[]>([]);
  
  /** Show back button */
  readonly showBackButton = input<boolean>(false);
  
  /** Router link for back button */
  readonly backRouterLink = input<string[] | undefined>(undefined);
  
  /** Additional container CSS classes */
  readonly customClass = input<string>('');
  
  /** Title CSS classes override */
  readonly titleClass = input<string>('');
  
  /** Subtitle CSS classes override */
  readonly subtitleClass = input<string>('');

  /** Check if actions content is projected */
  protected hasActions(): boolean {
    // This will be true when content is projected via ng-content
    return true; // Always render the slot, ng-content handles empty case
  }
}
