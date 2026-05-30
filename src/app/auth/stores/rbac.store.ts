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
      if (perms.includes('events.read') || perms.includes('documents.read')) return 'Secretary';
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

    async hydratePermissions(): Promise<void> {
      try {
        const permissions = await lastValueFrom(rbacService.getMyPermissions());
        sessionStorage.setItem('remindly_permissions', JSON.stringify(permissions));
        patchState(store, { permissions, isLoaded: true });
      } catch {
        patchState(store, { permissions: [], isLoaded: true });
      }
      // Separately fetch actual role names
      try {
        const roles = await lastValueFrom(rbacService.getMyRoles());
        sessionStorage.setItem('remindly_roles', JSON.stringify(roles));
        patchState(store, { roleNames: roles });
      } catch {
        // getMyRoles may not exist on backend yet — silently ignore
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
