import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  supabase_user_id: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
  super_admin?: boolean;
  must_change_password?: boolean;
  organization_id?: string;
  membership_id?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: UserProfile;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseApiClient {
  login(email: string, password: string): Observable<LoginResponse> {
    return this.post<LoginResponse>('/api/v1/auth/login', { email, password });
  }

  getCurrentUser(): Observable<UserProfile> {
    return this.get<UserProfile>('/api/v1/auth/me');
  }

  changePassword(currentPassword: string, newPassword: string): Observable<boolean> {
    return this.post<boolean>('/api/v1/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }
}
