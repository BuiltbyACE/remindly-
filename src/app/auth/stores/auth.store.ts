import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AuthService, UserProfile } from '../services/auth.service';
import { RbacStore } from './rbac.store';
import { PushSubscriptionService } from '../../push/push-subscription.service';

interface AuthState {
  accessToken: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({
    accessToken: null,
    user: null,
    isLoading: false,
    error: null,
  }),
  withComputed(({ accessToken, user }) => ({
    isAuthenticated: computed(() => !!accessToken() && !!user()),
    userDisplayName: computed(() => user()?.full_name ?? ''),
    userInitials: computed(() => {
      const name = user()?.full_name ?? '';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }),
  })),
  withMethods((store, authService = inject(AuthService), rbacStore = inject(RbacStore), pushService = inject(PushSubscriptionService)) => ({
    setToken(token: string): void {
      patchState(store, { accessToken: token });
    },

    async hydrateUser(): Promise<void> {
      if (!store.accessToken()) return;
      patchState(store, { isLoading: true });
      try {
        const user = await lastValueFrom(authService.getCurrentUser());
        patchState(store, { user, isLoading: false });
        await rbacStore.hydratePermissions();
      } catch {
        patchState(store, { isLoading: false });
      }
    },

    async login(email: string, password: string): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const result = await lastValueFrom(authService.login(email, password));
        patchState(store, {
          accessToken: result.access_token,
          user: result.user,
          isLoading: false,
        });
        sessionStorage.setItem('remindly_token', result.access_token);
        sessionStorage.setItem('remindly_user', JSON.stringify(result.user));
        await rbacStore.hydratePermissions();
        await pushService.initialize();
        await pushService.register();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Login failed';
        patchState(store, { isLoading: false, error: message });
        throw err;
      }
    },

    clearSession(): void {
      pushService.unregister();
      rbacStore.reset();  // ← clear permissions so next user starts clean
      patchState(store, { accessToken: null, user: null, error: null });
      sessionStorage.removeItem('remindly_token');
      sessionStorage.removeItem('remindly_user');
    },


    persistToStorage(user: UserProfile): void {
      sessionStorage.setItem('remindly_user', JSON.stringify(user));
    },
  })),
  withMethods((store) => ({
    hydrateFromStorage(): boolean {
      const token = sessionStorage.getItem('remindly_token');
      if (!token) return false;

      patchState(store, { accessToken: token });

      const stored = sessionStorage.getItem('remindly_user');
      if (stored) {
        try {
          const user = JSON.parse(stored) as UserProfile;
          patchState(store, { user });
        } catch {
          sessionStorage.removeItem('remindly_user');
        }
      }

      store.hydrateUser();
      return true;
    },
  })),
);
