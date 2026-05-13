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
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: UserProfile;
}

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseApiClient {
  login(email: string, password: string): Observable<LoginResponse> {
    return this.post<LoginResponse>('/api/v1/auth/login', { email, password });
  }

  getCurrentUser(): Observable<UserProfile> {
    return this.get<UserProfile>('/api/v1/auth/me');
  }
}
