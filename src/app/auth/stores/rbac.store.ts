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
        return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      }
      // Fallback: infer from permissions
      const perms = permissions() ?? [];
      if (perms.includes('audit.read')) return 'Executive';
      if (perms.includes('events.approve')) return 'Admin';
      if (perms.includes('events.read')) return 'Secretary';
      return 'Member';
    }),
  })),
  withMethods((store, rbacService = inject(RbacService)) => ({
    async hydratePermissions(): Promise<void> {
      try {
        const permissions = await lastValueFrom(rbacService.getMyPermissions());
        patchState(store, { permissions, isLoaded: true });
      } catch {
        patchState(store, { permissions: [], isLoaded: true });
      }
      // Separately fetch actual role names
      try {
        const roles = await lastValueFrom(rbacService.getMyRoles());
        patchState(store, { roleNames: roles });
      } catch {
        // getMyRoles may not exist on backend yet — silently ignore
        patchState(store, { roleNames: [] });
      }
    },

    /** Must be called on logout to prevent permission bleed between users */
    reset(): void {
      patchState(store, { permissions: [], roleNames: [], isLoaded: false });
    },
  })),
);
