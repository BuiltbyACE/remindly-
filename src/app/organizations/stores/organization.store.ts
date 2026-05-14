import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { OrganizationService, Organization } from '../services/organization.service';
import { RbacStore } from '../../auth/stores/rbac.store';

interface OrganizationState {
  organizations: Organization[];
  activeOrganizationId: string | null;
  isLoading: boolean;
}

export const OrganizationStore = signalStore(
  { providedIn: 'root' },
  withState<OrganizationState>({
    organizations: [],
    activeOrganizationId: null,
    isLoading: false,
  }),
  withComputed(({ organizations, activeOrganizationId }) => ({
    activeOrganization: computed(() =>
      organizations().find(o => o.id === activeOrganizationId()) ?? null,
    ),
    hasMultipleOrgs: computed(() => organizations().length > 1),
  })),
  withMethods((store, orgService = inject(OrganizationService), rbacStore = inject(RbacStore)) => ({
    async loadOrganizations(): Promise<void> {
      patchState(store, { isLoading: true });
      const orgs = await lastValueFrom(orgService.listOrganizations());
      const firstId = orgs[0]?.id ?? null;
      patchState(store, {
        organizations: orgs,
        activeOrganizationId: firstId,
        isLoading: false,
      });
    },

    async switchOrganization(orgId: string): Promise<void> {
      patchState(store, { activeOrganizationId: orgId });
      await rbacStore.hydratePermissions();
    },
  })),
);
