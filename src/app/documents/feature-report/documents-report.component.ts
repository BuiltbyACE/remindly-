import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DocumentsStore } from '../stores/documents.store';
import { DOCUMENT_STATUS_LABELS, formatFileSize } from '../models/document.model';

@Component({
  selector: 'app-documents-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Document Report</h1>
        <p class="text-gray-600 mt-1">Overview of all documents in the registry</p>
      </div>

      @if (store.reportLoading()) {
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div class="animate-pulse space-y-4">
            <div class="h-6 bg-gray-200 rounded w-1/3"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      }

      @if (store.report(); as report) {
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p class="text-sm text-gray-500 font-medium">Total Documents</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ report.summary.total_documents }}</p>
          </div>
          <div class="bg-white rounded-xl border border-yellow-200 shadow-sm p-5">
            <p class="text-sm text-yellow-600 font-medium">Pending Approval</p>
            <p class="text-3xl font-bold text-yellow-700 mt-1">{{ report.summary.pending_approval }}</p>
          </div>
          <div class="bg-white rounded-xl border border-green-200 shadow-sm p-5">
            <p class="text-sm text-green-600 font-medium">Approved</p>
            <p class="text-3xl font-bold text-green-700 mt-1">{{ report.summary.approved }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p class="text-sm text-gray-500 font-medium">Total Size</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ report.summary.total_size_mb.toFixed(1) }} MB</p>
          </div>
        </div>

        <!-- Document List -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">All Documents</h2>
          </div>
          @if (report.documents.length > 0) {
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Date</th>
                    <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (doc of report.documents; track doc.id) {
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-4 py-3 whitespace-nowrap">
                        <a [routerLink]="['/documents', doc.id]" class="text-sm font-medium text-blue-600 hover:text-blue-800">{{ doc.title }}</a>
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
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ doc.uploaded_by_name }}</td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{{ doc.created_at | date:'mediumDate' }}</td>
                      <td class="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <a [routerLink]="['/documents', doc.id]" class="text-blue-600 hover:text-blue-800 font-medium">View</a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="p-8 text-center">
              <p class="text-gray-500">No documents in the report</p>
            </div>
          }
        </div>
      }

      @if (store.error() && !store.reportLoading()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
          <p class="text-red-800">{{ store.error() }}</p>
          <button type="button" (click)="retry()" class="mt-2 text-sm text-red-600 hover:text-red-800 underline">Retry</button>
        </div>
      }
    </div>
  `,
})
export class DocumentsReportComponent implements OnInit {
  readonly store = inject(DocumentsStore);
  readonly DOCUMENT_STATUS_LABELS = DOCUMENT_STATUS_LABELS;
  readonly formatFileSize = formatFileSize;

  ngOnInit(): void {
    this.store.loadReport();
  }

  retry(): void {
    this.store.clearError();
    this.store.loadReport();
  }
}
