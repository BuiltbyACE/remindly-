import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AuthService, UserProfile } from '../services/auth.service';
import { RbacStore } from './rbac.store';
import { PushSubscriptionService } from '../../push/push-subscription.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { SettingsService } from '../../settings/services/settings.service';

interface AuthState {
  accessToken: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  mustChangePassword: boolean;
  changePasswordError: string | null;
  isChangingPassword: boolean;
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({
    accessToken: null,
    user: null,
    isLoading: false,
    error: null,
    mustChangePassword: false,
    changePasswordError: null,
    isChangingPassword: false,
  }),
  withComputed(({ accessToken, user, mustChangePassword }) => ({
    isAuthenticated: computed(() => !!accessToken() && !!user()),
    userDisplayName: computed(() => user()?.full_name ?? ''),
    userInitials: computed(() => {
      const name = user()?.full_name ?? '';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }),
    mustChangePasswordFlag: computed(() => mustChangePassword()),
  })),
  withMethods((store, authService = inject(AuthService), rbacStore = inject(RbacStore), pushService = inject(PushSubscriptionService), toastService = inject(ToastService), settingsService = inject(SettingsService)) => ({
    setToken(token: string): void {
      patchState(store, { accessToken: token });
    },

    async hydrateUser(): Promise<void> {
      if (!store.accessToken()) return;
      patchState(store, { isLoading: true });
      try {
        const user = await lastValueFrom(authService.getCurrentUser());
        patchState(store, { user, isLoading: false, mustChangePassword: user.must_change_password === true });
        localStorage.setItem('remindly_user', JSON.stringify(user));
        localStorage.setItem('remindly_must_change_password', String(user.must_change_password === true));
        await rbacStore.hydratePermissions(user.permissions, user.roles);

        if (!store.mustChangePassword()) {
          pushService.initialize().then(() => {
            pushService.register();
          });

          if (Notification.permission === 'default') {
            Notification.requestPermission().catch(() => {});
          }

          try {
            await lastValueFrom(
              settingsService.updateNotificationPreferences({
                daily_digest: true,
                daily_digest_time: '08:00',
              })
            );
          } catch {
            // Non-critical
          }
        }
      } catch {
        patchState(store, { isLoading: false });
      }
    },

    async login(email: string, password: string): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const result = await lastValueFrom(authService.login(email, password));
        const mustChangePassword = result.user.must_change_password === true;

        patchState(store, {
          accessToken: result.access_token,
          user: result.user,
          mustChangePassword,
          isLoading: false,
        });
        localStorage.setItem('remindly_token', result.access_token);
        localStorage.setItem('remindly_user', JSON.stringify(result.user));
        localStorage.setItem('remindly_must_change_password', String(mustChangePassword));
        await rbacStore.hydratePermissions(result.user.permissions, result.user.roles);

        if (!mustChangePassword) {
          pushService.initialize().then(() => {
            pushService.register();
          });

          const name = result.user.full_name;
          // Show native notification only once per tab session (not on page refresh)
          const wasAlreadyLoggedIn = sessionStorage.getItem('remindly_session_active');
          if (!wasAlreadyLoggedIn) {
            sessionStorage.setItem('remindly_session_active', 'true');
            const notificationPerm = Notification.permission === 'default'
              ? await Notification.requestPermission()
              : Notification.permission;
            if (notificationPerm === 'granted' && 'serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(sw => {
                sw.showNotification('Welcome to Remindly', {
                  body: `Logged in as ${name}`,
                  icon: '/icons/icon-192x192.png',
                });
              }).catch(() => {});
            } else if (notificationPerm === 'denied') {
              toastService.warning('Notifications are blocked. Enable them in your browser settings for reminder alerts.');
            }
          }
          toastService.success(`Welcome back, ${name}!`);

          try {
            await lastValueFrom(
              settingsService.updateNotificationPreferences({
                daily_digest: true,
                daily_digest_time: '08:00',
              })
            );
          } catch {
            // Non-critical
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Login failed';
        patchState(store, { isLoading: false, error: message });
        throw err;
      }
    },

    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
      patchState(store, { isChangingPassword: true, changePasswordError: null });
      try {
        await lastValueFrom(authService.changePassword(currentPassword, newPassword));
        patchState(store, {
          mustChangePassword: false,
          isChangingPassword: false,
          changePasswordError: null,
        });
        localStorage.setItem('remindly_must_change_password', 'false');
      } catch (err: unknown) {
        let message = 'Failed to change password';
        if (err instanceof HttpErrorResponse && err.error?.detail) {
          message = err.error.detail;
        } else if (err instanceof Error) {
          message = err.message;
        }
        patchState(store, { changePasswordError: message, isChangingPassword: false });
        throw err;
      }
    },

    clearSession(): void {
      pushService.unregister();
      rbacStore.reset();
      patchState(store, {
        accessToken: null,
        user: null,
        error: null,
        mustChangePassword: false,
        changePasswordError: null,
        isChangingPassword: false,
      });
      localStorage.removeItem('remindly_token');
      localStorage.removeItem('remindly_user');
      localStorage.removeItem('remindly_must_change_password');
    },

    persistToStorage(user: UserProfile): void {
      localStorage.setItem('remindly_user', JSON.stringify(user));
    },
  })),
  withMethods((store, rbacStore = inject(RbacStore)) => ({
    hydrateFromStorage(): boolean {
      const token = localStorage.getItem('remindly_token');
      if (!token) return false;

      patchState(store, { accessToken: token });

      const stored = localStorage.getItem('remindly_user');
      if (stored) {
        try {
          const user = JSON.parse(stored) as UserProfile;
          patchState(store, { user });
        } catch {
          localStorage.removeItem('remindly_user');
        }
      }

      const mcp = localStorage.getItem('remindly_must_change_password');
      if (mcp) {
        patchState(store, { mustChangePassword: mcp === 'true' });
      }

      rbacStore.hydrateFromStorage();
      return true;
    },
  })),
);
