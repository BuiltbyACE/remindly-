import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AdminStore } from '../stores/admin.store';
import type { AdminUser, AdminRole, AdminCreateUserRequest } from '../models/admin.model';

@Component({
  selector: 'app-admin-users',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe],
  styles: [`
    :host { display: block; }

    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 200px;
      max-width: 320px;
    }

    .search-box input {
      width: 100%;
      padding: 9px 12px 9px 36px;
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--color-text-primary);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      outline: none;
      transition: all .15s ease;
    }

    .search-box input:focus {
      border-color: var(--ocean-400);
      box-shadow: 0 0 0 3px rgba(90,158,207,.12);
    }

    .search-box svg {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-muted);
      pointer-events: none;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 18px;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all .15s ease;
    }

    .btn-primary {
      background: var(--ocean-700);
      color: #fff;
    }

    .btn-primary:hover { background: var(--ocean-800); }

    .btn-ghost {
      background: transparent;
      color: var(--color-text-secondary);
      padding: 6px;
    }

    .btn-ghost:hover { color: var(--color-text-primary); background: var(--warm-50); }

    .btn-danger {
      background: transparent;
      color: var(--color-critical);
      padding: 6px;
    }

    .btn-danger:hover { background: #FDF6F4; }

    .btn-sm { padding: 6px 12px; font-size: 12px; }

    .table-wrap {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      text-align: left;
      padding: 12px 16px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .06em;
      color: var(--color-text-muted);
      background: var(--warm-50);
      border-bottom: 1px solid var(--color-border);
    }

    td {
      padding: 12px 16px;
      font-size: 13px;
      color: var(--color-text-primary);
      border-bottom: 1px solid var(--color-border);
    }

    tr:last-child td { border-bottom: none; }

    tr:hover td { background: var(--warm-50); }

    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 50px;
      font-size: 11px;
      font-weight: 600;
    }

    .badge-active { background: var(--pine-light); color: var(--pine); }
    .badge-inactive { background: #F5E0DB; color: var(--color-critical); }

    .empty {
      text-align: center;
      padding: 48px 24px;
      color: var(--color-text-muted);
    }

    .empty p { font-size: 14px; margin: 0 0 4px; }
    .empty small { font-size: 12px; }

    /* ── Modal ── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 100;
      background: rgba(10,25,41,.4);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal {
      background: var(--color-surface);
      border-radius: 16px;
      padding: 28px;
      width: 100%;
      max-width: 440px;
      box-shadow: var(--shadow-lg);
    }

    .modal h3 {
      font-family: var(--font-heading);
      font-size: 20px;
      font-weight: 400;
      margin: 0 0 4px;
    }

    .modal p { font-size: 13px; color: var(--color-text-secondary); margin: 0 0 20px; }

    .field { margin-bottom: 16px; }

    .field label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-secondary);
      margin-bottom: 6px;
    }

    .field input, .field select {
      width: 100%;
      padding: 9px 12px;
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--color-text-primary);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      outline: none;
    }

    .field input:focus, .field select:focus {
      border-color: var(--ocean-400);
      box-shadow: 0 0 0 3px rgba(90,158,207,.12);
    }

    .input-wrap { position: relative; }

    .input-wrap input { padding-right: 36px; }

    .toggle-pw {
      position: absolute;
      right: 6px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      padding: 6px;
      color: var(--color-text-muted);
      cursor: pointer;
      display: flex;
      border-radius: 6px;
      transition: color 0.15s;
    }

    .toggle-pw:hover { color: var(--ocean-600); }

    .modal-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .btn-cancel {
      padding: 9px 18px;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 500;
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      cursor: pointer;
      color: var(--color-text-secondary);
    }

    .btn-cancel:hover { background: var(--warm-50); }
  `],
  template: `
    <div>
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-box">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            [value]="searchQuery()"
            (input)="onSearch($event)"
            placeholder="Search users..."
          />
        </div>
        <button class="btn btn-primary" (click)="showCreateModal.set(true)">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
          </svg>
          Add User
        </button>
      </div>

      <!-- Error -->
      @if (store.error(); as err) {
        <div style="padding:10px 14px;background:#FDF6F4;border:1px solid #E8D0C8;border-radius:8px;font-size:13px;color:#8B3F2E;margin-bottom:12px">
          {{ err }}
          <button class="btn btn-ghost" style="float:right" (click)="store.clearError()">Dismiss</button>
        </div>
      }

      <!-- Table -->
      <div class="table-wrap">
        @if (store.loading() && store.users().length === 0) {
          <div class="empty"><p>Loading users...</p></div>
        } @else if (store.users().length === 0) {
          <div class="empty">
            <p>No users found</p>
            <small>Add a new user to get started</small>
          </div>
        } @else {
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Orgs</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (user of store.users(); track user.id) {
                <tr>
                  <td style="font-weight:500">{{ user.full_name }}</td>
                  <td style="color:var(--color-text-secondary)">{{ user.email }}</td>
                  <td>
                    @if (user.is_active) {
                      <span class="badge badge-active">Active</span>
                    } @else {
                      <span class="badge badge-inactive">Inactive</span>
                    }
                  </td>
                  <td style="color:var(--color-text-secondary)">{{ user.organization_count ?? 0 }}</td>
                  <td style="color:var(--color-text-muted);font-size:12px">{{ user.created_at | date:'shortDate' }}</td>
                  <td style="text-align:right">
                    <button class="btn btn-ghost" (click)="deactivate(user)" title="Deactivate user">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>

    <!-- Success Modal -->
    @if (showSuccessModal()) {
      <div class="modal-overlay" (click)="showSuccessModal.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>User Created</h3>
          <p>{{ createdUserName() }} can now log in with the provided password.</p>
          <div class="modal-actions">
            <button class="btn btn-primary" (click)="showSuccessModal.set(false)">Done</button>
          </div>
        </div>
      </div>
    }

    <!-- Create User Modal -->
    @if (showCreateModal()) {
      <div class="modal-overlay" (click)="showCreateModal.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Add User</h3>
          <p>Create a new user</p>

          <div class="field">
            <label for="name">Full Name</label>
            <input id="name" type="text" [(ngModel)]="formName" placeholder="e.g. Jane Doe" />
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" [(ngModel)]="formEmail" placeholder="jane@company.com" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <div class="input-wrap">
              <input id="password" [type]="showPassword() ? 'text' : 'password'" [(ngModel)]="formPassword" placeholder="Set a password for the user" />
              <button type="button" class="toggle-pw" (click)="showPassword.update(v => !v)" aria-label="Toggle password visibility">
                @if (showPassword()) {
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                } @else {
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                }
              </button>
            </div>
          </div>
          <div class="field">
            <label for="org">Organization</label>
            <select id="org" [(ngModel)]="formOrgId">
              <option value="">Select organization...</option>
              @for (org of store.organizations(); track org.id) {
                <option [value]="org.id">{{ org.name }}</option>
              }
            </select>
          </div>
          <div class="field">
            <label for="role">Role</label>
            <select id="role" [(ngModel)]="formRoleSlug">
              <option value="">Select role...</option>
              @for (role of store.roles(); track role.id) {
                <option [value]="role.slug">{{ role.name }}</option>
              }
            </select>
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" (click)="showCreateModal.set(false)">Cancel</button>
            <button class="btn btn-primary" [disabled]="!canSubmit()" (click)="submitCreate()">
              @if (store.loading()) { Creating... } @else { Create User }
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminUsersComponent implements OnInit {
  readonly store = inject(AdminStore);
  readonly searchQuery = signal('');
  readonly showCreateModal = signal(false);
  readonly showSuccessModal = signal(false);
  readonly createdUserName = signal('');
  readonly formName = signal('');
  readonly formEmail = signal('');
  readonly formPassword = signal('');
  readonly showPassword = signal(false);
  readonly formOrgId = signal('');
  readonly formRoleSlug = signal('');

  ngOnInit(): void {
    this.store.loadUsers();
    this.store.loadOrganizations();
    this.store.loadRoles();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.store.loadUsers(value || undefined);
  }

  canSubmit(): boolean {
    return !!this.formName() && !!this.formEmail() && !!this.formPassword() && !!this.formOrgId() && !!this.formRoleSlug();
  }

  async submitCreate(): Promise<void> {
    if (!this.canSubmit()) return;
    const name = this.formName();
    const result = await this.store.createUser({
      email: this.formEmail(),
      full_name: name,
      password: this.formPassword(),
      organization_id: this.formOrgId(),
      role_slug: this.formRoleSlug(),
    });
    if (result) {
      this.showCreateModal.set(false);
      this.createdUserName.set(name);
      this.showSuccessModal.set(true);
      this.formName.set('');
      this.formEmail.set('');
      this.formPassword.set('');
      this.formOrgId.set('');
      this.formRoleSlug.set('');
    }
  }

  async deactivate(user: AdminUser): Promise<void> {
    if (!user.is_active) return;
    if (!confirm(`Deactivate ${user.full_name}?`)) return;
    await this.store.deactivateUser(user.id);
  }
}
