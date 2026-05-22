import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminStore } from '../stores/admin.store';
import type { AdminOrganization } from '../models/admin.model';

@Component({
  selector: 'app-admin-orgs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
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
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      outline: none;
    }

    .search-box input:focus {
      border-color: var(--ocean-400);
      box-shadow: 0 0 0 3px rgba(90,158,207,.12);
    }

    .search-box svg {
      position: absolute;
      left: 10px; top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-muted);
      pointer-events: none;
    }

    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 18px; font-family: var(--font-body);
      font-size: 13px; font-weight: 600; border: none;
      border-radius: 8px; cursor: pointer; transition: all .15s;
    }

    .btn-primary { background: var(--ocean-700); color: #fff; }
    .btn-primary:hover { background: var(--ocean-800); }
    .btn-ghost { background: transparent; color: var(--color-text-secondary); padding: 6px; }
    .btn-ghost:hover { color: var(--color-text-primary); background: var(--warm-50); }
    .btn-danger { background: transparent; color: var(--color-critical); padding: 6px; }
    .btn-danger:hover { background: #FDF6F4; }
    .btn-sm { padding: 6px 12px; font-size: 12px; }
    .btn-cancel {
      padding: 9px 18px; font-family: var(--font-body);
      font-size: 13px; font-weight: 500;
      background: transparent; border: 1px solid var(--color-border);
      border-radius: 8px; cursor: pointer; color: var(--color-text-secondary);
    }

    .table-wrap {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      overflow: hidden;
    }

    table { width: 100%; border-collapse: collapse; }

    th {
      text-align: left; padding: 12px 16px;
      font-size: 11px; font-weight: 600; text-transform: uppercase;
      letter-spacing: .06em; color: var(--color-text-muted);
      background: var(--warm-50); border-bottom: 1px solid var(--color-border);
    }

    td {
      padding: 12px 16px; font-size: 13px;
      color: var(--color-text-primary);
      border-bottom: 1px solid var(--color-border);
    }

    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--warm-50); }

    .badge {
      display: inline-block; padding: 2px 10px;
      border-radius: 50px; font-size: 11px; font-weight: 600;
    }

    .badge-active { background: var(--pine-light); color: var(--pine); }
    .badge-inactive { background: #F5E0DB; color: var(--color-critical); }

    .empty { text-align: center; padding: 48px 24px; color: var(--color-text-muted); }
    .empty p { font-size: 14px; margin: 0 0 4px; }
    .empty small { font-size: 12px; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; z-index: 100;
      background: rgba(10,25,41,.4); backdrop-filter: blur(2px);
      display: flex; align-items: center; justify-content: center;
    }

    .modal {
      background: var(--color-surface); border-radius: 16px;
      padding: 28px; width: 100%; max-width: 440px;
      box-shadow: var(--shadow-lg);
    }

    .modal h3 { font-family: var(--font-heading); font-size: 20px; font-weight: 400; margin: 0 0 4px; }
    .modal p { font-size: 13px; color: var(--color-text-secondary); margin: 0 0 20px; }

    .field { margin-bottom: 16px; }

    .field label {
      display: block; font-size: 12px; font-weight: 600;
      color: var(--color-text-secondary); margin-bottom: 6px;
    }

    .field input, .field select {
      width: 100%; padding: 9px 12px;
      font-family: var(--font-body); font-size: 13px;
      color: var(--color-text-primary);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 8px; outline: none;
    }

    .field input:focus, .field select:focus {
      border-color: var(--ocean-400);
      box-shadow: 0 0 0 3px rgba(90,158,207,.12);
    }

    .modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px; }
  `],
  template: `
    <div>
      <div class="toolbar">
        <div class="search-box">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" [value]="searchQuery()" (input)="onSearch($event)" placeholder="Search organizations..." />
        </div>
        <button class="btn btn-primary" (click)="showCreateModal.set(true)">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
          </svg>
          Add Organization
        </button>
      </div>

      @if (store.error(); as err) {
        <div style="padding:10px 14px;background:#FDF6F4;border:1px solid #E8D0C8;border-radius:8px;font-size:13px;color:#8B3F2E;margin-bottom:12px">
          {{ err }}
          <button class="btn btn-ghost" style="float:right" (click)="store.clearError()">Dismiss</button>
        </div>
      }

      <div class="table-wrap">
        @if (store.loading() && store.organizations().length === 0) {
          <div class="empty"><p>Loading organizations...</p></div>
        } @else if (store.organizations().length === 0) {
          <div class="empty"><p>No organizations found</p></div>
        } @else {
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Type</th>
                <th>Members</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (org of store.organizations(); track org.id) {
                <tr>
                  <td style="font-weight:500">{{ org.name }}</td>
                  <td style="color:var(--color-text-secondary);font-family:var(--font-mono);font-size:12px">{{ org.slug }}</td>
                  <td style="color:var(--color-text-secondary)">{{ org.organization_type }}</td>
                  <td style="color:var(--color-text-secondary)">{{ org.member_count ?? 0 }}</td>
                  <td>
                    @if (org.is_active) {
                      <span class="badge badge-active">Active</span>
                    } @else {
                      <span class="badge badge-inactive">Inactive</span>
                    }
                  </td>
                  <td style="text-align:right">
                    <button class="btn btn-ghost" (click)="deactivate(org)" title="Deactivate org">
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

    <!-- Create Org Modal -->
    @if (showCreateModal()) {
      <div class="modal-overlay" (click)="showCreateModal.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Add Organization</h3>
          <p>Create a new organization</p>

          <div class="field">
            <label for="orgName">Name</label>
            <input id="orgName" type="text" [(ngModel)]="formName" placeholder="e.g. University of Lagos" />
          </div>
          <div class="field">
            <label for="orgSlug">Slug</label>
            <input id="orgSlug" type="text" [(ngModel)]="formSlug" placeholder="e.g. unilag" />
          </div>
          <div class="field">
            <label for="orgType">Type</label>
            <select id="orgType" [(ngModel)]="formType">
              <option value="university">University</option>
              <option value="corporate">Corporate</option>
              <option value="government">Government</option>
              <option value="nonprofit">Non-Profit</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" (click)="showCreateModal.set(false)">Cancel</button>
            <button class="btn btn-primary" [disabled]="!canSubmit()" (click)="submitCreate()">
              @if (store.loading()) { Creating... } @else { Create Organization }
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminOrganizationsComponent implements OnInit {
  readonly store = inject(AdminStore);
  readonly searchQuery = signal('');
  readonly showCreateModal = signal(false);
  readonly formName = signal('');
  readonly formSlug = signal('');
  readonly formType = signal('university');

  ngOnInit(): void {
    this.store.loadOrganizations();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.store.loadOrganizations(value || undefined);
  }

  canSubmit(): boolean {
    return !!this.formName() && !!this.formSlug();
  }

  async submitCreate(): Promise<void> {
    if (!this.canSubmit()) return;
    const success = await this.store.createOrganization({
      name: this.formName(),
      slug: this.formSlug(),
      organization_type: this.formType(),
    });
    if (success) {
      this.showCreateModal.set(false);
      this.formName.set('');
      this.formSlug.set('');
      this.formType.set('university');
    }
  }

  async deactivate(org: AdminOrganization): Promise<void> {
    if (!org.is_active) return;
    if (!confirm(`Deactivate ${org.name}?`)) return;
    await this.store.updateOrganization(org.id, { is_active: false });
  }
}
