/**
 * VoiceInterface Component
 * Main voice input interface with microphone button and transcript display
 */

import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { VoiceStore } from '../../stores/voice.store';

@Component({
  selector: 'app-voice-interface',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">Voice Commands</h2>
          <p class="text-sm text-gray-500">Speak naturally to create events, check schedules, or get updates</p>
        </div>
        
        <!-- Status Badge -->
        @if (voiceStore.isListening()) {
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 animate-pulse">
            <span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            Listening...
          </span>
        } @else if (voiceStore.isProcessing()) {
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        }
      </div>

      <!-- Main Mic Button -->
      <div class="flex justify-center mb-6">
        <button
          type="button"
          (click)="toggleListening()"
          [disabled]="voiceStore.isProcessing()"
          class="relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-4"
          [class.bg-red-600]="voiceStore.isListening()"
          [class.hover.bg-red-700]="voiceStore.isListening()"
          [class.focus.ring-red-300]="voiceStore.isListening()"
          [class.bg-blue-600]="!voiceStore.isListening()"
          [class.hover.bg-blue-700]="!voiceStore.isListening()"
          [class.focus.ring-blue-300]="!voiceStore.isListening()"
          [class.disabled.opacity-50]="voiceStore.isProcessing()"
          [class.disabled.cursor-not-allowed]="voiceStore.isProcessing()"
          [class.scale-110]="voiceStore.isListening()">
          
          <!-- Mic Icon -->
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            @if (voiceStore.isListening()) {
              <!-- Stop Icon -->
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            } @else {
              <!-- Mic Icon -->
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            }
          </svg>

          <!-- Ripple Effect when Listening -->
          @if (voiceStore.isListening()) {
            <span class="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20"></span>
          }
        </button>
      </div>

      <!-- Instructions -->
      <p class="text-center text-sm text-gray-500 mb-4">
        @if (voiceStore.isListening()) {
          Tap to stop recording
        } @else if (voiceStore.isProcessing()) {
          Processing your command...
        } @else {
          Tap the microphone and speak
        }
      </p>

      <!-- Transcript Display -->
      @if (voiceStore.currentTranscript(); as transcript) {
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <p class="text-sm text-gray-500 mb-1">Transcript:</p>
          <p class="text-gray-900">{{ transcript }}</p>
        </div>
      }

      <!-- Text Input Fallback -->
      <div class="flex gap-2">
        <input
          type="text"
          #textInput
          placeholder="Or type your command..."
          [disabled]="voiceStore.isProcessing()"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          (keyup.enter)="submitText(textInput.value); textInput.value = ''"
        />
        <button
          type="button"
          (click)="submitText(textInput.value); textInput.value = ''"
          [disabled]="voiceStore.isProcessing() || !textInput.value"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Send
        </button>
      </div>

      <!-- Error Display -->
      @if (voiceStore.error(); as error) {
        <div class="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-sm text-red-700">{{ error }}</p>
          <button
            type="button"
            (click)="voiceStore.clearError()"
            class="mt-1 text-xs text-red-600 hover:text-red-800 underline">
            Dismiss
          </button>
        </div>
      }

      <!-- Quick Command Hints -->
      <div class="mt-6 pt-6 border-t border-gray-200">
        <p class="text-xs text-gray-500 mb-3">Try saying:</p>
        <div class="flex flex-wrap gap-2">
          @for (hint of quickHints; track hint) {
            <button
              type="button"
              (click)="submitText(hint)"
              class="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors">
              "{{ hint }}"
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class VoiceInterfaceComponent {
  readonly voiceStore = inject(VoiceStore);
  
  /** Emitted when a command is submitted */
  readonly commandSubmitted = output<string>();

  readonly quickHints = [
    'Schedule a meeting tomorrow at 3pm',
    'What meetings do I have today?',
    'Reschedule my 2pm meeting to 4pm',
    'Cancel the team standup',
    'Summarize the board meeting',
  ];

  toggleListening(): void {
    if (this.voiceStore.isListening()) {
      // Stop listening and submit if there's a transcript
      this.voiceStore.stopListening();
      const transcript = this.voiceStore.currentTranscript();
      if (transcript.trim()) {
        this.submitCommand(transcript);
      }
    } else {
      this.voiceStore.startListening();
    }
  }

  submitText(text: string): void {
    if (text.trim()) {
      this.submitCommand(text.trim());
    }
  }

  private async submitCommand(text: string): Promise<void> {
    const success = await this.voiceStore.submitCommand(text);
    if (success) {
      this.commandSubmitted.emit(text);
    }
  }
}
