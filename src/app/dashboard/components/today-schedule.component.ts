import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventsStore } from '../../events/stores/events.store';

@Component({
  selector: 'app-today-schedule',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <div class="p-5 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-bold text-gray-900">Today's Schedule</h2>
          <a
            routerLink="/events"
            class="text-sm text-blue-600 hover:text-blue-800 font-semibold"
          >
            View All →
          </a>
        </div>
      </div>

      <div class="p-5">
        @if (eventsStore.loading()) {
          <div class="space-y-4">
            @for (i of [1,2,3]; track i) {
              <div class="animate-pulse flex gap-4">
                <div class="h-12 w-12 bg-gray-200 rounded-lg"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            }
          </div>
        } @else if (todaysEvents().length === 0) {
          <div class="text-center py-8">
            <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <svg aria-hidden="true" class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-sm text-gray-500">No events scheduled for today</p>
            <a
              routerLink="/events/create"
              class="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block"
            >
              Create your first event →
            </a>
          </div>
        } @else {
          <div class="space-y-4">
            @for (event of todaysEvents(); track event.id) {
              <a
                [routerLink]="['/events', event.id]"
                class="flex items-start gap-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group border-b border-gray-100 last:border-0"
              >
                <!-- Time Column -->
                <div class="flex-shrink-0 w-16 text-center">
                  <p class="text-sm font-bold text-gray-900">
                    {{ formatTime(event.starts_at) }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ formatDuration(event.starts_at, event.ends_at) }}
                  </p>
                </div>

                <!-- Dot -->
                <div class="flex-shrink-0 mt-1.5">
                  <div class="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>

                <!-- Event Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {{ event.title }}
                    </h3>
                    @if (event.status === 'scheduled') {
                      <span class="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">Confirmed</span>
                    } @else if (event.priority === 'critical' || event.priority === 'high') {
                      <span class="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">High Priority</span>
                    } @else if (event.status === 'active') {
                      <span class="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">In Progress</span>
                    }
                  </div>
                  @if (event.location) {
                    <p class="text-xs text-gray-500 flex items-center gap-1">
                      <svg aria-hidden="true" class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {{ event.location }}
                    </p>
                  }
                </div>

                <!-- Arrow -->
                <svg
                  class="w-5 h-5 text-gray-400 mt-1"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            }
          </div>
        }

        <!-- Up Next Section -->
        @if (upcomingEvents().length > 0) {
          <div class="mt-6 pt-5 border-t border-gray-200">
            <h3 class="text-sm font-bold text-gray-900 mb-4">Up Next (Tomorrow+)</h3>
            <div class="flex gap-3 overflow-x-auto pb-2">
              @for (event of upcomingEvents().slice(0, 3); track event.id) {
                <a
                  [routerLink]="['/events', event.id]"
                  class="flex-shrink-0 flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group min-w-[200px]"
                >
                  <div class="flex-shrink-0 w-12 h-12 bg-white rounded-lg shadow-sm flex flex-col items-center justify-center border border-gray-200">
                    <p class="text-lg font-bold text-gray-900 leading-none">
                      {{ formatDay(event.starts_at) }}
                    </p>
                    <p class="text-xs text-gray-500 uppercase">
                      {{ formatMonth(event.starts_at) }}
                    </p>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600">
                      {{ event.title }}
                    </p>
                    <p class="text-xs text-gray-500">
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
