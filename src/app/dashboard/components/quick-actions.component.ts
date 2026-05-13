import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

interface QuickAction {
  label: string;
  routerLink: string;
  variant: 'primary' | 'secondary';
  icon: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Create Event',
    routerLink: '/events/create',
    variant: 'primary',
    icon: 'M12 4v16m8-8H4',
  },
  {
    label: 'View Calendar',
    routerLink: '/events',
    variant: 'secondary',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    label: 'AI Briefing',
    routerLink: '/ai',
    variant: 'secondary',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    label: 'Voice Command',
    routerLink: '/voice',
    variant: 'secondary',
    icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
  },
];

@Component({
  selector: 'app-quick-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
      <h2 class="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Quick Actions</h2>
      <div class="flex flex-wrap gap-2">
        @for (action of actions; track action.label) {
          <a
            [routerLink]="action.routerLink"
            [class]="getButtonClasses(action.variant)"
          >
            <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="action.icon" />
            </svg>
            {{ action.label }}
          </a>
        }
      </div>
    </div>
  `,
})
export class QuickActionsComponent {
  readonly actions = QUICK_ACTIONS;

  getButtonClasses(variant: 'primary' | 'secondary'): string {
    const baseClasses = 'inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

    if (variant === 'primary') {
      return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
    }

    return `${baseClasses} border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)] focus:ring-blue-500`;
  }
}
