import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocumentsStore } from '../stores/documents.store';
import { DocumentTableComponent } from '../components/document-table/document-table.component';

@Component({
  selector: 'app-documents-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DocumentTableComponent],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Documents</h1>
          <p class="text-gray-600 mt-1">Upload and manage organization documents</p>
        </div>
        <a routerLink="/documents/upload"
          class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Upload Document
        </a>
      </div>

      <app-document-table />
    </div>
  `,
})
export class DocumentsListPageComponent implements OnInit {
  readonly store = inject(DocumentsStore);

  ngOnInit(): void {
    this.store.loadDocuments();
  }
}
