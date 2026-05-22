import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AdminService } from '../services/admin.service';
import type {
  AdminUser,
  AdminOrganization,
  AdminMember,
  AdminRole,
  AdminCreateUserRequest,
  AdminCreateOrganizationRequest,
  AdminUpdateUserRequest,
  AdminUpdateOrganizationRequest,
  AdminAddMemberRequest,
  AdminCreateUserResponse,
} from '../models/admin.model';

interface AdminState {
  users: AdminUser[];
  usersTotal: number;
  organizations: AdminOrganization[];
  organizationsTotal: number;
  members: AdminMember[];
  roles: AdminRole[];
  selectedUserId: string | null;
  selectedOrgId: string | null;
  loading: boolean;
  error: string | null;
}

export const AdminStore = signalStore(
  { providedIn: 'root' },
  withState<AdminState>({
    users: [],
    usersTotal: 0,
    organizations: [],
    organizationsTotal: 0,
    members: [],
    roles: [],
    selectedUserId: null,
    selectedOrgId: null,
    loading: false,
    error: null,
  }),
  withComputed(({ users, organizations, members, roles, loading, error }) => ({
    selectedUser: computed(() => users().find(u => u.id === '') ?? null),
    rolesBySlug: computed(() => {
      const map: Record<string, AdminRole> = {};
      for (const r of roles()) map[r.slug] = r;
      return map;
    }),
    loading,
    error,
  })),
  withMethods((store, adminService = inject(AdminService)) => ({
    async loadUsers(search?: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const result = await lastValueFrom(adminService.listUsers(50, 0, search));
        patchState(store, { users: result.items, usersTotal: result.total, loading: false });
      } catch {
        patchState(store, { loading: false, error: 'Failed to load users' });
      }
    },

    async createUser(data: AdminCreateUserRequest): Promise<AdminCreateUserResponse | null> {
      patchState(store, { loading: true, error: null });
      try {
        const result = await lastValueFrom(adminService.createUser(data));
        await this.loadUsers();
        patchState(store, { loading: false });
        return result;
      } catch {
        patchState(store, { loading: false, error: 'Failed to create user' });
        return null;
      }
    },

    async updateUser(userId: string, data: AdminUpdateUserRequest): Promise<boolean> {
      patchState(store, { loading: true, error: null });
      try {
        await lastValueFrom(adminService.updateUser(userId, data));
        await this.loadUsers();
        patchState(store, { loading: false });
        return true;
      } catch {
        patchState(store, { loading: false, error: 'Failed to update user' });
        return false;
      }
    },

    async deactivateUser(userId: string): Promise<boolean> {
      patchState(store, { loading: true, error: null });
      try {
        await lastValueFrom(adminService.deleteUser(userId));
        await this.loadUsers();
        patchState(store, { loading: false });
        return true;
      } catch {
        patchState(store, { loading: false, error: 'Failed to deactivate user' });
        return false;
      }
    },

    async loadOrganizations(search?: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const result = await lastValueFrom(adminService.listOrganizations(50, 0, search));
        patchState(store, { organizations: result.items, organizationsTotal: result.total, loading: false });
      } catch {
        patchState(store, { loading: false, error: 'Failed to load organizations' });
      }
    },

    async createOrganization(data: AdminCreateOrganizationRequest): Promise<boolean> {
      patchState(store, { loading: true, error: null });
      try {
        await lastValueFrom(adminService.createOrganization(data));
        await this.loadOrganizations();
        patchState(store, { loading: false });
        return true;
      } catch {
        patchState(store, { loading: false, error: 'Failed to create organization' });
        return false;
      }
    },

    async updateOrganization(orgId: string, data: AdminUpdateOrganizationRequest): Promise<boolean> {
      patchState(store, { loading: true, error: null });
      try {
        await lastValueFrom(adminService.updateOrganization(orgId, data));
        await this.loadOrganizations();
        patchState(store, { loading: false });
        return true;
      } catch {
        patchState(store, { loading: false, error: 'Failed to update organization' });
        return false;
      }
    },

    async deleteOrganization(orgId: string): Promise<boolean> {
      patchState(store, { loading: true, error: null });
      try {
        await lastValueFrom(adminService.deleteOrganization(orgId));
        await this.loadOrganizations();
        patchState(store, { loading: false });
        return true;
      } catch {
        patchState(store, { loading: false, error: 'Failed to delete organization' });
        return false;
      }
    },

    async loadMembers(orgId: string): Promise<void> {
      patchState(store, { loading: true, error: null, selectedOrgId: orgId });
      try {
        const members = await lastValueFrom(adminService.listMembers(orgId));
        patchState(store, { members, loading: false });
      } catch {
        patchState(store, { loading: false, error: 'Failed to load members' });
      }
    },

    async addMember(orgId: string, data: AdminAddMemberRequest): Promise<boolean> {
      patchState(store, { loading: true, error: null });
      try {
        await lastValueFrom(adminService.addMember(orgId, data));
        await this.loadMembers(orgId);
        patchState(store, { loading: false });
        return true;
      } catch {
        patchState(store, { loading: false, error: 'Failed to add member' });
        return false;
      }
    },

    async removeMember(orgId: string, membershipId: string): Promise<boolean> {
      patchState(store, { loading: true, error: null });
      try {
        await lastValueFrom(adminService.removeMember(orgId, membershipId));
        await this.loadMembers(orgId);
        patchState(store, { loading: false });
        return true;
      } catch {
        patchState(store, { loading: false, error: 'Failed to remove member' });
        return false;
      }
    },

    async loadRoles(): Promise<void> {
      try {
        const roles = await lastValueFrom(adminService.listRoles());
        patchState(store, { roles });
      } catch {
        // non-critical, roles can be empty
      }
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  })),
);
