/**
 * ConfirmDialog Component
 * Generic confirmation dialog for destructive actions
 */

import { Component, ChangeDetectionStrategy, output, input, HostListener, ElementRef, inject } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #dialogContainer class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ title() }}
        </h3>
        <p class="text-gray-600 mb-6">
          {{ message() }}
        </p>
        <div class="flex justify-end gap-3">
          <button
            #cancelBtn
            type="button"
            (click)="cancelled.emit()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {{ cancelText() }}
          </button>
          <button
            #confirmBtn
            type="button"
            (click)="confirmed.emit()"
            [class]="confirmButtonClass()"
          >
            {{ confirmText() }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  private readonly el = inject(ElementRef);

  readonly title = input('Confirm Action');
  readonly message = input('Are you sure you want to proceed?');
  readonly confirmText = input('Confirm');
  readonly cancelText = input('Cancel');
  readonly variant = input<'danger' | 'warning' | 'default'>('default');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  @HostListener('keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelled.emit();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = this.el.nativeElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  readonly confirmButtonClass = () => {
    const baseClasses = 'px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variantClasses = {
      danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      warning: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
      default: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    };
    return `${baseClasses} ${variantClasses[this.variant()]}`;
  };
}
