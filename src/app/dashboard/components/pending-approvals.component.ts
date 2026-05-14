import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApprovalsStore } from '../../approvals/stores/approvals.store';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import type { Approval } from '../../approvals/models/approval.model';

@Component({
  selector: 'app-pending-approvals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SkeletonLoaderComponent],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <div class="p-5 border-b border-gray-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
            <svg aria-hidden="true" class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 class="text-base font-bold text-gray-900">Pending Approvals</h2>
            <p class="text-xs text-gray-500">{{ pendingApprovals().length }} awaiting your decision</p>
          </div>
        </div>
        <a
          routerLink="/approvals"
          class="text-sm text-blue-600 hover:text-blue-800 font-semibold"
        >
          View All →
        </a>
      </div>

      <div class="p-5">
        @if (approvalsStore.loading()) {
          <app-skeleton-loader variant="list" [count]="3" />
        } @else if (pendingApprovals().length === 0) {
          <div class="text-center py-6">
            <div class="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-3">
              <svg aria-hidden="true" class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-sm text-gray-500">No pending approvals</p>
            <p class="text-xs text-gray-400 mt-1">All caught up!</p>
          </div>
        } @else {
          <div class="space-y-3">
            @for (approval of pendingApprovals().slice(0, 5); track approval.id) {
              <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0"></span>
                    <p class="text-sm font-semibold text-gray-900 truncate">
                      {{ approval.event_title ?? 'Untitled Event' }}
                    </p>
                  </div>
                  <p class="text-xs text-gray-500">
                    Requested by {{ approval.requested_by_name || 'Unknown' }}
                  </p>
                  <p class="text-xs text-gray-400">
                    {{ formatDate(approval.requested_at) }}
                  </p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button
                    (click)="approve(approval)"
                    [disabled]="approvalsStore.loading()"
                    class="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    (click)="reject(approval)"
                    [disabled]="approvalsStore.loading()"
                    class="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class PendingApprovalsComponent {
  readonly approvalsStore = inject(ApprovalsStore);

  readonly pendingApprovals = computed<Approval[]>(() =>
    this.approvalsStore.actionableApprovals()
  );

  async approve(approval: Approval): Promise<void> {
    await this.approvalsStore.processApproval(approval.event_id, approval.id, 'approve');
  }

  async reject(approval: Approval): Promise<void> {
    await this.approvalsStore.processApproval(approval.event_id, approval.id, 'reject');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}
