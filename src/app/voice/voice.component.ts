/**
 * Voice Component
 * Main voice command page with interface, confirmation, and history
 */

import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { TitleCasePipe, JsonPipe } from '@angular/common';
import { VoiceStore } from './stores/voice.store';
import { VoiceInterfaceComponent } from './components/voice-interface/voice-interface.component';
import { VoiceConfirmationComponent } from './components/voice-confirmation/voice-confirmation.component';
import { VoiceHistoryComponent } from './components/voice-history/voice-history.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-voice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoiceInterfaceComponent,
    VoiceConfirmationComponent,
    VoiceHistoryComponent,
    PageHeaderComponent,
    TitleCasePipe,
    JsonPipe,
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <app-page-header
        title="Voice Commands"
        subtitle="Use voice to create events, check schedules, and get updates"
        [breadcrumbs]="[{ label: 'Dashboard' }, { label: 'Voice Commands' }]" />

      <!-- Confirmation Modal for High/Critical Risk -->
      @if (voiceStore.requiresConfirmation() && voiceStore.confirmationCommand(); as command) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="w-full max-w-lg">
            <app-voice-confirmation
              [command]="command"
              (confirmed)="onConfirmCommand(command.id, true)"
              (cancelled)="onConfirmCommand(command.id, false)" />
          </div>
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Voice Interface -->
        <div class="space-y-6">
          <app-voice-interface (commandSubmitted)="onCommandSubmitted($event)" />
          
          <!-- Selected Command Details -->
          @if (voiceStore.selectedCommand(); as selected) {
            <div class="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Command Details</h3>
              
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-500">Status</p>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1"
                        [class.bg-gray-100]="selected.status === 'pending'"
                        [class.text-gray-800]="selected.status === 'pending'"
                        [class.bg-blue-100]="selected.status === 'processing'"
                        [class.text-blue-800]="selected.status === 'processing'"
                        [class.bg-yellow-100]="selected.status === 'awaiting_confirmation'"
                        [class.text-yellow-800]="selected.status === 'awaiting_confirmation'"
                        [class.bg-green-100]="selected.status === 'completed'"
                        [class.text-green-800]="selected.status === 'completed'"
                        [class.bg-red-100]="selected.status === 'failed' || selected.status === 'rejected'"
                        [class.text-red-800]="selected.status === 'failed' || selected.status === 'rejected'">
                    {{ selected.status | titlecase }}
                  </span>
                </div>
                
                <div>
                  <p class="text-sm text-gray-500">Command</p>
                  <p class="text-gray-900">{{ selected.command_text }}</p>
                </div>

                @if (selected.parsed_intent) {
                  <div>
                    <p class="text-sm text-gray-500">Parsed Intent</p>
                    <pre class="text-xs bg-gray-50 rounded p-2 mt-1 overflow-auto">{{ selected.parsed_intent | json }}</pre>
                  </div>
                }

                @if (selected.execution_result) {
                  <div>
                    <p class="text-sm text-gray-500">Result</p>
                    <pre class="text-xs bg-gray-50 rounded p-2 mt-1 overflow-auto">{{ selected.execution_result | json }}</pre>
                  </div>
                }
              </div>

              @if (selected.status === 'awaiting_confirmation' && selected.risk_level !== 'high' && selected.risk_level !== 'critical') {
                <div class="mt-4 flex gap-2">
                  <button
                    type="button"
                    (click)="onConfirmCommand(selected.id, true)"
                    class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Confirm
                  </button>
                  <button
                    type="button"
                    (click)="onConfirmCommand(selected.id, false)"
                    class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              }
            </div>
          }
        </div>

        <!-- Command History -->
        <div>
          <app-voice-history />
        </div>
      </div>
    </div>
  `,
})
export class VoiceComponent implements OnInit {
  readonly voiceStore = inject(VoiceStore);

  ngOnInit(): void {
    this.voiceStore.loadCommands();
  }

  onCommandSubmitted(text: string): void {
    // Command was submitted, store handles processing
  }

  async onConfirmCommand(commandId: string, confirmed: boolean): Promise<void> {
    await this.voiceStore.confirmCommand(commandId, confirmed);
  }
}

