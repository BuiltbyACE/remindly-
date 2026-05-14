import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventsStore } from '../../events/stores/events.store';

@Component({
  selector: 'app-today-schedule',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  styles: [`
    :host { display: block; }

    .card {
      background: #fff;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,.05);
    }

    /* Header */
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #E2E8F0;
    }
    .head-title {
      font-size: 14px;
      font-weight: 700;
      color: #0F172A;
      display: flex; align-items: center; gap: 8px;
    }
    .head-icon {
      width: 26px; height: 26px;
      border-radius: 7px;
      background: #1565C0;
      display: flex; align-items: center; justify-content: center;
    }
    .view-all {
      font-size: 12.5px;
      font-weight: 600;
      color: #1565C0;
      text-decoration: none;
    }
    .view-all:hover { color: #0D2137; }

    /* Event rows */
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      text-decoration: none;
      border-left: 3px solid transparent;
      transition: background var(--transition);
    }
    .row:hover { background: #F8FAFC; }
    .row:not(:last-child) { border-bottom: 1px solid #F1F5F9; }

    /* Priority left-bar: keep just blue tones and red for critical */
    .row.p-critical { border-left-color: #DC2626; }
    .row.p-high     { border-left-color: #1E88E5; }
    .row.p-medium   { border-left-color: #64B5F6; }
    .row.p-low      { border-left-color: #CBD5E1; }
    .row.s-active   { border-left-color: #1565C0; }

    .time { flex-shrink: 0; width: 52px; text-align: right; }
    .time-main { font-size: 12.5px; font-weight: 700; color: #0F172A; }
    .time-dur  { font-size: 11px; color: #94A3B8; margin-top: 1px; }

    .dot-wrap { flex-shrink: 0; }
    .dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #1565C0;
    }
    .dot.critical { background: #DC2626; }
    .dot.active { background: #1565C0; animation: blink 1.6s ease-in-out infinite; }

    @keyframes blink {
      0%, 100% { opacity: 1; } 50% { opacity: .3; }
    }

    .info { flex: 1; min-width: 0; }
    .ev-title {
      font-size: 13.5px; font-weight: 600; color: #0F172A;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      margin-bottom: 2px;
    }
    .row:hover .ev-title { color: #1565C0; }
    .ev-loc {
      font-size: 11.5px; color: #94A3B8;
      display: flex; align-items: center; gap: 3px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    /* Small badge */
    .badge {
      font-size: 10.5px; font-weight: 600;
      padding: 2px 8px; border-radius: 50px; flex-shrink: 0;
    }
    .badge-blue   { background: #EFF6FF; color: #1565C0; }
    .badge-red    { background: #FEF2F2; color: #DC2626; }
    .badge-live   { background: #1565C0; color: #fff; }

    /* Empty */
    .empty {
      padding: 36px 20px;
      text-align: center;
    }
    .empty-icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      background: #EFF6FF;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 12px;
    }
    .empty-title { font-size: 14px; font-weight: 600; color: #0F172A; margin: 0 0 4px; }
    .empty-sub   { font-size: 12.5px; color: #94A3B8; margin: 0 0 12px; }
    .empty-link  { font-size: 13px; font-weight: 600; color: #1565C0; text-decoration: none; }

    /* Up next strip */
    .up-next {
      padding: 14px 20px;
      border-top: 1px solid #F1F5F9;
      background: #F8FAFC;
    }
    .up-label {
      font-size: 10.5px; font-weight: 700; letter-spacing: .08em;
      text-transform: uppercase; color: #94A3B8; margin-bottom: 10px;
    }
    .chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; }
    .chips::-webkit-scrollbar { height: 3px; }
    .chips::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }

    .chip {
      flex-shrink: 0; min-width: 170px;
      display: flex; align-items: center; gap: 10px;
      padding: 8px 12px;
      background: #fff;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      text-decoration: none;
      transition: border-color var(--transition), box-shadow var(--transition);
    }
    .chip:hover { border-color: #1565C0; box-shadow: 0 2px 8px rgba(21,101,192,.1); }

    .chip-cal {
      width: 36px; height: 36px; border-radius: 8px;
      background: #1565C0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; flex-shrink: 0;
    }
    .chip-day { font-size: 13px; font-weight: 800; color: #fff; line-height: 1; }
    .chip-mon { font-size: 8.5px; font-weight: 600; color: rgba(255,255,255,.75); text-transform: uppercase; }

    .chip-info { min-width: 0; }
    .chip-title {
      font-size: 12.5px; font-weight: 600; color: #0F172A;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .chip-time { font-size: 11px; color: #94A3B8; }
  `],
  template: `
    <div class="card">
      <!-- Head -->
      <div class="head">
        <h2 class="head-title">
          <span class="head-icon">
            <svg width="13" height="13" fill="none" stroke="#fff" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </span>
          Today's Schedule
        </h2>
        <a routerLink="/events" class="view-all">View all →</a>
      </div>

      <!-- Rows -->
      @if (eventsStore.loading()) {
        @for (i of [1,2,3]; track i) {
          <div style="display:flex;gap:12px;padding:14px 20px;align-items:center">
            <div style="width:52px;height:28px;border-radius:6px;background:#F1F5F9;animation:pulse 1.5s infinite"></div>
            <div style="flex:1">
              <div style="height:12px;border-radius:6px;background:#F1F5F9;animation:pulse 1.5s infinite;margin-bottom:5px;width:65%"></div>
              <div style="height:10px;border-radius:6px;background:#F1F5F9;animation:pulse 1.5s infinite;width:40%"></div>
            </div>
          </div>
        }
      } @else if (todaysEvents().length === 0) {
        <div class="empty">
          <div class="empty-icon">
            <svg width="20" height="20" fill="none" stroke="#1565C0" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <p class="empty-title">No events today</p>
          <p class="empty-sub">Your schedule is free</p>
          <a routerLink="/events/create" class="empty-link">+ Create an event</a>
        </div>
      } @else {
        @for (event of todaysEvents(); track event.id) {
          <a
            [routerLink]="['/events', event.id]"
            class="row"
            [class.p-critical]="event.priority === 'critical'"
            [class.p-high]="event.priority === 'high'"
            [class.p-medium]="event.priority === 'medium'"
            [class.p-low]="event.priority === 'low'"
            [class.s-active]="event.status === 'active'"
          >
            <div class="time">
              <p class="time-main">{{ formatTime(event.starts_at) }}</p>
              <p class="time-dur">{{ formatDuration(event.starts_at, event.ends_at) }}</p>
            </div>
            <div class="dot-wrap">
              <div class="dot"
                   [class.critical]="event.priority === 'critical'"
                   [class.active]="event.status === 'active'">
              </div>
            </div>
            <div class="info">
              <p class="ev-title">{{ event.title }}</p>
              @if (event.location) {
                <p class="ev-loc">
                  <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                  {{ event.location }}
                </p>
              }
            </div>
            @if (event.status === 'active') {
              <span class="badge badge-live">Live</span>
            } @else if (event.priority === 'critical') {
              <span class="badge badge-red">Critical</span>
            } @else if (event.status === 'scheduled') {
              <span class="badge badge-blue">Confirmed</span>
            }
          </a>
        }
      }

      <!-- Up Next -->
      @if (upcomingEvents().length > 0) {
        <div class="up-next">
          <p class="up-label">Up Next</p>
          <div class="chips">
            @for (event of upcomingEvents().slice(0, 4); track event.id) {
              <a [routerLink]="['/events', event.id]" class="chip">
                <div class="chip-cal">
                  <span class="chip-day">{{ formatDay(event.starts_at) }}</span>
                  <span class="chip-mon">{{ formatMonth(event.starts_at) }}</span>
                </div>
                <div class="chip-info">
                  <p class="chip-title">{{ event.title }}</p>
                  <p class="chip-time">{{ formatTime(event.starts_at) }}</p>
                </div>
              </a>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class TodayScheduleComponent {
  readonly eventsStore = inject(EventsStore);

  readonly todaysEvents = computed(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    return this.eventsStore.events()
      .filter(e => { if (!e.starts_at) return false; const d = new Date(e.starts_at); return d >= today && d < tomorrow; })
      .sort((a, b) => new Date(a.starts_at ?? 0).getTime() - new Date(b.starts_at ?? 0).getTime());
  });

  readonly upcomingEvents = computed(() => {
    const tomorrow = new Date(); tomorrow.setHours(0,0,0,0); tomorrow.setDate(tomorrow.getDate() + 1);
    return this.eventsStore.events()
      .filter(e => e.starts_at && new Date(e.starts_at) >= tomorrow)
      .sort((a, b) => new Date(a.starts_at ?? 0).getTime() - new Date(b.starts_at ?? 0).getTime());
  });

  formatTime(d: string | null): string {
    if (!d) return '--:--';
    return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  formatDuration(s: string | null, e: string | null): string {
    if (!s || !e) return '';
    const m = Math.round((new Date(e).getTime() - new Date(s).getTime()) / 60000);
    return m < 60 ? `${m}m` : `${Math.floor(m/60)}h${m%60 ? ' '+m%60+'m' : ''}`;
  }
  formatDay(d: string | null): string { return d ? new Date(d).getDate().toString() : ''; }
  formatMonth(d: string | null): string { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short' }) : ''; }
}
