import { Component, ChangeDetectionStrategy, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DocumentsStore } from '../stores/documents.store';
import { DocumentsService } from '../services/documents.service';
import { RbacStore } from '../../auth/stores/rbac.store';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DOCUMENT_STATUS_LABELS, formatFileSize, isRenderableMime } from '../models/document.model';

@Component({
  selector: 'app-document-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, ConfirmDialogComponent],
  template: `
    <div class="p-6">
      <!-- Breadcrumb -->
      <div class="mb-6 flex items-center gap-2 text-sm text-gray-600">
        <a routerLink="/documents" class="hover:text-blue-600">Documents</a>
        <span>/</span>
        @if (store.selectedDocument(); as doc) {
          <span class="text-gray-900 font-medium truncate max-w-xs">{{ doc.title }}</span>
        } @else {
          <span class="text-gray-400">Loading...</span>
        }
      </div>

      <!-- Loading State -->
      @if (store.loading()) {
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div class="animate-pulse space-y-4">
            <div class="h-6 bg-gray-200 rounded w-1/3"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      }

      <!-- Not Found -->
      @if (store.notFound()) {
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p class="text-gray-500">Document not found</p>
          <a routerLink="/documents" class="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800">Back to documents</a>
        </div>
      }

      <!-- Error State -->
      @if (store.error(); as error) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
          <p class="text-red-800">{{ error }}</p>
          <button type="button" (click)="retry()" class="mt-2 text-sm text-red-600 hover:text-red-800 underline">Retry</button>
        </div>
      }

      <!-- Document Detail -->
      @if (!store.loading() && !store.notFound() && !store.error()) {
        @if (store.selectedDocument(); as doc) {
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <!-- Header -->
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <h1 class="text-2xl font-bold text-gray-900 truncate">{{ doc.title }}</h1>
                    <span class="inline-flex px-3 py-1 text-xs font-medium rounded-full flex-shrink-0"
                      [class.bg-yellow-100]="doc.status === 'pending_approval'"
                      [class.text-yellow-800]="doc.status === 'pending_approval'"
                      [class.bg-green-100]="doc.status === 'approved'"
                      [class.text-green-800]="doc.status === 'approved'"
                      [class.bg-red-100]="doc.status === 'rejected'"
                      [class.text-red-800]="doc.status === 'rejected'">
                      {{ DOCUMENT_STATUS_LABELS[doc.status] }}
                    </span>
                  </div>
                  @if (doc.description) {
                    <p class="text-gray-600">{{ doc.description }}</p>
                  }
                </div>
              </div>
            </div>

            <!-- Metadata -->
            <div class="p-6 border-b border-gray-200">
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">File</dt>
                  <dd class="mt-1 text-sm text-gray-900 flex items-center gap-2">
                    <svg aria-hidden="true" class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    {{ doc.file_name }}
                    <span class="text-gray-400">({{ formatFileSize(doc.file_size) }})</span>
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ doc.mime_type }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ doc.uploaded_by_name }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded At</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ doc.created_at | date:'medium' }}</dd>
                </div>
                @if (doc.approved_by_name) {
                  <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Approved By</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ doc.approved_by_name }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Approved At</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ doc.approved_at | date:'medium' }}</dd>
                  </div>
                }
              </dl>
            </div>

            <!-- Actions -->
            <div class="p-6 bg-gray-50 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <!-- Download -->
                <button type="button" (click)="download(doc.id)"
                  class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </button>

                <!-- View Inline -->
                <button type="button" (click)="viewInline(doc.id)"
                  class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </button>
              </div>

              <div class="flex items-center gap-3">
                <!-- Approve (Executive only) -->
                @if (canApprove() && doc.status === 'pending_approval') {
                  <button type="button" (click)="showApproveConfirm.set(true)"
                    class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                    <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Approve
                  </button>
                }

                <!-- Reject (Executive only) -->
                @if (canApprove() && doc.status === 'pending_approval') {
                  <button type="button" (click)="showRejectConfirm.set(true)"
                    class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                    <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </button>
                }

                <!-- Delete (Executive only) -->
                @if (canDelete()) {
                  <button type="button" (click)="showDeleteConfirm.set(true)"
                    class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                    <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                }
              </div>
            </div>
          </div>
        }
      }
    </div>

    <!-- Approve Confirmation -->
    @if (showApproveConfirm()) {
      <app-confirm-dialog
        title="Approve Document"
        message="Are you sure you want to approve this document?"
        confirmText="Approve"
        variant="default"
        (confirmed)="approve()"
        (cancelled)="showApproveConfirm.set(false)"
      />
    }

    <!-- Reject Confirmation -->
    @if (showRejectConfirm()) {
      <app-confirm-dialog
        title="Reject Document"
        message="Are you sure you want to reject this document?"
        confirmText="Reject"
        variant="danger"
        (confirmed)="reject()"
        (cancelled)="showRejectConfirm.set(false)"
      />
    }

    <!-- Delete Confirmation -->
    @if (showDeleteConfirm()) {
      <app-confirm-dialog
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        (confirmed)="delete()"
        (cancelled)="showDeleteConfirm.set(false)"
      />
    }
  `,
})
export class DocumentDetailComponent implements OnInit {
  readonly store = inject(DocumentsStore);
  readonly documentsService = inject(DocumentsService);
  readonly rbacStore = inject(RbacStore);
  readonly router = inject(Router);
  readonly toast = inject(ToastService);

  readonly documentId = input.required<string>({ alias: 'id' });

  readonly showApproveConfirm = signal(false);
  readonly showRejectConfirm = signal(false);
  readonly showDeleteConfirm = signal(false);

  readonly DOCUMENT_STATUS_LABELS = DOCUMENT_STATUS_LABELS;
  readonly formatFileSize = formatFileSize;

  canApprove = () => this.rbacStore.hasPermission()('documents.approve');
  canDelete = () => this.rbacStore.hasPermission()('documents.delete');

  ngOnInit(): void {
    this.store.clearSelection();
    this.store.selectDocument(this.documentId());
  }

  retry(): void {
    this.store.clearError();
    this.store.selectDocument(this.documentId());
  }

  async download(documentId: string): Promise<void> {
    try {
      const blob = await this.documentsService.downloadDocument(documentId).toPromise();
      if (!blob) return;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const doc = this.store.selectedDocument();
      a.download = doc?.file_name ?? 'document';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      this.toast.error('Failed to download document');
    }
  }

  async viewInline(documentId: string): Promise<void> {
    try {
      const blob = await this.documentsService.downloadDocument(documentId).toPromise();
      if (!blob) return;
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      this.toast.error('Failed to view document');
    }
  }

  async approve(): Promise<void> {
    this.showApproveConfirm.set(false);
    const doc = await this.store.approveDocument(this.documentId());
    if (doc) {
      this.toast.success('Document approved');
    } else if (this.store.error()) {
      this.toast.error(this.store.error()!);
    }
  }

  async reject(): Promise<void> {
    this.showRejectConfirm.set(false);
    const doc = await this.store.rejectDocument(this.documentId());
    if (doc) {
      this.toast.success('Document rejected');
    } else if (this.store.error()) {
      this.toast.error(this.store.error()!);
    }
  }

  async delete(): Promise<void> {
    this.showDeleteConfirm.set(false);
    const success = await this.store.deleteDocument(this.documentId());
    if (success) {
      this.toast.success('Document deleted');
      this.router.navigate(['/documents']);
    } else if (this.store.error()) {
      this.toast.error(this.store.error()!);
    }
  }
}
