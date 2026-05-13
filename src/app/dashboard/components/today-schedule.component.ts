import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventsStore } from '../../events/stores/events.store';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-today-schedule',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StatusChipComponent],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-[var(--color-border)]">
      <div class="p-4 border-b border-[var(--color-border)]">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-[var(--color-text-primary)]">Today's Schedule</h2>
          <a
            routerLink="/events"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </a>
        </div>
      </div>

      <div class="p-4">
        @if (eventsStore.loading()) {
          <div class="space-y-3">
            @for (i of [1,2,3]; track i) {
              <div class="animate-pulse flex gap-3">
                <div class="h-10 w-10 bg-gray-200 rounded-lg"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            }
          </div>
        } @else if (todaysEvents().length === 0) {
          <div class="text-center py-6">
            <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-sm text-[var(--color-text-secondary)]">No events scheduled for today</p>
            <a
              routerLink="/events/create"
              class="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block"
            >
              Create your first event →
            </a>
          </div>
        } @else {
          <div class="space-y-3">
            @for (event of todaysEvents(); track event.id) {
              <a
                [routerLink]="['/events', event.id]"
                class="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors group"
              >
                <!-- Time Column -->
                <div class="flex-shrink-0 w-12 text-center">
                  <p class="text-xs font-semibold text-[var(--color-text-primary)]">
                    {{ formatTime(event.starts_at) }}
                  </p>
                  <p class="text-[10px] text-[var(--color-text-muted)]">
                    {{ formatDuration(event.starts_at, event.ends_at) }}
                  </p>
                </div>

                <!-- Event Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <h3 class="text-sm font-medium text-[var(--color-text-primary)] truncate group-hover:text-blue-600 transition-colors">
                      {{ event.title }}
                    </h3>
                    <app-status-chip [status]="event.status" />
                  </div>
                  @if (event.location) {
                    <p class="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                      <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {{ event.location }}
                    </p>
                  }
                </div>

                <!-- Arrow (desktop only) -->
                <svg
                  class="w-4 h-4 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block mt-0.5"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            }
          </div>
        }

        <!-- Upcoming Section -->
        @if (upcomingEvents().length > 0) {
          <div class="mt-4 pt-4 border-t border-[var(--color-border)]">
            <h3 class="text-xs font-medium text-[var(--color-text-secondary)] mb-2">Up Next (Tomorrow+)</h3>
            <div class="space-y-2">
              @for (event of upcomingEvents().slice(0, 3); track event.id) {
                <a
                  [routerLink]="['/events', event.id]"
                  class="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors group"
                >
                  <div class="flex-shrink-0 w-9 text-center">
                    <p class="text-xs font-medium text-[var(--color-text-primary)]">
                      {{ formatDay(event.starts_at) }}
                    </p>
                    <p class="text-[10px] text-[var(--color-text-muted)]">
                      {{ formatMonth(event.starts_at) }}
                    </p>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-[var(--color-text-primary)] truncate group-hover:text-blue-600 transition-colors">
                      {{ event.title }}
                    </p>
                    <p class="text-xs text-[var(--color-text-muted)]">
                      {{ formatTime(event.starts_at) }}
                    </p>
                  </div>
                </a>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class TodayScheduleComponent {
  readonly eventsStore = inject(EventsStore);

  readonly todaysEvents = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.eventsStore.events()
      .filter(event => {
        if (!event.starts_at) return false;
        const eventDate = new Date(event.starts_at);
        return eventDate >= today && eventDate < tomorrow;
      })
      .sort((a, b) => {
        if (!a.starts_at || !b.starts_at) return 0;
        return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
      });
  });

  readonly upcomingEvents = computed(() => {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.eventsStore.events()
      .filter(event => {
        if (!event.starts_at) return false;
        return new Date(event.starts_at) >= tomorrow;
      })
      .sort((a, b) => {
        if (!a.starts_at || !b.starts_at) return 0;
        return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
      });
  });

  formatTime(dateString: string | null): string {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  formatDuration(start: string | null, end: string | null): string {
    if (!start || !end) return '';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationMinutes = Math.round(durationMs / 60000);

    if (durationMinutes < 60) {
      return `${durationMinutes}m`;
    }
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  formatDay(dateString: string | null): string {
    if (!dateString) return '';
    return new Date(dateString).getDate().toString();
  }

  formatMonth(dateString: string | null): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short' });
  }
}
