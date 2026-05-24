import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../auth/stores/auth.store';

export const adminGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isAuthenticated()) {
    return router.parseUrl('/admin/login');
  }

  const userCached = sessionStorage.getItem('remindly_user');
  if (userCached) {
    try {
      const user = JSON.parse(userCached);
      if (user.super_admin === true || user.role === 'super_admin') return true;
    } catch {
      // fall through to permissions check
    }
  }

  const cached = sessionStorage.getItem('remindly_permissions');
  if (cached) {
    try {
      const raw = JSON.parse(cached);
      let permissions: string[] = [];
      if (Array.isArray(raw)) {
        permissions = raw;
      } else if (raw && typeof raw === 'object') {
        const obj = raw as Record<string, unknown>;
        if ('data' in obj && Array.isArray(obj['data'])) permissions = obj['data'] as string[];
        else if ('permissions' in obj && Array.isArray(obj['permissions'])) permissions = obj['permissions'] as string[];
      }
      if (permissions.includes('admin.access')) return true;
    } catch {
      // ignore
    }
  }

  return router.parseUrl('/dashboard');
};
