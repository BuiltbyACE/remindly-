import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DocumentsStore } from '../stores/documents.store';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-document-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div class="max-w-2xl mx-auto">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900">Upload Document</h1>
          <p class="text-gray-500 mt-2">Upload a document to the organization registry</p>
        </div>

        <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <h2 class="text-lg font-semibold text-white">Document Details</h2>
          </div>
          <div class="p-6 space-y-6">
            <!-- File Drop Zone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">File *</label>
              <div
                class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
                [class.border-indigo-400]="isDragging()"
                [class.border-gray-300]="!isDragging()"
                [class.bg-indigo-50]="isDragging()"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave()"
                (drop)="onDrop($event)"
                (click)="fileInput.click()"
              >
                @if (selectedFile(); as file) {
                  <div class="flex items-center justify-center gap-3">
                    <svg aria-hidden="true" class="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div class="text-left">
                      <p class="text-sm font-medium text-gray-900">{{ file.name }}</p>
                      <p class="text-xs text-gray-500">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</p>
                    </div>
                    <button type="button" (click)="removeFile($event)" class="p-1 hover:bg-gray-100 rounded-full">
                      <svg aria-hidden="true" class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                } @else {
                  <svg aria-hidden="true" class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="text-sm text-gray-600">
                    <span class="text-indigo-600 font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p class="text-xs text-gray-400 mt-1">PDF, PNG, JPEG, DOCX, XLSX, PPTX, TXT up to 25MB</p>
                }
              </div>
              <input #fileInput type="file" (change)="onFileSelected($event)" class="hidden" accept="*" />
            </div>

            <!-- Title -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input id="title" type="text" [(ngModel)]="title"
                placeholder="Enter document title"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea id="description" [(ngModel)]="description" rows="3"
                placeholder="Optional description of the document"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"></textarea>
            </div>

            <!-- Error -->
            @if (store.error(); as error) {
              <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            }

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <a routerLink="/documents"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</a>
              <button type="button" (click)="onSubmit()" [disabled]="!canSubmit() || store.loading()"
                class="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                @if (store.loading()) {
                  <span class="flex items-center gap-2">
                    <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                } @else {
                  Upload Document
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DocumentUploadComponent {
  readonly store = inject(DocumentsStore);
  readonly router = inject(Router);
  readonly toast = inject(ToastService);

  readonly title = signal('');
  readonly description = signal('');
  readonly selectedFile = signal<File | null>(null);
  readonly isDragging = signal(false);

  readonly canSubmit = () => !!this.title() && !!this.selectedFile();

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    if (event.dataTransfer?.files.length) {
      this.selectedFile.set(event.dataTransfer.files[0]);
    }
  }

  removeFile(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedFile.set(null);
  }

  async onSubmit(): Promise<void> {
    const file = this.selectedFile();
    const title = this.title();
    if (!file || !title) return;

    this.store.clearError();
    const doc = await this.store.uploadDocument(file, title, this.description() || null);

    if (doc) {
      this.toast.success('Document uploaded successfully');
      this.router.navigate(['/documents', doc.id]);
    } else if (this.store.error()) {
      this.toast.error(this.store.error()!);
    }
  }
}
