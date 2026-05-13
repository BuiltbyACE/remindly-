import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RbacStore } from '../../auth/stores/rbac.store';

export const permissionGuard = (permission: string): CanActivateFn => {
  return () => {
    const rbacStore = inject(RbacStore);
    const router = inject(Router);

    if (rbacStore.hasPermission()(permission)) return true;

    return router.parseUrl('/dashboard');
  };
};
