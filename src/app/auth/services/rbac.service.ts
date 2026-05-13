import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';

export interface RoleAssign {
  membership_id: string;
  role_id: string;
}

export interface DelegationCreate {
  delegate_membership_id: string;
  permission_scope: string[];
  ends_at?: string | null;
}

@Injectable({ providedIn: 'root' })
export class RbacService extends BaseApiClient {
  listPermissions(): Observable<string[]> {
    return this.get<string[]>('/api/v1/rbac/permissions');
  }

  getMyPermissions(): Observable<string[]> {
    return this.get<string[]>('/api/v1/rbac/permissions/my');
  }

  checkPermission(permission: string): Observable<boolean> {
    return this.get<boolean>('/api/v1/rbac/permissions/check', { permission });
  }

  listRoles(): Observable<unknown[]> {
    return this.get<unknown[]>('/api/v1/rbac/roles');
  }

  assignRole(payload: RoleAssign): Observable<unknown> {
    return this.post('/api/v1/rbac/roles/assign', payload);
  }

  removeRole(membershipId: string, roleId: string): Observable<void> {
    return this.delete<void>(`/api/v1/rbac/roles/assignments/${membershipId}/${roleId}`);
  }

  createDelegation(payload: DelegationCreate): Observable<unknown> {
    return this.post('/api/v1/rbac/delegations', payload);
  }

  revokeDelegation(delegationId: string): Observable<void> {
    return this.post<void>(`/api/v1/rbac/delegations/${delegationId}/revoke`, {});
  }
}
