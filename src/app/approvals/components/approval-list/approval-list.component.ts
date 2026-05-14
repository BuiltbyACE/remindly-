import { Component, ChangeDetectionStrategy, computed, inject, input, output, signal, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApprovalsStore } from '../../stores/approvals.store';
import { BulkActionBarComponent, type BulkAction } from '@shared/components/bulk-action-bar/bulk-action-bar.component';
import { APPROVAL_STATUS_LABELS, APPROVAL_STATUS_COLORS, type Approval, type ApprovalStatus } from '../../models/approval.model';

@Component({
  selector: 'app-approval-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, BulkActionBarComponent],
  host: {
    '(keydown)': 'onKeydown($event)',
  },
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-[var(--color-border)]">
      <!-- Header with Filter -->
      <div class="p-4 border-b border-[var(--color-border)]">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 class="text-lg font-semibold text-[var(--color-text-primary)]">
            Approvals
            @if (store.pendingCount() > 0) {
              <span class="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                {{ store.pendingCount() }} pending
              </span>
            }
          </h2>

          <div class="flex gap-1.5">
            <button
              type="button"
              (click)="setFilter(null)"
              [class]="getFilterClasses(null)"
            >
              All
            </button>
            <button
              type="button"
              (click)="setFilter('pending')"
              [class]="getFilterClasses('pending')"
            >
              Pending
            </button>
            <button
              type="button"
              (click)="setFilter('approved')"
              [class]="getFilterClasses('approved')"
            >
              Approved
            </button>
            <button
              type="button"
              (click)="setFilter('rejected')"
              [class]="getFilterClasses('rejected')"
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (store.loading()) {
        <div class="p-6">
          <div class="space-y-3">
            @for (i of [1,2,3]; track i) {
              <div class="animate-pulse flex gap-4 p-3">
                <div class="h-10 w-10 bg-gray-200 rounded-lg"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Error State -->
      @else if (store.error(); as error) {
        <div class="p-6 text-center">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <svg aria-hidden="true" class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm text-[var(--color-text-secondary)]">{{ error }}</p>
          <button
            type="button"
            (click)="retry.emit()"
            class="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Retry
          </button>
        </div>
      }

      <!-- Empty State -->
      @else if (filteredApprovals().length === 0) {
        <div class="p-8 text-center">
          <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg aria-hidden="true" class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm text-[var(--color-text-secondary)]">
            @if (store.filters().status) {
              No {{ store.filters().status }} approvals found
            } @else {
              No approvals found
            }
          </p>
        </div>
      }

      <!-- Approval List -->
      @else {
        <div class="divide-y divide-[var(--color-border)]">
          @for (approval of filteredApprovals(); track approval.id) {
            <div #approvalRow
              class="p-3 hover:bg-[var(--color-surface-alt)] transition-colors flex items-center justify-between gap-3"
              [class.bg-blue-50]="selectedIds().includes(approval.id)"
            >
              <!-- Checkbox -->
              <div class="flex-shrink-0">
                <input
                  type="checkbox"
                  [checked]="selectedIds().includes(approval.id)"
                  (change)="toggleSelection(approval.id)"
                  class="rounded border-[var(--color-border)] text-blue-600 focus:ring-blue-500"
                  aria-label="Select approval"
                />
              </div>

              <!-- Left: Event Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <span
                    class="px-2 py-0.5 text-xs font-medium rounded-full border"
                    [class]="getStatusClasses(approval.status)"
                  >
                    {{ getStatusLabel(approval.status) }}
                  </span>
                  <span class="text-xs text-[var(--color-text-muted)]">
                    {{ approval.requested_at | date:'MMM d, h:mm a' }}
                  </span>
                </div>
                <h3 class="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {{ approval.event_title || 'Untitled Event' }}
                </h3>
                <p class="text-xs text-[var(--color-text-muted)]">
                  Requested by {{ approval.requested_by_name || 'Unknown' }}
                  @if (approval.comments) {
                    • {{ approval.comments }}
                  }
                </p>
              </div>

              <!-- Right: Actions -->
              <div class="flex items-center gap-1.5 flex-shrink-0">
                @if (approval.status === 'pending' && showActions()) {
                  <button
                    type="button"
                    (click)="onApprove(approval); $event.stopPropagation()"
                    class="px-2.5 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    aria-label="Approve"
                  >
                    <svg aria-hidden="true" class="w-3.5 h-3.5 lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span class="hidden lg:inline">Approve</span>
                  </button>
                  <button
                    type="button"
                    (click)="onReject(approval); $event.stopPropagation()"
                    class="px-2.5 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    aria-label="Reject"
                  >
                    <svg aria-hidden="true" class="w-3.5 h-3.5 lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span class="hidden lg:inline">Reject</span>
                  </button>
                }

                <a
                  [routerLink]="['/events', approval.event_id]"
                  class="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                  title="View Event"
                  aria-label="View event"
                >
                  <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </a>
              </div>
            </div>
          }
        </div>
      }

      <!-- Pagination -->
      @if (store.pagination().total > store.pagination().pageSize) {
        <div class="p-3 border-t border-[var(--color-border)] flex items-center justify-between">
          <p class="text-sm text-[var(--color-text-muted)]">
            Showing {{ (store.pagination().page - 1) * store.pagination().pageSize + 1 }} -
            {{ min(store.pagination().page * store.pagination().pageSize, store.pagination().total) }}
            of {{ store.pagination().total }}
          </p>
          <div class="flex gap-2">
            <button
              type="button"
              (click)="previousPage()"
              [disabled]="store.pagination().page === 1"
              class="px-2.5 py-1.5 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-alt)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              (click)="nextPage()"
              [disabled]="store.pagination().page * store.pagination().pageSize >= store.pagination().total"
              class="px-2.5 py-1.5 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-alt)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      }

      <!-- Bulk Action Bar -->
      <app-bulk-action-bar
        [selectedIds]="selectedIds()"
        entityType="approvals"
        [actions]="bulkActions"
        (clearSelection)="clearSelection()"
      />
    </div>
  `,
})
export class ApprovalListComponent {
  readonly store = inject(ApprovalsStore);

  readonly eventId = input<string | undefined>(undefined);
  readonly showActions = input<boolean>(true);
  readonly onSelect = output<Approval>();
  readonly onApproveRequest = output<Approval>();
  readonly onRejectRequest = output<Approval>();
  readonly retry = output<void>();

  readonly selectedIds = signal<string[]>([]);

  readonly filteredApprovals = computed(() => this.store.filteredApprovals());

  readonly bulkActions: BulkAction[] = [
    {
      label: 'Approve',
      icon: 'M5 13l4 4L19 7',
      variant: 'primary',
      handler: () => this.bulkApprove(),
    },
    {
      label: 'Reject',
      icon: 'M6 18L18 6M6 6l12 12',
      variant: 'danger',
      handler: () => this.bulkReject(),
    },
  ];

  setFilter(status: ApprovalStatus | null): void {
    this.store.setFilters({ status: status || undefined });
  }

  getFilterClasses(status: ApprovalStatus | null): string {
    const baseClasses = 'px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors';
    const isActive = status === null
      ? !this.store.filters().status
      : this.store.filters().status === status;

    if (isActive) {
      return `${baseClasses} bg-blue-600 text-white`;
    }
    return `${baseClasses} border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]`;
  }

  getStatusClasses(status: ApprovalStatus): string {
    return APPROVAL_STATUS_COLORS[status];
  }

  getStatusLabel(status: ApprovalStatus): string {
    return APPROVAL_STATUS_LABELS[status];
  }

  onApprove(approval: Approval): void {
    this.onApproveRequest.emit(approval);
  }

  onReject(approval: Approval): void {
    this.onRejectRequest.emit(approval);
  }

  toggleSelection(id: string): void {
    this.selectedIds.update(ids =>
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id],
    );
  }

  clearSelection(): void {
    this.selectedIds.set([]);
  }

  async bulkApprove(): Promise<void> {
    const ids = this.selectedIds();
    const eventId = this.eventId();
    if (!eventId) return;
    for (const id of ids) {
      this.store.processApproval(eventId, id, 'approve', '');
    }
    this.clearSelection();
  }

  async bulkReject(): Promise<void> {
    const ids = this.selectedIds();
    const eventId = this.eventId();
    if (!eventId) return;
    for (const id of ids) {
      this.store.processApproval(eventId, id, 'reject', '');
    }
    this.clearSelection();
  }

  previousPage(): void {
    const currentPage = this.store.pagination().page;
    if (currentPage > 1) {
      this.store.setPage(currentPage - 1);
      if (this.eventId()) {
        this.store.loadApprovals(this.eventId()!);
      }
    }
  }

  nextPage(): void {
    const { page, pageSize, total } = this.store.pagination();
    if (page * pageSize < total) {
      this.store.setPage(page + 1);
      if (this.eventId()) {
        this.store.loadApprovals(this.eventId()!);
      }
    }
  }

  protected readonly focusedIndex = signal(-1);

  @ViewChildren('approvalRow', { read: ElementRef }) private readonly approvalRows!: QueryList<ElementRef<HTMLElement>>;

  onKeydown(event: KeyboardEvent): void {
    const approvals = this.filteredApprovals();
    if (approvals.length === 0) return;

    switch (event.key) {
      case 'j': {
        event.preventDefault();
        const next = Math.min(this.focusedIndex() + 1, approvals.length - 1);
        this.focusedIndex.set(next);
        (this.approvalRows?.get(next)?.nativeElement.querySelector('a,button') as HTMLElement | null)?.focus();
        break;
      }
      case 'k': {
        event.preventDefault();
        const prev = Math.max(this.focusedIndex() - 1, 0);
        this.focusedIndex.set(prev);
        (this.approvalRows?.get(prev)?.nativeElement.querySelector('a,button') as HTMLElement | null)?.focus();
        break;
      }
      case 'a': {
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          this.toggleSelectAll();
        }
        break;
      }
      case 'Escape': {
        if (this.selectedIds().length > 0) {
          event.preventDefault();
          this.clearSelection();
        }
        break;
      }
    }
  }

  toggleSelectAll(): void {
    const ids = this.filteredApprovals().map(a => a.id);
    this.selectedIds.update(prev =>
      prev.length === ids.length ? [] : ids,
    );
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
