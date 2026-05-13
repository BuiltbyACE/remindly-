import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { EventsStore } from '../../stores/events.store';
import { EventsService } from '../../services/events.service';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { BulkActionBarComponent, type BulkAction } from '../../../shared/components/bulk-action-bar/bulk-action-bar.component';
import { EVENT_STATUS_LABELS, type EventStatus } from '../../models/event.model';

@Component({
  selector: 'app-event-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, StatusChipComponent, PriorityBadgeComponent, BulkActionBarComponent],
  host: {
    '(keydown)': 'onKeydown($event)',
  },
  template: `
    <div class="space-y-4">
      <!-- Filters -->
      <div class="bg-white p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Search</label>
            <input
              type="text"
              [(ngModel)]="searchInput"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Search by title..."
              class="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div class="w-44">
            <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Status</label>
            <select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="onStatusChange($event)"
              class="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option [ngValue]="null">All Statuses</option>
              @for (status of statusOptions; track status.value) {
                <option [ngValue]="status.value">{{ status.label }}</option>
              }
            </select>
          </div>

          <div class="pt-6">
            <button
              type="button"
              (click)="resetFilters()"
              class="px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface-alt)]"
            >
              Reset
            </button>
          </div>

          <div class="pt-6 ml-auto">
            <a
              routerLink="/events/create"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              + New Event
            </a>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (store.loading()) {
        <div class="bg-white rounded-lg border border-[var(--color-border)] shadow-sm p-6">
          <div class="animate-pulse space-y-3">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="flex gap-4">
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                <div class="h-4 bg-gray-200 rounded w-1/6"></div>
                <div class="h-4 bg-gray-200 rounded w-1/6"></div>
                <div class="h-4 bg-gray-200 rounded w-1/4 ml-auto"></div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Error State -->
      @if (store.error(); as error) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800">{{ error }}</p>
          <button
            type="button"
            (click)="retry()"
            class="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      }

      <!-- Events Table -->
      @if (!store.loading() && !store.error()) {
        <div class="bg-white rounded-lg border border-[var(--color-border)] shadow-sm overflow-hidden">
          @if (store.hasEvents()) {
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-[var(--color-border)]">
                <thead class="bg-[var(--color-surface-alt)]">
                  <tr>
                    <th class="px-3 py-2 text-left">
                      <input
                        type="checkbox"
                        [checked]="allSelected()"
                        [indeterminate]="someSelected()"
                        (change)="toggleSelectAll()"
                        class="rounded border-[var(--color-border)] text-blue-600 focus:ring-blue-500"
                        aria-label="Select all events"
                      />
                    </th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Title
                    </th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Priority
                    </th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Date
                    </th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden lg:table-cell">
                      Location
                    </th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-[var(--color-border)]">
                  @for (event of store.events(); track event.id) {
                    <tr #eventRow
                        class="hover:bg-[var(--color-surface-alt)] transition-colors"
                        [class.bg-blue-50]="selectedIds().includes(event.id)">
                      <td class="px-3 py-2.5 whitespace-nowrap">
                        <input
                          type="checkbox"
                          [checked]="selectedIds().includes(event.id)"
                          (change)="toggleSelection(event.id)"
                          class="rounded border-[var(--color-border)] text-blue-600 focus:ring-blue-500"
                          aria-label="Select {{ event.title }}"
                        />
                      </td>
                      <td class="px-3 py-2.5 whitespace-nowrap">
                        <a
                          [routerLink]="['/events', event.id]"
                          class="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          {{ event.title }}
                        </a>
                      </td>
                      <td class="px-3 py-2.5 whitespace-nowrap">
                        <app-status-chip [status]="event.status" />
                      </td>
                      <td class="px-3 py-2.5 whitespace-nowrap">
                        <app-priority-badge [priority]="event.priority" />
                      </td>
                      <td class="px-3 py-2.5 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                        @if (event.starts_at) {
                          {{ formatDate(event.starts_at) }}
                        } @else {
                          <span class="text-[var(--color-text-muted)]">Not scheduled</span>
                        }
                      </td>
                      <td class="px-3 py-2.5 whitespace-nowrap text-sm text-[var(--color-text-secondary)] hidden lg:table-cell">
                        @if (event.location) {
                          {{ event.location }}
                        } @else {
                          <span class="text-[var(--color-text-muted)]">-</span>
                        }
                      </td>
                      <td class="px-3 py-2.5 whitespace-nowrap text-right text-sm">
                        <a
                          [routerLink]="['/events', event.id]"
                          class="text-blue-600 hover:text-blue-800 mr-2"
                          aria-label="View {{ event.title }}"
                        >
                          <svg class="w-4 h-4 inline-block lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span class="hidden lg:inline">View</span>
                        </a>
                        <a
                          [routerLink]="['/events', event.id, 'edit']"
                          class="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                          aria-label="Edit {{ event.title }}"
                        >
                          <svg class="w-4 h-4 inline-block lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span class="hidden lg:inline ml-2">Edit</span>
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="bg-[var(--color-surface-alt)] px-3 py-2.5 flex items-center justify-between border-t border-[var(--color-border)]">
              <div class="text-sm text-[var(--color-text-secondary)]">
                Showing {{ store.pagination().offset + 1 }} -
                {{ min(store.pagination().offset + store.events().length, store.pagination().total) }}
                of {{ store.pagination().total }} events
              </div>
              <div class="flex gap-2">
                <button
                  type="button"
                  (click)="previousPage()"
                  [disabled]="!store.hasPreviousPage() || store.loading()"
                  class="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span class="px-3 py-1.5 text-sm text-[var(--color-text-secondary)]">
                  Page {{ store.currentPage() }} of {{ store.totalPages() }}
                </span>
                <button
                  type="button"
                  (click)="nextPage()"
                  [disabled]="!store.hasNextPage() || store.loading()"
                  class="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          } @else {
            <!-- Empty State -->
            <div class="p-8 text-center">
              <p class="text-[var(--color-text-secondary)] mb-2">No events found</p>
              @if (store.filters().status || store.filters().search) {
                <p class="text-sm text-[var(--color-text-muted)]">
                  Try adjusting your filters or
                  <button
                    type="button"
                    (click)="resetFilters()"
                    class="text-blue-600 hover:text-blue-800 underline"
                  >
                    clear all filters
                  </button>
                </p>
              }
            </div>
          }
        </div>
      }

      <!-- Bulk Action Bar -->
      <app-bulk-action-bar
        [selectedIds]="selectedIds()"
        entityType="events"
        [actions]="bulkActions"
        (clearSelection)="clearSelection()"
      />
    </div>
  `,
})
export class EventListComponent implements OnInit {
  readonly store = inject(EventsStore);
  private readonly eventsService = inject(EventsService);

  searchInput = '';
  selectedStatus: EventStatus | null = null;

  readonly selectedIds = signal<string[]>([]);

  readonly allSelected = computed(() =>
    this.store.events().length > 0 && this.selectedIds().length === this.store.events().length
  );

  readonly someSelected = computed(() =>
    this.selectedIds().length > 0 && this.selectedIds().length < this.store.events().length
  );

  readonly statusOptions = Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => ({
    value: value as EventStatus,
    label,
  }));

  readonly bulkActions: BulkAction[] = [
    {
      label: 'Delete',
      icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      variant: 'danger',
      handler: () => this.bulkDelete(),
    },
    {
      label: 'Cancel',
      icon: 'M6 18L18 6M6 6l12 12',
      variant: 'primary',
      handler: () => this.bulkCancel(),
    },
  ];

  ngOnInit(): void {
    this.loadEvents();
  }

  async loadEvents(): Promise<void> {
    await this.store.loadEvents();
    this.searchInput = this.store.filters().search ?? '';
    this.selectedStatus = this.store.filters().status ?? null;
  }

  onSearchChange(value: string): void {
    this.store.setSearchFilter(value || null);
    this.loadEvents();
  }

  onStatusChange(value: EventStatus | null): void {
    this.store.setStatusFilter(value);
    this.loadEvents();
  }

  resetFilters(): void {
    this.searchInput = '';
    this.selectedStatus = null;
    this.store.resetFilters();
    this.loadEvents();
  }

  async nextPage(): Promise<void> {
    this.store.nextPage();
    await this.loadEvents();
  }

  async previousPage(): Promise<void> {
    this.store.previousPage();
    await this.loadEvents();
  }

  retry(): void {
    this.store.clearError();
    this.loadEvents();
  }

  toggleSelection(id: string): void {
    this.selectedIds.update(ids =>
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id],
    );
  }

  toggleSelectAll(): void {
    this.selectedIds.update(ids =>
      ids.length === this.store.events().length
        ? []
        : this.store.events().map(e => e.id),
    );
  }

  clearSelection(): void {
    this.selectedIds.set([]);
  }

  async bulkDelete(): Promise<void> {
    const ids = this.selectedIds();
    try {
      await Promise.all(ids.map(id => lastValueFrom(this.eventsService.deleteEvent(id))));
      this.clearSelection();
      await this.loadEvents();
    } catch {
      // Error handled by interceptor
    }
  }

  async bulkCancel(): Promise<void> {
    const ids = this.selectedIds();
    try {
      await Promise.all(
        ids.map(id => {
          const event = this.store.events().find(e => e.id === id);
          return lastValueFrom(this.eventsService.cancelEvent(id, event?.version ?? 1));
        }),
      );
      this.clearSelection();
      await this.loadEvents();
    } catch {
      // Error handled by interceptor
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  protected readonly focusedIndex = signal(-1);

  @ViewChildren('eventRow', { read: ElementRef }) private readonly eventRows!: QueryList<ElementRef<HTMLElement>>;

  onKeydown(event: KeyboardEvent): void {
    const events = this.store.events();
    if (events.length === 0) return;

    switch (event.key) {
      case 'j': {
        event.preventDefault();
        const next = Math.min(this.focusedIndex() + 1, events.length - 1);
        this.focusedIndex.set(next);
        (this.eventRows?.get(next)?.nativeElement.querySelector('a') as HTMLElement | null)?.focus();
        break;
      }
      case 'k': {
        event.preventDefault();
        const prev = Math.max(this.focusedIndex() - 1, 0);
        this.focusedIndex.set(prev);
        (this.eventRows?.get(prev)?.nativeElement.querySelector('a') as HTMLElement | null)?.focus();
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

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
