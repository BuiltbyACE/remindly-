import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../auth/stores/auth.store';

export const adminGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isAuthenticated()) {
    return router.parseUrl('/admin/login');
  }

  const user = authStore.user();
  if (user?.super_admin || user?.permissions?.includes('admin.access') || user?.role === 'super_admin' || user?.roles?.includes('super_admin')) {
    return true;
  }

  return router.parseUrl('/dashboard');
};
