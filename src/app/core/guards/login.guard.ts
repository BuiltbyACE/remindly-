import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../auth/stores/auth.store';

/**
 * Redirects authenticated users away from login page
 * Use on auth routes to prevent logged-in users from accessing login
 */
export const loginGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return router.parseUrl('/dashboard');
  }

  return true;
};
