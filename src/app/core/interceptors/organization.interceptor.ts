import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OrganizationStore } from '../../organizations/stores/organization.store';

export const organizationInterceptor: HttpInterceptorFn = (req, next) => {
  const orgStore = inject(OrganizationStore);
  const activeOrgId = orgStore.activeOrganizationId();

  if (!activeOrgId) return next(req);

  // Only inject header for API calls
  if (!req.url.includes('/api/')) return next(req);

  return next(
    req.clone({
      setHeaders: { 'X-Organization-ID': activeOrgId },
    }),
  );
};
