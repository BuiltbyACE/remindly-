import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminStore } from './stores/admin.store';

@Component({
  selector: 'app-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  styles: [`
    :host { display: block; }

    .heading {
      margin-bottom: 28px;
    }

    .heading h1 {
      font-family: var(--font-heading);
      font-size: 26px;
      font-weight: 400;
      color: var(--color-text-primary);
      margin: 0 0 4px;
    }

    .heading p {
      font-size: 13.5px;
      color: var(--color-text-secondary);
      margin: 0;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 14px;
      padding: 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      transition: all .15s ease;
    }

    .card:hover {
      box-shadow: var(--shadow-md);
      border-color: var(--ocean-200);
    }

    .card-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .card-icon.users { background: var(--ocean-50); color: var(--ocean-600); }
    .card-icon.orgs { background: var(--pine-light); color: var(--pine); }

    .card-body { flex: 1; min-width: 0; }

    .card-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-muted);
      margin-bottom: 4px;
    }

    .card-value {
      font-family: var(--font-heading);
      font-size: 32px;
      font-weight: 400;
      color: var(--color-text-primary);
      line-height: 1.1;
    }

    .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .actions h3 {
      font-family: var(--font-heading);
      font-size: 18px;
      font-weight: 400;
      color: var(--color-text-primary);
      margin: 0 0 12px;
      width: 100%;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 22px;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 600;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      text-decoration: none;
      transition: all .15s ease;
    }

    .btn-primary {
      background: var(--ocean-700);
      color: #fff;
    }
    .btn-primary:hover { background: var(--ocean-800); }

    .btn-secondary {
      background: var(--color-surface);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
    }
    .btn-secondary:hover { background: var(--warm-50); border-color: var(--ocean-300); }

    @media (max-width: 640px) {
      .heading h1 { font-size: 22px; }
      .card-value { font-size: 28px; }
      .cards { grid-template-columns: 1fr; }
    }
  `],
  template: `
    <div class="heading">
      <h1>Dashboard</h1>
      <p>Platform overview and quick actions</p>
    </div>

    <div class="cards">
      <div class="card">
        <div class="card-icon users">
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
          </svg>
        </div>
        <div class="card-body">
          <div class="card-label">Total Users</div>
          <div class="card-value">{{ store.usersTotal() }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-icon orgs">
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </div>
        <div class="card-body">
          <div class="card-label">Total Organizations</div>
          <div class="card-value">{{ store.organizationsTotal() }}</div>
        </div>
      </div>
    </div>

    <div class="actions">
      <h3>Quick Actions</h3>
      <a routerLink="/admin/users" class="btn btn-primary">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
        Create User
      </a>
      <a routerLink="/admin/organizations" class="btn btn-secondary">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
        Create Organization
      </a>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  readonly store = inject(AdminStore);

  ngOnInit(): void {
    this.store.loadUsers();
    this.store.loadOrganizations();
  }
}
