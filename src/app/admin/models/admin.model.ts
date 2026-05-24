export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  supabase_user_id?: string | null;
  organization_count?: number;
  created_at: string;
  updated_at: string | null;
}

export interface AdminUserDetail extends AdminUser {
  memberships: AdminMembership[];
}

export interface AdminMembership {
  id: string;
  organization_id: string;
  organization_name: string;
  organization_slug: string;
  membership_status: string;
  role_slugs: string[];
  joined_at: string;
}

export interface AdminOrganization {
  id: string;
  name: string;
  slug: string;
  organization_type: string;
  is_active: boolean;
  member_count?: number;
  created_at: string;
  updated_at?: string | null;
}

export interface AdminMember {
  id: string;
  user_id: string;
  user_email: string;
  user_full_name: string;
  membership_status: string;
  role_slugs: string[];
  joined_at: string;
}

export interface AdminRole {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_system_role: boolean;
}

export interface AdminCreateUserRequest {
  email: string;
  full_name: string;
  password: string;
  organization_id: string;
  role_slug: string;
}

export interface AdminCreateOrganizationRequest {
  name: string;
  slug: string;
  organization_type: string;
}

export interface AdminUpdateUserRequest {
  full_name?: string | null;
  is_active?: boolean | null;
}

export interface AdminUpdateOrganizationRequest {
  name?: string | null;
  slug?: string | null;
  organization_type?: string | null;
  is_active?: boolean | null;
}

export interface AdminAddMemberRequest {
  user_id: string;
  role_slug: string;
}

export interface AdminCreateUserResponse {
  user: AdminUser;
  invite_link: string | null;
  email_sent: boolean;
}

export interface AdminPaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
