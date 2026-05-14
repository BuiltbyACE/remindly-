import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService, ToastType } from './toast.service';

const TYPE_CLASSES: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
};

const ICONS: Record<ToastType, string> = {
  success: 'M5 13l4 4L19 7',
  error:   'M6 18L18 6M6 6l12 12',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  info:    'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2" role="region" aria-label="Notifications">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-[400px] animate-in slide-in-from-right"
          [class]="typeClass(toast.type)"
          role="alert"
          [attr.aria-live]="toast.type === 'error' ? 'assertive' : 'polite'">
          
          <svg aria-hidden="true" class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="icons[toast.type]" />
          </svg>
          
          <p class="text-sm font-medium flex-1">{{ toast.message }}</p>
          
          <button
            type="button"
            class="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
            (click)="toastService.dismiss(toast.id)"
            [attr.aria-label]="'Dismiss notification'">
            <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
  readonly icons = ICONS;

  typeClass(type: ToastType): string {
    return TYPE_CLASSES[type];
  }
}
