import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminStore } from './stores/admin.store';

@Component({
  selector: 'app-admin-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  styles: [`
    :host { display: block; }

    .page-heading {
      margin-bottom: 24px;
    }

    .page-heading h1 {
      font-family: var(--font-heading);
      font-size: 26px;
      font-weight: 400;
      color: var(--color-text-primary);
      margin: 0 0 4px;
    }

    .page-heading p {
      font-size: 13.5px;
      color: var(--color-text-secondary);
      margin: 0;
    }

    .tabs {
      display: flex;
      gap: 4px;
      background: var(--warm-50);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 4px;
      margin-bottom: 24px;
    }

    @media (max-width: 640px) {
      .tabs {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        border-radius: 10px;
        gap: 2px;
      }
      .tabs::-webkit-scrollbar { display: none; }
    }

    .tab {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: all .15s ease;
      white-space: nowrap;
    }

    .tab:hover {
      color: var(--color-text-primary);
      background: rgba(255,255,255,.5);
    }

    .tab.active {
      background: var(--color-surface);
      color: var(--ocean-700);
      box-shadow: var(--shadow-sm);
      font-weight: 600;
    }

    @media (max-width: 640px) {
      .page-heading h1 { font-size: 22px; }
      .page-heading p { font-size: 13px; }
      .tab { padding: 10px 16px; font-size: 12px; }
    }
  `],
  template: `
    <div>
      <div class="page-heading">
        <h1>Administration</h1>
        <p>Manage users, organizations, and memberships</p>
      </div>

      <div class="tabs">
        <a routerLink="users" routerLinkActive="active" class="tab">Users</a>
        <a routerLink="organizations" routerLinkActive="active" class="tab">Organizations</a>
        <a routerLink="members" routerLinkActive="active" class="tab">Members</a>
      </div>

      <router-outlet />
    </div>
  `,
})
export class AdminShellComponent implements OnInit {
  readonly store = inject(AdminStore);

  ngOnInit(): void {
    this.store.loadRoles();
  }
}
