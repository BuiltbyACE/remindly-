import { Component, ChangeDetectionStrategy, inject, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthStore } from '../auth/stores/auth.store';
import { OrganizationStore } from '../organizations/stores/organization.store';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-[var(--color-text-primary)]">Dashboard</h1>
          <p class="text-sm text-[var(--color-text-secondary)] mt-1">
            Welcome back, {{ authStore.userDisplayName() }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-[var(--color-text-muted)]">{{ today | date:'EEEE, MMMM d, y' }}</p>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Today's Events -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-[var(--color-text-secondary)]">Today's Events</span>
          </div>
          <p class="text-3xl font-bold text-[var(--color-text-primary)]">3</p>
          <p class="text-xs text-[var(--color-text-muted)] mt-1">2 confirmed, 1 pending</p>
        </div>

        <!-- Pending Approvals -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-[var(--color-text-secondary)]">Pending Approvals</span>
          </div>
          <p class="text-3xl font-bold text-[var(--color-text-primary)]">2</p>
          <p class="text-xs text-[var(--color-text-muted)] mt-1">Requires your action</p>
        </div>

        <!-- Unread Notifications -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span class="text-sm font-medium text-[var(--color-text-secondary)]">Notifications</span>
          </div>
          <p class="text-3xl font-bold text-[var(--color-text-primary)]">5</p>
          <p class="text-xs text-[var(--color-text-muted)] mt-1">3 unread</p>
        </div>

        <!-- Organization -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span class="text-sm font-medium text-[var(--color-text-secondary)]">Organization</span>
          </div>
          <p class="text-lg font-semibold text-[var(--color-text-primary)] truncate">
            {{ orgStore.activeOrganization()?.name ?? 'Loading...' }}
          </p>
          <p class="text-xs text-[var(--color-text-muted)] mt-1">
            {{ orgStore.organizations().length }} org(s) available
          </p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
        <h2 class="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Quick Actions</h2>
        <div class="flex flex-wrap gap-3">
          <button class="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            Create Event
          </button>
          <button class="px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm font-medium hover:bg-[var(--color-surface-alt)] transition-colors">
            View Calendar
          </button>
          <button class="px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm font-medium hover:bg-[var(--color-surface-alt)] transition-colors">
            AI Briefing
          </button>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly orgStore = inject(OrganizationStore);
  readonly today = new Date();

  ngOnInit(): void {
    // Dashboard data will be loaded here
  }
}
