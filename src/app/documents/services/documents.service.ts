import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseApiClient } from '../../api/base-api.client';
import type { Document, DocumentUpdateRequest, DocumentReport } from '../models/document.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentsService extends BaseApiClient {

  listDocuments(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Observable<{ documents: Document[]; total: number }> {
    return this.get<unknown>('/api/v1/documents', {
      status: params?.status,
      limit: params?.limit ?? 20,
      offset: params?.offset ?? 0,
    }).pipe(map((data: any) => {
      if (data && data.success && data.data) {
        const docs = Array.isArray(data.data) ? data.data : [data.data];
        return { documents: docs, total: docs.length };
      }
      if (Array.isArray(data)) return { documents: data, total: data.length };
      if (data && data.documents) return data;
      if (data && data.data) return { documents: data.data, total: data.total ?? data.data.length };
      return { documents: data ?? [], total: 0 };
    }));
  }

  getDocument(documentId: string): Observable<Document> {
    return this.get<unknown>(`/api/v1/documents/${documentId}`)
      .pipe(map((data: any) => {
        if (data && data.success && data.data) return data.data as Document;
        return data as Document;
      }));
  }

  uploadDocument(file: File, title: string, description?: string | null): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (description) formData.append('description', description);
    return this.http.post<Document>(`${this.baseUrl}/api/v1/documents/upload`, formData);
  }

  downloadDocument(documentId: string, forceDownload = false): Observable<Blob> {
    const params: Record<string, string> = {};
    if (forceDownload) params['download'] = '1';
    const searchParams = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}/api/v1/documents/${documentId}/download${searchParams ? '?' + searchParams : ''}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  updateDocument(documentId: string, request: DocumentUpdateRequest): Observable<Document> {
    return this.patch<unknown>(`/api/v1/documents/${documentId}`, request)
      .pipe(map((data: any) => {
        if (data && data.success && data.data) return data.data as Document;
        return data as Document;
      }));
  }

  deleteDocument(documentId: string): Observable<void> {
    return this.delete<void>(`/api/v1/documents/${documentId}`);
  }

  approveDocument(documentId: string): Observable<Document> {
    return this.post<unknown>(`/api/v1/documents/${documentId}/approve`, {})
      .pipe(map((data: any) => {
        if (data && data.success && data.data) return data.data as Document;
        return data as Document;
      }));
  }

  rejectDocument(documentId: string): Observable<Document> {
    return this.post<unknown>(`/api/v1/documents/${documentId}/reject`, {})
      .pipe(map((data: any) => {
        if (data && data.success && data.data) return data.data as Document;
        return data as Document;
      }));
  }

  getReport(): Observable<DocumentReport> {
    return this.get<unknown>('/api/v1/documents/report')
      .pipe(map((data: any) => {
        if (data && data.success && data.data) return data.data as DocumentReport;
        if (data && data.summary) return data as DocumentReport;
        return data as DocumentReport;
      }));
  }
}
