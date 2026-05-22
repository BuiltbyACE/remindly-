import { Injectable, inject, computed, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { DocumentsService } from '../services/documents.service';
import type { Document, DocumentUpdateRequest, DocumentReport } from '../models/document.model';

export interface DocumentsState {
  documents: Document[];
  selectedDocument: Document | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  report: DocumentReport | null;
  reportLoading: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentsStore {
  private readonly documentsService = inject(DocumentsService);

  private readonly state = signal<DocumentsState>({
    documents: [],
    selectedDocument: null,
    loading: false,
    error: null,
    notFound: false,
    report: null,
    reportLoading: false,
  });

  readonly documents = computed(() => this.state().documents);
  readonly selectedDocument = computed(() => this.state().selectedDocument);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly notFound = computed(() => this.state().notFound);
  readonly report = computed(() => this.state().report);
  readonly reportLoading = computed(() => this.state().reportLoading);
  readonly hasDocuments = computed(() => this.state().documents.length > 0);

  async loadDocuments(params?: { status?: string }): Promise<void> {
    this.patchState({ loading: true, error: null, notFound: false });

    try {
      const result = await lastValueFrom(
        this.documentsService.listDocuments(params)
      );
      this.patchState({
        documents: result.documents,
        loading: false,
      });
    } catch (err: unknown) {
      const is404 = !!(err && typeof err === 'object' && 'status' in err &&
        (err as { status: number }).status === 404);
      this.patchState({
        error: is404 ? null : (err instanceof Error ? err.message : 'Failed to load documents'),
        notFound: is404,
        loading: false,
      });
    }
  }

  async selectDocument(documentId: string): Promise<void> {
    this.patchState({ loading: true, error: null, notFound: false });

    try {
      const doc = await lastValueFrom(this.documentsService.getDocument(documentId));
      this.patchState({
        selectedDocument: doc,
        loading: false,
      });
    } catch (err: unknown) {
      const is404 = !!(err && typeof err === 'object' && 'status' in err &&
        (err as { status: number }).status === 404);
      this.patchState({
        error: is404 ? null : (err instanceof Error ? err.message : 'Failed to load document'),
        notFound: is404,
        loading: false,
      });
    }
  }

  clearSelection(): void {
    this.patchState({ selectedDocument: null, notFound: false });
  }

  async uploadDocument(file: File, title: string, description?: string | null): Promise<Document | null> {
    this.patchState({ loading: true, error: null });

    try {
      const doc = await lastValueFrom(
        this.documentsService.uploadDocument(file, title, description)
      );
      this.patchState({ loading: false });
      return doc;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      this.patchState({ error: message, loading: false });
      return null;
    }
  }

  async updateDocument(documentId: string, request: DocumentUpdateRequest): Promise<Document | null> {
    this.patchState({ loading: true, error: null });

    try {
      const doc = await lastValueFrom(
        this.documentsService.updateDocument(documentId, request)
      );
      if (this.state().selectedDocument?.id === documentId) {
        this.patchState({ selectedDocument: doc });
      }
      this.patchState({ loading: false });
      return doc;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update document';
      this.patchState({ error: message, loading: false });
      return null;
    }
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    this.patchState({ loading: true, error: null });

    try {
      await lastValueFrom(this.documentsService.deleteDocument(documentId));
      if (this.state().selectedDocument?.id === documentId) {
        this.patchState({ selectedDocument: null });
      }
      this.patchState({ loading: false });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete document';
      this.patchState({ error: message, loading: false });
      return false;
    }
  }

  async approveDocument(documentId: string): Promise<Document | null> {
    return this.executeAction(documentId, 'approve', () =>
      this.documentsService.approveDocument(documentId)
    );
  }

  async rejectDocument(documentId: string): Promise<Document | null> {
    return this.executeAction(documentId, 'reject', () =>
      this.documentsService.rejectDocument(documentId)
    );
  }

  async loadReport(): Promise<void> {
    this.patchState({ reportLoading: true, error: null });

    try {
      const report = await lastValueFrom(this.documentsService.getReport());
      this.patchState({ report, reportLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load report';
      this.patchState({ error: message, reportLoading: false });
    }
  }

  clearError(): void {
    this.patchState({ error: null });
  }

  private async executeAction(
    documentId: string,
    action: string,
    serviceCall: () => ReturnType<typeof this.documentsService.approveDocument>,
  ): Promise<Document | null> {
    this.patchState({ loading: true, error: null });

    try {
      const doc = await lastValueFrom(serviceCall());
      const current = this.state();
      const updatedDocs = current.documents.map(d =>
        d.id === documentId ? doc : d
      );
      const updatedSelected =
        current.selectedDocument?.id === documentId ? doc : current.selectedDocument;
      this.patchState({
        documents: updatedDocs,
        selectedDocument: updatedSelected,
        loading: false,
      });
      return doc;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : `Failed to ${action} document`;
      this.patchState({ error: message, loading: false });
      return null;
    }
  }

  private patchState(partial: Partial<DocumentsState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }
}
