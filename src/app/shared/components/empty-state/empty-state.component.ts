/**
 * EmptyState Component
 * Consistent zero-state UX for lists, dashboards, and detail views
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

export type EmptyIcon = 
  | 'inbox' 
  | 'search' 
  | 'calendar' 
  | 'bell' 
  | 'check' 
  | 'folder' 
  | 'document' 
  | 'microphone'
  | 'chart'
  | 'users'
  | 'settings'
  | 'clock';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="text-center py-12" [class]="customClass()">
      <!-- Icon -->
      <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4"
           [class]="iconBgClass()">
        <svg aria-hidden="true" class="w-6 h-6" [class]="iconColorClass()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="iconPath()" />
        </svg>
      </div>

      <!-- Title -->
      <h3 class="text-sm font-medium text-gray-900" [class]="titleClass()">
        {{ title() }}
      </h3>

      <!-- Description -->
      @if (description(); as desc) {
        <p class="mt-1 text-sm text-gray-500 max-w-sm mx-auto" [class]="descriptionClass()">
          {{ desc }}
        </p>
      }

      <!-- Action Button -->
      @if (actionLabel(); as label) {
        <div class="mt-6">
          <button
            type="button"
            (click)="action.emit()"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            [class]="actionClass()">
            @if (actionIcon(); as iconPath) {
              <svg aria-hidden="true" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="iconPath" />
              </svg>
            }
            {{ label }}
          </button>
        </div>
      }

      <!-- Secondary Action -->
      @if (secondaryActionLabel(); as secondaryLabel) {
        <div class="mt-3">
          <button
            type="button"
            (click)="secondaryAction.emit()"
            class="text-sm text-gray-500 hover:text-gray-700 underline">
            {{ secondaryLabel }}
          </button>
        </div>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  /** Main title text */
  readonly title = input.required<string>();
  
  /** Optional description text */
  readonly description = input<string>('');
  
  /** Predefined icon type */
  readonly icon = input<EmptyIcon>('inbox');
  
  /** Custom icon SVG path (overrides predefined) */
  readonly customIconPath = input<string>('');
  
  /** Icon background color variant */
  readonly iconVariant = input<'default' | 'primary' | 'success' | 'warning'>('default');
  
  /** Primary action button label */
  readonly actionLabel = input<string>('');
  
  /** Primary action button icon path */
  readonly actionIcon = input<string>('');
  
  /** Secondary action link text */
  readonly secondaryActionLabel = input<string>('');
  
  /** Additional container CSS classes */
  readonly customClass = input<string>('');
  
  /** Title CSS classes override */
  readonly titleClass = input<string>('');
  
  /** Description CSS classes override */
  readonly descriptionClass = input<string>('');
  
  /** Action button CSS classes override */
  readonly actionClass = input<string>('');

  /** Primary action click event */
  readonly action = output<void>();
  
  /** Secondary action click event */
  readonly secondaryAction = output<void>();

  private readonly iconPaths: Record<EmptyIcon, string> = {
    inbox: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    folder: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    microphone: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
    chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  };

  protected iconPath(): string {
    return this.customIconPath() || this.iconPaths[this.icon()];
  }

  protected iconBgClass(): string {
    const classes: Record<string, string> = {
      default: 'bg-gray-100',
      primary: 'bg-blue-100',
      success: 'bg-green-100',
      warning: 'bg-yellow-100',
    };
    return classes[this.iconVariant()];
  }

  protected iconColorClass(): string {
    const classes: Record<string, string> = {
      default: 'text-gray-400',
      primary: 'text-blue-500',
      success: 'text-green-500',
      warning: 'text-yellow-500',
    };
    return classes[this.iconVariant()];
  }
}
