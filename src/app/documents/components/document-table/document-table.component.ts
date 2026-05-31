import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DocumentsStore } from '../../stores/documents.store';
import { RbacStore } from '../../../auth/stores/rbac.store';
import { DOCUMENT_STATUS_LABELS, formatFileSize } from '../../models/document.model';
import type { DocumentStatus } from '../../models/document.model';
import { AppPermissionDirective } from '@shared/directives/app-permission/app-permission.directive';

@Component({
  selector: 'app-document-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, AppPermissionDirective],
  template: `
    <div class="space-y-4">
      <!-- Status Filter -->
      <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-44">
            <label class="block text-sm font-medium text-gray-600 mb-1">Status</label>
            <select (change)="onStatusChange($event)" [value]="selectedStatus()"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option value="">All Statuses</option>
              @for (opt of statusOptions; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>
          @if (selectedStatus()) {
            <div class="pt-6">
              <button type="button" (click)="resetFilter()"
                class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50">Reset</button>
            </div>
          }
        </div>
      </div>

      <!-- Loading State -->
      @if (store.loading()) {
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div class="animate-pulse space-y-3">
            @for (i of [1,2,3,4]; track i) {
              <div class="flex gap-4">
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                <div class="h-4 bg-gray-200 rounded w-1/6"></div>
                <div class="h-4 bg-gray-200 rounded w-1/6"></div>
                <div class="h-4 bg-gray-200 rounded w-1/4 ml-auto"></div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Error State -->
      @if (store.error(); as error) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
          <p class="text-red-800">{{ error }}</p>
          <button type="button" (click)="retry()" class="mt-2 text-sm text-red-600 hover:text-red-800 underline">Retry</button>
        </div>
      }

      <!-- Document Table -->
      @if (!store.loading() && !store.error()) {
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          @if (store.hasDocuments()) {
            <!-- Desktop Table View -->
            <div class="hidden lg:block overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                    <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (doc of store.documents(); track doc.id) {
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-4 py-3 whitespace-nowrap">
                        <a [routerLink]="['/documents', doc.id]" class="text-sm font-medium text-blue-600 hover:text-blue-800">{{ doc.title }}</a>
                        @if (doc.description) {
                          <p class="text-xs text-gray-500 truncate max-w-xs mt-0.5">{{ doc.description }}</p>
                        }
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <span class="inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full"
                          [class.bg-yellow-100]="doc.status === 'pending_approval'"
                          [class.text-yellow-800]="doc.status === 'pending_approval'"
                          [class.bg-green-100]="doc.status === 'approved'"
                          [class.text-green-800]="doc.status === 'approved'"
                          [class.bg-red-100]="doc.status === 'rejected'"
                          [class.text-red-800]="doc.status === 'rejected'">
                          {{ DOCUMENT_STATUS_LABELS[doc.status] }}
                        </span>
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        <div class="flex items-center gap-2">
                          <svg aria-hidden="true" class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span class="truncate max-w-[150px]">{{ doc.file_name }}</span>
                          <span class="text-xs text-gray-400">({{ formatFileSize(doc.file_size) }})</span>
                        </div>
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {{ doc.uploaded_by_name }}
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {{ doc.created_at | date:'mediumDate' }}
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <a [routerLink]="['/documents', doc.id]"
                          class="text-blue-600 hover:text-blue-800 font-medium">View</a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Mobile Card View -->
            <div class="block lg:hidden divide-y divide-gray-200">
              @for (doc of store.documents(); track doc.id) {
                <div class="p-4 hover:bg-gray-50 transition-colors flex items-start justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase"
                        [class.bg-yellow-50]="doc.status === 'pending_approval'"
                        [class.text-yellow-700]="doc.status === 'pending_approval'"
                        [class.bg-green-50]="doc.status === 'approved'"
                        [class.text-green-700]="doc.status === 'approved'"
                        [class.bg-red-50]="doc.status === 'rejected'"
                        [class.text-red-700]="doc.status === 'rejected'">
                        {{ doc.status.replace('_', ' ') }}
                      </span>
                      <span class="text-[10px] text-gray-400">
                        {{ doc.created_at | date:'shortDate' }}
                      </span>
                    </div>

                    <h3 class="text-sm font-semibold text-gray-900 mb-1">
                      <a [routerLink]="['/documents', doc.id]" class="text-blue-600 hover:text-blue-800">
                        {{ doc.title }}
                      </a>
                    </h3>
                    @if (doc.description) {
                      <p class="text-xs text-gray-500 line-clamp-2 mb-2">{{ doc.description }}</p>
                    }

                    <div class="flex items-center gap-1.5 text-xs text-gray-500">
                      <svg class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span class="truncate max-w-[150px]">{{ doc.file_name }}</span>
                      <span class="text-[10px] text-gray-400">({{ formatFileSize(doc.file_size) }})</span>
                    </div>
                    <p class="text-[10px] text-gray-400 mt-1">Uploaded by: {{ doc.uploaded_by_name }}</p>
                  </div>

                  <div class="flex-shrink-0 self-center">
                    <a [routerLink]="['/documents', doc.id]"
                       class="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg inline-flex items-center justify-center transition-colors">
                      <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </a>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="p-8 text-center">
              <p class="text-gray-500 mb-2">No documents found</p>
              <a routerLink="/documents/upload" *appPermission="'documents.upload'"
                class="text-sm text-blue-600 hover:text-blue-800 underline">Upload your first document</a>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class DocumentTableComponent {
  readonly store = inject(DocumentsStore);
  readonly rbacStore = inject(RbacStore);

  readonly selectedStatus = signal<string>('');

  readonly statusOptions = Object.entries(DOCUMENT_STATUS_LABELS).map(([value, label]) => ({
    value, label,
  }));

  readonly DOCUMENT_STATUS_LABELS = DOCUMENT_STATUS_LABELS;
  readonly formatFileSize = formatFileSize;

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedStatus.set(value);
    this.store.loadDocuments({ status: value || undefined });
  }

  resetFilter(): void {
    this.selectedStatus.set('');
    this.store.loadDocuments();
  }

  retry(): void {
    this.store.clearError();
    this.store.loadDocuments({ status: this.selectedStatus() || undefined });
  }
}
