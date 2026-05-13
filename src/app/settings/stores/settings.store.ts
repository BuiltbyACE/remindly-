/**
 * SettingsStore
 * Signal-based state management for the Settings domain
 */

import { computed, inject, effect } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { SettingsService } from '../services/settings.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import type {
  UserSettings,
  UserSettingsUpdate,
  OrganizationSettings,
  OrganizationSettingsUpdate,
  NotificationPreferences,
  ThemeMode,
} from '../models/settings.model';

interface SettingsState {
  userSettings: UserSettings | null;
  orgSettings: OrganizationSettings | null;
  notificationPrefs: NotificationPreferences | null;
  loading: boolean;
  saving: boolean;
  uploadLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  userSettings: null,
  orgSettings: null,
  notificationPrefs: null,
  loading: false,
  saving: false,
  uploadLoading: false,
  error: null,
};

export const SettingsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    // Current theme
    currentTheme: computed(() => store.userSettings()?.theme ?? 'system'),

    // Is dark mode
    isDarkMode: computed(() => {
      const theme = store.userSettings()?.theme ?? 'system';
      if (theme === 'dark') return true;
      if (theme === 'light') return false;
      // System preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }),

    // Notification enabled status
    notificationsEnabled: computed(() => {
      const prefs = store.notificationPrefs();
      if (!prefs) return false;
      return prefs.event_created || prefs.event_updated || prefs.event_reminder;
    }),

    // Has unsaved changes (simplified)
    hasUnsavedChanges: computed(() => false), // Would need dirty checking
  })),

  withHooks({
    onInit(store) {
      // Apply theme effect
      effect(() => {
        const theme = store.currentTheme();
        const isDark = store.isDarkMode();
        const root = document.documentElement;

        if (isDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }

        // Store preference
        localStorage.setItem('theme', theme);
      });

      // Load settings on init
      const settingsService = inject(SettingsService);
      settingsService.getSettings().subscribe({
        next: (settings) => {
          patchState(store, {
            userSettings: settings.user_settings,
            orgSettings: settings.org_settings,
            notificationPrefs: settings.notification_preferences,
          });
        },
        error: (err) => {
          console.error('Failed to load settings:', err);
        },
      });
    },
  }),

  withMethods(
    (
      store,
      settingsService = inject(SettingsService),
      toastService = inject(ToastService)
    ) => ({
      /**
       * Load all settings
       */
      async loadSettings(): Promise<void> {
        patchState(store, { loading: true, error: null });

        try {
          const settings = await lastValueFrom(settingsService.getSettings());
          patchState(store, {
            userSettings: settings.user_settings,
            orgSettings: settings.org_settings,
            notificationPrefs: settings.notification_preferences,
            loading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load settings';
          patchState(store, { error: message, loading: false });
        }
      },

      /**
       * Update user settings
       */
      async updateUserSettings(settings: UserSettingsUpdate): Promise<boolean> {
        patchState(store, { saving: true });

        try {
          const updated = await lastValueFrom(
            settingsService.updateUserSettings(settings)
          );

          patchState(store, {
            userSettings: updated,
            saving: false,
          });

          toastService.success('Settings saved');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to save settings';
          patchState(store, { error: message, saving: false });
          toastService.error(message);
          return false;
        }
      },

      /**
       * Update theme
       */
      async setTheme(theme: ThemeMode): Promise<void> {
        const success = await this.updateUserSettings({ theme });
        if (success) {
          toastService.success(`Theme set to ${theme}`);
        }
      },

      /**
       * Update organization settings
       */
      async updateOrgSettings(settings: OrganizationSettingsUpdate): Promise<boolean> {
        patchState(store, { saving: true });

        try {
          const updated = await lastValueFrom(
            settingsService.updateOrganizationSettings(settings)
          );

          patchState(store, {
            orgSettings: updated,
            saving: false,
          });

          toastService.success('Organization settings saved');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to save';
          patchState(store, { error: message, saving: false });
          toastService.error(message);
          return false;
        }
      },

      /**
       * Update notification preferences
       */
      async updateNotificationPreferences(
        prefs: Partial<NotificationPreferences>
      ): Promise<boolean> {
        patchState(store, { saving: true });

        try {
          const updated = await lastValueFrom(
            settingsService.updateNotificationPreferences(prefs)
          );

          patchState(store, {
            notificationPrefs: updated,
            saving: false,
          });

          toastService.success('Notification preferences saved');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to save';
          patchState(store, { error: message, saving: false });
          toastService.error(message);
          return false;
        }
      },

      /**
       * Upload organization logo
       */
      async uploadLogo(file: File): Promise<string | null> {
        patchState(store, { uploadLoading: true });

        try {
          const response = await lastValueFrom(settingsService.uploadOrganizationLogo(file));

          patchState(store, {
            orgSettings: { ...store.orgSettings()!, org_logo_url: response.logo_url },
            uploadLoading: false,
          });

          toastService.success('Logo uploaded');
          return response.logo_url;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Upload failed';
          patchState(store, { uploadLoading: false });
          toastService.error(message);
          return null;
        }
      },

      /**
       * Clear error state
       */
      clearError(): void {
        patchState(store, { error: null });
      },

      /**
       * Reset store state
       */
      reset(): void {
        patchState(store, initialState);
      },
    })
  )
);
