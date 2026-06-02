import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../auth/stores/auth.store';

/**
 * Redirects authenticated users away from login page.
 * If the user must change their password, send them to change-password.
 * Otherwise, send them to the dashboard.
 */
export const loginGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return router.parseUrl(
      authStore.mustChangePasswordFlag() ? '/auth/change-password' : '/dashboard'
    );
  }

  return true;
};
