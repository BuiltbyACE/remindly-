import { Component, ChangeDetectionStrategy, inject, signal, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminStore } from '../stores/admin.store';
import { Location } from '@angular/common';

@Component({
  selector: 'app-admin-members',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  styles: [`
    :host { display: block; }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .org-select {
      flex: 1;
      min-width: 200px;
      max-width: 320px;
    }

    .org-select select {
      width: 100%;
      padding: 9px 12px;
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--color-text-primary);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      outline: none;
      cursor: pointer;
    }

    .org-select select:focus {
      border-color: var(--ocean-400);
      box-shadow: 0 0 0 3px rgba(90,158,207,.12);
    }

    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 18px; font-family: var(--font-body);
      font-size: 13px; font-weight: 600; border: none;
      border-radius: 8px; cursor: pointer; transition: all .15s;
      white-space: nowrap;
    }

    .btn-primary { background: var(--ocean-700); color: #fff; }
    .btn-primary:hover { background: var(--ocean-800); }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .btn-ghost { background: transparent; color: var(--color-text-secondary); padding: 6px; border: none; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; }
    .btn-ghost:hover { color: var(--color-text-primary); background: var(--warm-50); }
    .btn-danger { background: transparent; color: var(--color-critical); padding: 6px 10px; font-size: 12px; }
    .btn-danger:hover { background: #FDF6F4; }
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

    .role-badge {
      background: var(--ocean-50);
      color: var(--ocean-600);
      margin-right: 4px;
    }

    .empty {
      text-align: center; padding: 48px 24px; color: var(--color-text-muted);
    }

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
      @if (id) {
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <button class="btn btn-ghost" (click)="location.back()" style="padding:6px">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h2 style="font-family:var(--font-heading);font-size:20px;font-weight:400;margin:0;color:var(--color-text-primary)">Organization Members</h2>
            @if (selectedOrgId()) {
              @for (org of store.organizations(); track org.id) {
                @if (org.id === selectedOrgId()) {
                  <p style="font-size:13px;color:var(--color-text-secondary);margin:2px 0 0">{{ org.name }}</p>
                }
              }
            }
          </div>
        </div>
      }

      <div class="toolbar">
        <div class="org-select">
          <select [value]="selectedOrgId()" (change)="onOrgChange($event)">
            <option value="">Select an organization...</option>
            @for (org of store.organizations(); track org.id) {
              <option [value]="org.id">{{ org.name }}</option>
            }
          </select>
        </div>
        @if (selectedOrgId()) {
          <button class="btn btn-primary btn-sm" (click)="showAddModal.set(true)">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            Add Member
          </button>
        }
      </div>

      @if (store.error(); as err) {
        <div style="padding:10px 14px;background:#FDF6F4;border:1px solid #E8D0C8;border-radius:8px;font-size:13px;color:#8B3F2E;margin-bottom:12px">
          {{ err }}
          <button class="btn btn-cancel" style="float:right;padding:2px 8px" (click)="store.clearError()">Dismiss</button>
        </div>
      }

      <div class="table-wrap">
        @if (!selectedOrgId()) {
          <div class="empty"><p>Select an organization to view members</p></div>
        } @else if (store.loading() && store.members().length === 0) {
          <div class="empty"><p>Loading members...</p></div>
        } @else if (store.members().length === 0) {
          <div class="empty"><p>No members in this organization</p></div>
        } @else {
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (member of store.members(); track member.id) {
                <tr>
                  <td style="font-weight:500">{{ member.user_full_name }}</td>
                  <td style="color:var(--color-text-secondary)">{{ member.user_email }}</td>
                  <td>
                    @for (role of member.role_slugs; track role) {
                      <span class="badge role-badge">{{ role }}</span>
                    }
                  </td>
                  <td>
                    <span class="badge badge-active">{{ member.membership_status }}</span>
                  </td>
                  <td style="text-align:right">
                    <button class="btn btn-danger" (click)="removeMember(member.id)" title="Remove member">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
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

    <!-- Add Member Modal -->
    @if (showAddModal()) {
      <div class="modal-overlay" (click)="showAddModal.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Add Member</h3>
          <p>Add an existing user to this organization</p>

          <div class="field">
            <label for="memberUser">User</label>
            <select id="memberUser" [(ngModel)]="addUserId">
              <option value="">Select user...</option>
              @for (user of store.users(); track user.id) {
                @if (user.is_active) {
                  <option [value]="user.id">{{ user.full_name }} ({{ user.email }})</option>
                }
              }
            </select>
          </div>
          <div class="field">
            <label for="memberRole">Role</label>
            <select id="memberRole" [(ngModel)]="addRoleSlug">
              <option value="">Select role...</option>
              @for (role of store.roles(); track role.id) {
                <option [value]="role.slug">{{ role.name }}</option>
              }
            </select>
          </div>

          <div class="modal-actions">
            <button class="btn btn-cancel" (click)="showAddModal.set(false)">Cancel</button>
            <button class="btn btn-primary" [disabled]="!addUserId() || !addRoleSlug()" (click)="submitAddMember()">
              @if (store.loading()) { Adding... } @else { Add Member }
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminMembersComponent implements OnInit {
  readonly store = inject(AdminStore);
  readonly location = inject(Location);
  readonly selectedOrgId = signal('');
  readonly showAddModal = signal(false);
  readonly addUserId = signal('');
  readonly addRoleSlug = signal('');

  @Input() id?: string;

  ngOnInit(): void {
    this.store.loadOrganizations();
    this.store.loadUsers();
    this.store.loadRoles();
    if (this.id) {
      this.selectedOrgId.set(this.id);
      this.store.loadMembers(this.id);
    }
  }

  onOrgChange(event: Event): void {
    const orgId = (event.target as HTMLSelectElement).value;
    this.selectedOrgId.set(orgId);
    if (orgId) {
      this.store.loadMembers(orgId);
    }
  }

  async submitAddMember(): Promise<void> {
    const orgId = this.selectedOrgId();
    if (!orgId || !this.addUserId() || !this.addRoleSlug()) return;
    const success = await this.store.addMember(orgId, {
      user_id: this.addUserId(),
      role_slug: this.addRoleSlug(),
    });
    if (success) {
      this.showAddModal.set(false);
      this.addUserId.set('');
      this.addRoleSlug.set('');
    }
  }

  async removeMember(membershipId: string): Promise<void> {
    const orgId = this.selectedOrgId();
    if (!orgId) return;
    if (!confirm('Remove this member from the organization?')) return;
    await this.store.removeMember(orgId, membershipId);
  }
}
