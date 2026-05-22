import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DocumentsStore } from '../../stores/documents.store';
import { RbacStore } from '../../../auth/stores/rbac.store';
import { DOCUMENT_STATUS_LABELS, formatFileSize } from '../../models/document.model';
import type { DocumentStatus } from '../../models/document.model';

@Component({
  selector: 'app-document-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe],
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
            <div class="overflow-x-auto">
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
          } @else {
            <div class="p-8 text-center">
              <p class="text-gray-500 mb-2">No documents found</p>
              <a routerLink="/documents/upload"
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
