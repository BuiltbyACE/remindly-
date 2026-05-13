import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-voice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-semibold text-[var(--color-text-primary)]">Voice Commands</h1>
      <div class="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)] text-center">
        <p class="text-[var(--color-text-secondary)]">Voice command interface will be here</p>
      </div>
    </div>
  `,
})
export class VoiceComponent {}
