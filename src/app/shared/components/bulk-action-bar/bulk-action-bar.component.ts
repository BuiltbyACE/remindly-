import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

export interface BulkAction {
  label: string;
  icon: string;
  variant: 'primary' | 'danger' | 'default';
  handler: () => void;
}

@Component({
  selector: 'app-bulk-action-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    @if (selectedIds().length > 0) {
      <div class="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none">
        <div class="bg-white rounded-xl shadow-2xl border border-[var(--color-border)] px-4 py-3 flex items-center gap-3 pointer-events-auto w-full max-w-2xl">
          <span class="text-sm font-medium text-[var(--color-text-primary)] whitespace-nowrap">
            {{ selectedIds().length }} {{ entityType() }} selected
          </span>

          <div class="h-5 w-px bg-[var(--color-border)]"></div>

          <div class="flex items-center gap-2 flex-wrap">
            @for (action of actions(); track action.label) {
              <button
                type="button"
                (click)="action.handler()"
                [class]="getButtonClasses(action.variant)"
              >
                <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="action.icon" />
                </svg>
                <span class="hidden sm:inline">{{ action.label }}</span>
              </button>
            }
          </div>

          <div class="ml-auto">
            <button
              type="button"
              (click)="clearSelection.emit()"
              class="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)] transition-colors"
              aria-label="Clear selection"
            >
              <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class BulkActionBarComponent {
  readonly selectedIds = input.required<string[]>();
  readonly entityType = input<string>('items');
  readonly actions = input<BulkAction[]>([]);
  readonly clearSelection = output<void>();

  protected getButtonClasses(variant: BulkAction['variant']): string {
    const base = 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors';
    switch (variant) {
      case 'primary':
        return `${base} bg-blue-600 text-white hover:bg-blue-700`;
      case 'danger':
        return `${base} bg-red-600 text-white hover:bg-red-700`;
      default:
        return `${base} border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)]`;
    }
  }
}
