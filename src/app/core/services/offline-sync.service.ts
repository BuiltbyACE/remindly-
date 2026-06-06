import { Injectable, signal, inject } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '@env/environment';

export interface SyncAction {
  id?: number; // Auto-incremented by IndexedDB
  type: 'ACKNOWLEDGE_NOTIFICATION' | 'DISMISS_ALL';
  payload: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineSyncService {
  private indexedDb = inject(IndexedDbService);
  private toastService = inject(ToastService);
  private http = inject(HttpClient);
  
  public isOnline = signal<boolean>(navigator.onLine);
  private isSyncing = false;

  constructor() {
    this.setupNetworkListeners();
    // Try to sync on startup if online
    if (this.isOnline()) {
      this.sync();
    }
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline.set(true);
      this.toastService.success('Back online. Syncing changes...');
      this.sync();
    });

    window.addEventListener('offline', () => {
      this.isOnline.set(false);
      this.toastService.warning('You are offline. Changes will be saved locally and synced later.');
    });
  }

  /**
   * Queue an action to be executed when the network is restored.
   */
  async queueAction(type: SyncAction['type'], payload: any): Promise<void> {
    const action: SyncAction = {
      type,
      payload,
      timestamp: Date.now()
    };
    
    await this.indexedDb.add('sync-queue', action);
    
    if (this.isOnline()) {
      // Sometimes 'online' event doesn't fire immediately, or we queue while online
      this.sync();
    }
  }

  /**
   * Process the sync queue
   */
  async sync(): Promise<void> {
    if (!this.isOnline() || this.isSyncing) return;
    
    this.isSyncing = true;
    
    try {
      const actions = await this.indexedDb.getAll<SyncAction>('sync-queue');
      
      if (actions.length === 0) {
        this.isSyncing = false;
        return;
      }

      // Sort actions by timestamp
      actions.sort((a, b) => a.timestamp - b.timestamp);

      for (const action of actions) {
        try {
          await this.executeAction(action);
          // Only remove if successful
          if (action.id) {
            await this.indexedDb.delete('sync-queue', action.id);
          }
        } catch (error) {
          console.error(`Failed to execute sync action ${action.type}:`, error);
          // Stop syncing if we hit a network error, we'll try again later
          if (!navigator.onLine) {
            break;
          }
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Execute a single action against the backend
   */
  private async executeAction(action: SyncAction): Promise<void> {
    const baseUrl = environment.apiBaseUrl;
    
    switch (action.type) {
      case 'ACKNOWLEDGE_NOTIFICATION':
        const notificationId = action.payload.notificationId;
        const notes = action.payload.notes;
        await lastValueFrom(
          this.http.post(`${baseUrl}/api/v1/notifications/${notificationId}/acknowledge`, {
            notification_id: notificationId,
            notes
          }, { withCredentials: true })
        );
        break;
        
      case 'DISMISS_ALL':
        await lastValueFrom(
          this.http.post(`${baseUrl}/api/v1/notifications/mark-all-read`, {}, { withCredentials: true })
        );
        break;
        
      default:
        console.warn('Unknown sync action type:', action.type);
    }
  }
}
