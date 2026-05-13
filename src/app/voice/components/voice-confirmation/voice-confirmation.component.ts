/**
 * VoiceConfirmation Component
 * Risk-level confirmation dialog for high/critical voice commands
 */

import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { VoiceStore } from '../../stores/voice.store';
import {
  RISK_LEVEL_COLORS,
  RISK_LEVEL_LABELS,
  COMMAND_TYPE_LABELS,
} from '../../models/voice.model';

@Component({
  selector: 'app-voice-confirmation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [JsonPipe],
  template: `
    @if (command(); as cmd) {
      <div
        class="rounded-xl border-2 p-6 shadow-lg"
        [class]="riskContainerClass()"
        role="alertdialog"
        aria-modal="true"
        [attr.aria-label]="'Confirm ' + cmd.risk_level + ' risk voice command'">

        <!-- Risk Level Header -->
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full flex items-center justify-center"
               [class]="riskIconBgClass()">
            <svg class="w-6 h-6" [class]="riskIconColorClass()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <span class="font-bold text-sm uppercase tracking-wide"
                  [class]="riskTextClass()">
              {{ riskLabel() }}
            </span>
            <p class="text-sm text-gray-600">This action requires your explicit confirmation</p>
          </div>
        </div>

        <!-- Command Details -->
        <div class="mb-4">
          <p class="text-sm text-gray-500 mb-1">Command Type</p>
          <p class="text-lg font-medium text-gray-900">{{ commandTypeLabel() }}</p>
        </div>

        <div class="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <p class="text-gray-800">{{ cmd.command_text }}</p>
        </div>

        <!-- Parsed Intent (if available) -->
        @if (cmd.parsed_intent; as intent) {
          <div class="mb-6">
            <p class="text-sm font-medium text-gray-700 mb-2">Parsed Intent:</p>
            <pre class="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto">{{ intent | json }}</pre>
          </div>
        }

        <!-- Warning for Critical -->
        @if (cmd.risk_level === 'critical') {
          <div class="mb-6 bg-red-100 border border-red-300 rounded-lg p-3">
            <p class="text-sm text-red-800">
              <strong>Warning:</strong> This is a critical action that may have significant consequences. 
              Please review carefully before confirming.
            </p>
          </div>
        }

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button
            type="button"
            (click)="onCancel()"
            class="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
            Cancel
          </button>
          <button
            type="button"
            (click)="onConfirm()"
            class="flex-1 px-4 py-3 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
            [class.bg-blue-600]="cmd.risk_level !== 'critical'"
            [class.hover.bg-blue-700]="cmd.risk_level !== 'critical'"
            [class.focus.ring-blue-500]="cmd.risk_level !== 'critical'"
            [class.bg-red-600]="cmd.risk_level === 'critical'"
            [class.hover.bg-red-700]="cmd.risk_level === 'critical'"
            [class.focus.ring-red-500]="cmd.risk_level === 'critical'">
            @if (voiceStore.isProcessing()) {
              <span class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Confirming...
              </span>
            } @else {
              Confirm Action
            }
          </button>
        </div>
      </div>
    }
  `,
})
export class VoiceConfirmationComponent {
  readonly voiceStore = inject(VoiceStore);
  
  /** The command requiring confirmation */
  readonly command = input.required<import('../../models/voice.model').VoiceCommandResponse>();
  
  /** Emitted when user confirms */
  readonly confirmed = output<void>();
  
  /** Emitted when user cancels */
  readonly cancelled = output<void>();

  protected riskLabel(): string {
    return RISK_LEVEL_LABELS[this.command().risk_level];
  }

  protected commandTypeLabel(): string {
    return COMMAND_TYPE_LABELS[this.command().command_type];
  }

  protected riskContainerClass(): string {
    const colors = RISK_LEVEL_COLORS[this.command().risk_level];
    return `${colors.bg} ${colors.border} border-2`;
  }

  protected riskIconBgClass(): string {
    const level = this.command().risk_level;
    if (level === 'critical') return 'bg-red-200';
    if (level === 'high') return 'bg-orange-200';
    return 'bg-yellow-200';
  }

  protected riskIconColorClass(): string {
    const level = this.command().risk_level;
    if (level === 'critical') return 'text-red-700';
    if (level === 'high') return 'text-orange-700';
    return 'text-yellow-700';
  }

  protected riskTextClass(): string {
    return RISK_LEVEL_COLORS[this.command().risk_level].text;
  }

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
