import { Routes } from '@angular/router';
import { permissionGuard } from '../core/guards/permission.guard';

export const DOCUMENTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard('documents.read')],
    loadComponent: () => import('./feature-list/documents-list-page.component').then(m => m.DocumentsListPageComponent),
  },
  {
    path: 'upload',
    canActivate: [permissionGuard('documents.read', 'documents.upload')],
    loadComponent: () => import('./feature-create/document-upload.component').then(m => m.DocumentUploadComponent),
  },
  {
    path: 'report',
    canActivate: [permissionGuard('documents.read')],
    loadComponent: () => import('./feature-report/documents-report.component').then(m => m.DocumentsReportComponent),
  },
  {
    path: ':id',
    canActivate: [permissionGuard('documents.read')],
    loadComponent: () => import('./feature-detail/document-detail.component').then(m => m.DocumentDetailComponent),
  },
];
