import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiClient } from '../../api/base-api.client';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  organization_type: string;
  is_active: boolean;
}

@Injectable({ providedIn: 'root' })
export class OrganizationService extends BaseApiClient {
  listOrganizations(): Observable<Organization[]> {
    return this.get<Organization | null>('/api/v1/organizations/my').pipe(
      map(org => org ? [org] : []),
    );
  }

  getOrganization(orgId: string): Observable<Organization> {
    return this.get<Organization>(`/api/v1/organizations/${orgId}`);
  }
}
