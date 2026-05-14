/**
 * ApprovalForm Component
 * Form for requesting approval for an event
 */

import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApprovalsStore } from '../../stores/approvals.store';

@Component({
  selector: 'app-approval-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-[var(--color-border)]">
      <div class="p-6 border-b border-[var(--color-border)]">
        <h2 class="text-lg font-semibold text-[var(--color-text-primary)]">Request Approval</h2>
        <p class="text-sm text-[var(--color-text-secondary)] mt-1">
          Submit this event for approval by your organization
        </p>
      </div>

      <form (ngSubmit)="onSubmit()" class="p-6 space-y-4">
        <!-- Comments -->
        <div>
          <label for="comments" class="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            Comments (Optional)
          </label>
          <textarea
            id="comments"
            [(ngModel)]="comments"
            name="comments"
            rows="3"
            class="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Add any context or notes for the approver..."
          ></textarea>
        </div>

        <!-- Error Message -->
        @if (store.error(); as error) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2" role="alert">
            <svg aria-hidden="true" class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        }

        <!-- Actions -->
        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            [disabled]="store.loading()"
            class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            @if (store.loading()) {
              <svg aria-hidden="true" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            } @else {
              Submit Request
            }
          </button>
          
          <button
            type="button"
            (click)="onCancel()"
            [disabled]="store.loading()"
            class="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm font-medium rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ApprovalFormComponent {
  readonly store = inject(ApprovalsStore);
  
  readonly eventId = input.required<string>();
  readonly approverMembershipId = input.required<string>();
  readonly submitted = output<void>();
  readonly cancelled = output<void>();

  comments = '';

  async onSubmit(): Promise<void> {
    const success = await this.store.requestApproval(
      this.eventId(),
      this.approverMembershipId(),
      this.comments || undefined
    );
    
    if (success) {
      this.comments = '';
      this.submitted.emit();
    }
  }

  onCancel(): void {
    this.comments = '';
    this.cancelled.emit();
  }
}
