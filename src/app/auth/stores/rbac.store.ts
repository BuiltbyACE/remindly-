import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { RbacService } from '../services/rbac.service';

export const RbacStore = signalStore(
  { providedIn: 'root' },
  withState({
    permissions: [] as string[],
    roleNames: [] as string[],
    isLoaded: false,
  }),
  withComputed(({ permissions, roleNames }) => ({
    hasPermission: computed(() => (key: string) => (permissions() ?? []).includes(key)),
    hasAnyPermission: computed(() => (keys: string[]) =>
      keys.some(k => (permissions() ?? []).includes(k)),
    ),
    /**
     * Returns the user's primary role as a display label.
     * Prefers the actual role name from the API over permission-based inference.
     */
    primaryRoleLabel: computed(() => {
      const names = roleNames();
      if (names.length > 0) {
        // Normalise: capitalise first letter of each word
        const raw = names[0];
        return raw.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }
      // Fallback: infer from permissions
      const perms = permissions() ?? [];
      if (perms.includes('audit.read') || perms.includes('documents.approve') || perms.includes('events.approve') || perms.includes('documents.delete')) return 'Executive';
      if (perms.includes('events.create') || perms.includes('events.read') || perms.includes('documents.read')) return 'Secretary';
      return 'Member';
    }),
  })),
  withMethods((store, rbacService = inject(RbacService)) => ({
    hydrateFromStorage(): boolean {
      const cached = sessionStorage.getItem('remindly_permissions');
      const cachedRoles = sessionStorage.getItem('remindly_roles');
      if (cached) {
        try {
          const permissions = JSON.parse(cached) as string[];
          const roleNames = cachedRoles ? JSON.parse(cachedRoles) as string[] : [];
          patchState(store, { permissions, roleNames, isLoaded: true });
          return true;
        } catch {
          sessionStorage.removeItem('remindly_permissions');
          sessionStorage.removeItem('remindly_roles');
        }
      }
      return false;
    },

    /**
     * Hydrate permissions from /auth/me data first (primary source),
     * falling back to a dedicated API call if not provided.
     */
    async hydratePermissions(permissionsFromAuth?: string[], rolesFromAuth?: string[]): Promise<void> {
      // Primary: permissions from /auth/me (passed by AuthStore)
      if (permissionsFromAuth && permissionsFromAuth.length > 0) {
        sessionStorage.setItem('remindly_permissions', JSON.stringify(permissionsFromAuth));
        patchState(store, { permissions: permissionsFromAuth, isLoaded: true });
        if (rolesFromAuth && rolesFromAuth.length > 0) {
          sessionStorage.setItem('remindly_roles', JSON.stringify(rolesFromAuth));
          patchState(store, { roleNames: rolesFromAuth });
        }
        return;
      }

      // Fallback: dedicated RBAC API call
      try {
        const permissions = await lastValueFrom(rbacService.getMyPermissions());
        sessionStorage.setItem('remindly_permissions', JSON.stringify(permissions));
        patchState(store, { permissions, isLoaded: true });
      } catch {
        patchState(store, { permissions: [], isLoaded: true });
      }

      // Separately fetch actual role names (silent fallback)
      try {
        const roles = await lastValueFrom(rbacService.getMyRoles());
        sessionStorage.setItem('remindly_roles', JSON.stringify(roles));
        patchState(store, { roleNames: roles });
      } catch {
        patchState(store, { roleNames: [] });
      }
    },

    /** Must be called on logout to prevent permission bleed between users */
    reset(): void {
      sessionStorage.removeItem('remindly_permissions');
      sessionStorage.removeItem('remindly_roles');
      patchState(store, { permissions: [], roleNames: [], isLoaded: false });
    },
  })),
);
