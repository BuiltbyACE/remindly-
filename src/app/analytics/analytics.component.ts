import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-analytics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-semibold text-[var(--color-text-primary)]">Analytics</h1>
      <div class="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)] text-center">
        <p class="text-[var(--color-text-secondary)]">Operational metrics and charts will be displayed here</p>
      </div>
    </div>
  `,
})
export class AnalyticsComponent {}
