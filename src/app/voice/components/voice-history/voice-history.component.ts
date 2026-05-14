/**
 * VoiceHistory Component
 * Displays list of past voice commands with status
 */

import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { VoiceStore } from '../../stores/voice.store';
import {
  VOICE_STATUS_LABELS,
  VOICE_STATUS_COLORS,
  COMMAND_TYPE_LABELS,
  RISK_LEVEL_LABELS,
} from '../../models/voice.model';

@Component({
  selector: 'app-voice-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <div class="bg-white rounded-xl border border-[var(--color-border)] shadow-sm">
      <div class="p-6 border-b border-[var(--color-border)]">
        <h2 class="text-lg font-semibold text-gray-900">Command History</h2>
        <p class="text-sm text-gray-500 mt-1">Recent voice commands and their status</p>
      </div>

      <div class="p-6">
        @if (voiceStore.commands().length === 0) {
          <div class="text-center py-8">
            <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg aria-hidden="true" class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p class="text-sm text-gray-500">No voice commands yet</p>
            <p class="text-xs text-gray-400 mt-1">Use the microphone to get started</p>
          </div>
        } @else {
          <div class="space-y-3">
            @for (command of voiceStore.commands(); track command.id) {
              <div 
                class="flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer"
                [class.bg-blue-50]="voiceStore.selectedCommand()?.id === command.id"
                [class.border-blue-200]="voiceStore.selectedCommand()?.id === command.id"
                [class.border-gray-200]="voiceStore.selectedCommand()?.id !== command.id"
                [class.hover.border-gray-300]="voiceStore.selectedCommand()?.id !== command.id"
                (click)="selectCommand(command)">
                
                <!-- Status Icon -->
                <div class="flex-shrink-0">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class]="getStatusColor(command.status)">
                    {{ getStatusLabel(command.status) }}
                  </span>
                </div>

                <!-- Command Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ getCommandTypeLabel(command.command_type) }}
                    </p>
                    @if (command.risk_level !== 'low') {
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            [class.bg-red-100]="command.risk_level === 'critical'"
                            [class.text-red-800]="command.risk_level === 'critical'"
                            [class.bg-orange-100]="command.risk_level === 'high'"
                            [class.text-orange-800]="command.risk_level === 'high'"
                            [class.bg-yellow-100]="command.risk_level === 'medium'"
                            [class.text-yellow-800]="command.risk_level === 'medium'">
                        {{ getRiskLabel(command.risk_level) }}
                      </span>
                    }
                  </div>
                  <p class="text-sm text-gray-600 truncate">{{ command.command_text }}</p>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ command.created_at | date:'MMM d, h:mm a' }}
                  </p>
                </div>

                <!-- Arrow -->
                <svg aria-hidden="true" class="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            }
          </div>

          @if (voiceStore.commands().length >= 20) {
            <div class="mt-4 text-center">
              <button
                type="button"
                (click)="loadMore()"
                class="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Load more history
              </button>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class VoiceHistoryComponent {
  readonly voiceStore = inject(VoiceStore);

  getStatusLabel(status: string): string {
    return VOICE_STATUS_LABELS[status as keyof typeof VOICE_STATUS_LABELS] ?? status;
  }

  getStatusColor(status: string): string {
    return VOICE_STATUS_COLORS[status as keyof typeof VOICE_STATUS_COLORS] ?? 'bg-gray-100 text-gray-800';
  }

  getCommandTypeLabel(type: string): string {
    return COMMAND_TYPE_LABELS[type as keyof typeof COMMAND_TYPE_LABELS] ?? type;
  }

  getRiskLabel(risk: string): string {
    return RISK_LEVEL_LABELS[risk as keyof typeof RISK_LEVEL_LABELS] ?? risk;
  }

  selectCommand(command: import('../../models/voice.model').VoiceCommandResponse): void {
    this.voiceStore.selectCommand(command);
  }

  loadMore(): void {
    // Load more commands from history
    this.voiceStore.loadCommands(50);
  }
}
