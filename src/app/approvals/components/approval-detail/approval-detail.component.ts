/**
 * ApprovalDetail Component
 * Displays approval details with approve/reject actions
 */

import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApprovalsStore } from '../../stores/approvals.store';
import { APPROVAL_STATUS_LABELS, APPROVAL_STATUS_COLORS, type Approval } from '../../models/approval.model';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-approval-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-[var(--color-border)]">
      <!-- Header -->
      <div class="p-6 border-b border-[var(--color-border)]">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span 
                class="px-2 py-0.5 text-xs font-medium rounded-full border"
                [class]="getStatusClasses(approval().status)"
              >
                {{ getStatusLabel(approval().status) }}
              </span>
            </div>
            <h2 class="text-xl font-semibold text-[var(--color-text-primary)]">
              {{ approval().event_title || 'Untitled Event' }}
            </h2>
          </div>
          
          <a
            [routerLink]="['/events', approval().event_id]"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View Event →
          </a>
        </div>
      </div>

      <!-- Details -->
      <div class="p-6 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Requested By</label>
            <p class="text-sm text-[var(--color-text-primary)]">{{ approval().requested_by_name || 'Unknown' }}</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Requested At</label>
            <p class="text-sm text-[var(--color-text-primary)]">{{ approval().requested_at | date:'medium' }}</p>
          </div>
          
          @if (approval().processed_by) {
            <div>
              <label class="block text-xs font-medium text-[var(--color-text-muted)] mb-1">{{ approval().status === 'approved' ? 'Approved' : 'Rejected' }} By</label>
              <p class="text-sm text-[var(--color-text-primary)]">{{ approval().processed_by_name || approval().processed_by }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Processed At</label>
              <p class="text-sm text-[var(--color-text-primary)]">{{ approval().processed_at | date:'medium' }}</p>
            </div>
          }
        </div>

        @if (approval().comments) {
          <div>
            <label class="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Request Comments</label>
            <p class="text-sm text-[var(--color-text-primary)] bg-[var(--color-surface-alt)] p-3 rounded-lg">
              {{ approval().comments }}
            </p>
          </div>
        }

        <!-- Actions for Pending Approvals -->
        @if (approval().status === 'pending' && showActions()) {
          <div class="border-t border-[var(--color-border)] pt-4 mt-4">
            <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Your Response
            </label>
            <textarea
              [(ngModel)]="responseComment"
              rows="2"
              class="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-3"
              placeholder="Add optional comments..."
            ></textarea>
            
            <div class="flex items-center gap-3">
              <button
                type="button"
                (click)="showApproveDialog = true"
                [disabled]="store.loading()"
                class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </button>
              
              <button
                type="button"
                (click)="showRejectDialog = true"
                [disabled]="store.loading()"
                class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            </div>
          </div>
        }

        <!-- Error Message -->
        @if (store.error(); as error) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2" role="alert">
            <svg aria-hidden="true" class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        }
      </div>
    </div>

    <!-- Confirm Approve Dialog -->
    @if (showApproveDialog) {
      <app-confirm-dialog
        title="Approve Request"
        message="Are you sure you want to approve this event? This action cannot be undone."
        confirmText="Approve"
        cancelText="Cancel"
        variant="default"
        (confirmed)="onApprove()"
        (cancelled)="showApproveDialog = false"
      />
    }

    <!-- Confirm Reject Dialog -->
    @if (showRejectDialog) {
      <app-confirm-dialog
        title="Reject Request"
        message="Are you sure you want to reject this event? Please provide a reason in the comments."
        confirmText="Reject"
        cancelText="Cancel"
        variant="danger"
        (confirmed)="onReject()"
        (cancelled)="showRejectDialog = false"
      />
    }
  `,
})
export class ApprovalDetailComponent {
  readonly store = inject(ApprovalsStore);
  
  readonly approval = input.required<Approval>();
  readonly showActions = input<boolean>(true);
  readonly processed = output<void>();

  responseComment = '';
  showApproveDialog = false;
  showRejectDialog = false;

  getStatusClasses(status: Approval['status']): string {
    return APPROVAL_STATUS_COLORS[status];
  }

  getStatusLabel(status: Approval['status']): string {
    return APPROVAL_STATUS_LABELS[status];
  }

  async onApprove(): Promise<void> {
    this.showApproveDialog = false;
    
    const success = await this.store.processApproval(
      this.approval().event_id,
      this.approval().id,
      'approve',
      this.responseComment || undefined
    );
    
    if (success) {
      this.processed.emit();
    }
  }

  async onReject(): Promise<void> {
    this.showRejectDialog = false;
    
    const success = await this.store.processApproval(
      this.approval().event_id,
      this.approval().id,
      'reject',
      this.responseComment || undefined
    );
    
    if (success) {
      this.processed.emit();
    }
  }
}
