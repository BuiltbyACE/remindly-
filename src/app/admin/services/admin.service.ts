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
  AdminApiResponse,
} from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService extends BaseApiClient {
  listUsers(limit = 50, offset = 0, search?: string): Observable<AdminPaginatedResponse<AdminUser>> {
    return this.get<AdminApiResponse<AdminPaginatedResponse<AdminUser>>>('/api/v1/admin/users', { limit, offset, search }).pipe(
      map(r => r.data),
    );
  }

  createUser(data: AdminCreateUserRequest): Observable<AdminCreateUserResponse> {
    return this.post<AdminApiResponse<AdminCreateUserResponse>>('/api/v1/admin/users', data).pipe(
      map(r => r.data),
    );
  }

  getUserDetail(userId: string): Observable<AdminUserDetail> {
    return this.get<AdminApiResponse<AdminUserDetail>>(`/api/v1/admin/users/${userId}`).pipe(
      map(r => r.data),
    );
  }

  updateUser(userId: string, data: AdminUpdateUserRequest): Observable<AdminUser> {
    return this.patch<AdminApiResponse<AdminUser>>(`/api/v1/admin/users/${userId}`, data).pipe(
      map(r => r.data),
    );
  }

  deleteUser(userId: string): Observable<AdminUser> {
    return this.delete<AdminApiResponse<AdminUser>>(`/api/v1/admin/users/${userId}`).pipe(
      map(r => r.data),
    );
  }

  listOrganizations(limit = 50, offset = 0, search?: string): Observable<AdminPaginatedResponse<AdminOrganization>> {
    return this.get<AdminApiResponse<AdminPaginatedResponse<AdminOrganization>>>('/api/v1/admin/organizations', { limit, offset, search }).pipe(
      map(r => r.data),
    );
  }

  createOrganization(data: AdminCreateOrganizationRequest): Observable<AdminOrganization> {
    return this.post<AdminApiResponse<AdminOrganization>>('/api/v1/admin/organizations', data).pipe(
      map(r => r.data),
    );
  }

  getOrganization(orgId: string): Observable<AdminOrganization> {
    return this.get<AdminApiResponse<AdminOrganization>>(`/api/v1/admin/organizations/${orgId}`).pipe(
      map(r => r.data),
    );
  }

  updateOrganization(orgId: string, data: AdminUpdateOrganizationRequest): Observable<AdminOrganization> {
    return this.patch<AdminApiResponse<AdminOrganization>>(`/api/v1/admin/organizations/${orgId}`, data).pipe(
      map(r => r.data),
    );
  }

  deleteOrganization(orgId: string): Observable<AdminOrganization> {
    return this.delete<AdminApiResponse<AdminOrganization>>(`/api/v1/admin/organizations/${orgId}`).pipe(
      map(r => r.data),
    );
  }

  listMembers(orgId: string): Observable<AdminMember[]> {
    return this.get<AdminApiResponse<{ items: AdminMember[] }>>(`/api/v1/admin/organizations/${orgId}/members`).pipe(
      map(r => r.data.items),
    );
  }

  addMember(orgId: string, data: AdminAddMemberRequest): Observable<AdminMember> {
    return this.post<AdminApiResponse<AdminMember>>(`/api/v1/admin/organizations/${orgId}/members`, data).pipe(
      map(r => r.data),
    );
  }

  removeMember(orgId: string, membershipId: string): Observable<void> {
    return this.delete<AdminApiResponse<void>>(`/api/v1/admin/organizations/${orgId}/members/${membershipId}`).pipe(
      map(() => undefined),
    );
  }

  listRoles(): Observable<AdminRole[]> {
    return this.get<AdminApiResponse<{ items: AdminRole[] }>>('/api/v1/admin/roles').pipe(
      map(r => r.data.items),
    );
  }
}
