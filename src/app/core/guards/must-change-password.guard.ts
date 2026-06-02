import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../auth/stores/auth.store';

export const mustChangePasswordGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isAuthenticated()) {
    return router.parseUrl('/auth/login');
  }

  if (authStore.mustChangePasswordFlag()) {
    return true;
  }

  return router.parseUrl('/dashboard');
};
