import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RbacService } from '../services/rbac.service';

export const RbacStore = signalStore(
  { providedIn: 'root' },
  withState({ permissions: [] as string[], isLoaded: false }),
  withComputed(({ permissions }) => ({
    hasPermission: computed(() => (key: string) => permissions().includes(key)),
    hasAnyPermission: computed(() => (keys: string[]) =>
      keys.some(k => permissions().includes(k)),
    ),
  })),
  withMethods((store, rbacService = inject(RbacService)) => ({
    async hydratePermissions(): Promise<void> {
      try {
        const permissions = await firstValueFrom(rbacService.getMyPermissions());
        patchState(store, { permissions, isLoaded: true });
      } catch {
        patchState(store, { permissions: [], isLoaded: true });
      }
    },
  })),
);
