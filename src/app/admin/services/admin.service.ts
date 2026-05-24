import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiClient } from '../../api/base-api.client';
import type {
  AdminUser,
  AdminUserDetail,
  AdminOrganization,
  AdminMember,
  AdminRole,
  AdminCreateUserRequest,
  AdminCreateOrganizationRequest,
  AdminUpdateUserRequest,
  AdminUpdateOrganizationRequest,
  AdminAddMemberRequest,
  AdminCreateUserResponse,
  AdminPaginatedResponse,
} from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService extends BaseApiClient {
  listUsers(limit = 50, offset = 0, search?: string): Observable<AdminPaginatedResponse<AdminUser>> {
    return this.get<AdminPaginatedResponse<AdminUser>>('/api/v1/admin/users', { limit, offset, search });
  }

  createUser(data: AdminCreateUserRequest): Observable<AdminCreateUserResponse> {
    return this.post<AdminCreateUserResponse>('/api/v1/admin/users', data);
  }

  getUserDetail(userId: string): Observable<AdminUserDetail> {
    return this.get<AdminUserDetail>(`/api/v1/admin/users/${userId}`);
  }

  updateUser(userId: string, data: AdminUpdateUserRequest): Observable<AdminUser> {
    return this.patch<AdminUser>(`/api/v1/admin/users/${userId}`, data);
  }

  deleteUser(userId: string): Observable<AdminUser> {
    return this.delete<AdminUser>(`/api/v1/admin/users/${userId}`);
  }

  listOrganizations(limit = 50, offset = 0, search?: string): Observable<AdminPaginatedResponse<AdminOrganization>> {
    return this.get<AdminPaginatedResponse<AdminOrganization>>('/api/v1/admin/organizations', { limit, offset, search });
  }

  createOrganization(data: AdminCreateOrganizationRequest): Observable<AdminOrganization> {
    return this.post<AdminOrganization>('/api/v1/admin/organizations', data);
  }

  getOrganization(orgId: string): Observable<AdminOrganization> {
    return this.get<AdminOrganization>(`/api/v1/admin/organizations/${orgId}`);
  }

  updateOrganization(orgId: string, data: AdminUpdateOrganizationRequest): Observable<AdminOrganization> {
    return this.patch<AdminOrganization>(`/api/v1/admin/organizations/${orgId}`, data);
  }

  deleteOrganization(orgId: string): Observable<AdminOrganization> {
    return this.delete<AdminOrganization>(`/api/v1/admin/organizations/${orgId}`);
  }

  listMembers(orgId: string): Observable<AdminMember[]> {
    return this.get<{ items: AdminMember[] }>(`/api/v1/admin/organizations/${orgId}/members`).pipe(
      map(r => r.items),
    );
  }

  addMember(orgId: string, data: AdminAddMemberRequest): Observable<AdminMember> {
    return this.post<AdminMember>(`/api/v1/admin/organizations/${orgId}/members`, data);
  }

  removeMember(orgId: string, membershipId: string): Observable<void> {
    return this.delete<void>(`/api/v1/admin/organizations/${orgId}/members/${membershipId}`).pipe(
      map(() => undefined),
    );
  }

  listRoles(): Observable<AdminRole[]> {
    return this.get<{ items: AdminRole[] }>('/api/v1/admin/roles').pipe(
      map(r => r.items),
    );
  }
}
