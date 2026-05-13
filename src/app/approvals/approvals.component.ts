import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApprovalListComponent } from './components/approval-list/approval-list.component';
import { ApprovalDetailComponent } from './components/approval-detail/approval-detail.component';
import { ApprovalsStore } from './stores/approvals.store';
import { EventsStore } from '../events/stores/events.store';
import type { Approval } from './models/approval.model';

@Component({
  selector: 'app-approvals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ApprovalListComponent, ApprovalDetailComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-[var(--color-text-primary)]">Approvals</h1>
        <a
          routerLink="/events"
          class="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View Events →
        </a>
      </div>

      <!-- Description -->
      <p class="text-sm text-[var(--color-text-secondary)]">
        Review and manage approval requests for events. You can approve or reject requests from team members.
      </p>

      <!-- Approval List -->
      <app-approval-list
        [showActions]="true"
        (onApproveRequest)="onApproveRequest($event)"
        (onRejectRequest)="onRejectRequest($event)"
        (retry)="loadApprovals()"
      />

      <!-- Selected Approval Detail Modal -->
      @if (selectedApproval(); as approval) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div class="max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <app-approval-detail
              [approval]="approval"
              [showActions]="true"
              (processed)="onApprovalProcessed()"
            />
            <button
              type="button"
              (click)="closeDetail()"
              class="mt-4 w-full px-4 py-2 bg-white text-[var(--color-text-primary)] font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ApprovalsComponent implements OnInit {
  private readonly approvalsStore = inject(ApprovalsStore);
  private readonly eventsStore = inject(EventsStore);
  private readonly router = inject(Router);

  readonly selectedApproval = signal<Approval | null>(null);

  ngOnInit(): void {
    // Load approvals from events that have pending approvals
    this.loadApprovals();
  }

  loadApprovals(): void {
    // Get all events and load approvals for each event with pending status
    const events = this.eventsStore.events();
    
    // For now, we'll load approvals for the first few events that might have approvals
    // In a real scenario, we'd have an endpoint to get all pending approvals across events
    events.slice(0, 5).forEach(event => {
      this.approvalsStore.loadApprovals(event.id);
    });
  }

  onApproveRequest(approval: Approval): void {
    this.selectedApproval.set(approval);
  }

  onRejectRequest(approval: Approval): void {
    this.selectedApproval.set(approval);
  }

  onApprovalProcessed(): void {
    this.selectedApproval.set(null);
    this.loadApprovals();
  }

  closeDetail(): void {
    this.selectedApproval.set(null);
  }
}
