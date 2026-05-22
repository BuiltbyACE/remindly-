import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RbacStore } from '../../auth/stores/rbac.store';

export const permissionGuard = (...permissions: string[]): CanActivateFn => {
  return () => {
    const rbacStore = inject(RbacStore);
    const router = inject(Router);

    if (!rbacStore.isLoaded()) return true;

    const hasPermission = rbacStore.hasPermission();

    const hasAnyPermission = permissions.some(perm => hasPermission(perm));
    if (hasAnyPermission) return true;

    return router.parseUrl('/dashboard');
  };
};
