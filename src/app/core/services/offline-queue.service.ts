/**
 * OfflineQueueService
 * Manages action queueing and IndexedDB caching for offline support
 * Automatically queues actions when offline and syncs when back online
 */

import { Injectable, inject, NgZone } from '@angular/core';
import { Subject, from, of } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';

export interface QueuedAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  payload: unknown;
  timestamp: number;
  retry_count: number;
  priority: 'high' | 'normal' | 'low';
}

export interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  timestamp: number;
  expires_at: number;
}

const DB_NAME = 'RemindlyOfflineDB';
const DB_VERSION = 1;
const ACTION_STORE = 'actionQueue';
const CACHE_STORE = 'cache';

@Injectable({
  providedIn: 'root',
})
export class OfflineQueueService {
  private readonly ngZone = inject(NgZone);
  private db: IDBDatabase | null = null;
  private isOnline = navigator.onLine;
  private actionQueue: QueuedAction[] = [];
  private isProcessing = false;

  // Observable for queue status updates
  readonly queueStatus$ = new Subject<{ queueLength: number; isProcessing: boolean }>();
  readonly syncComplete$ = new Subject<boolean>();

  constructor() {
    this.initDatabase();
    this.setupNetworkListeners();
    this.loadQueueFromStorage();
  }

  /**
   * Initialize IndexedDB
   */
  private initDatabase(): void {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not supported');
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB');
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      console.log('IndexedDB initialized');
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store for queued actions
      if (!db.objectStoreNames.contains(ACTION_STORE)) {
        const actionStore = db.createObjectStore(ACTION_STORE, { keyPath: 'id' });
        actionStore.createIndex('timestamp', 'timestamp', { unique: false });
        actionStore.createIndex('priority', 'priority', { unique: false });
      }

      // Store for cached data
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        const cacheStore = db.createObjectStore(CACHE_STORE, { keyPath: 'key' });
        cacheStore.createIndex('expires_at', 'expires_at', { unique: false });
      }
    };
  }

  /**
   * Setup online/offline event listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.ngZone.run(() => {
        this.isOnline = true;
        console.log('Back online - starting sync');
        this.processQueue();
      });
    });

    window.addEventListener('offline', () => {
      this.ngZone.run(() => {
        this.isOnline = false;
        console.log('Gone offline - queueing actions');
      });
    });
  }

  /**
   * Check if currently online
   */
  isCurrentlyOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Add an action to the queue
   */
  async queueAction(
    type: QueuedAction['type'],
    entity: string,
    payload: unknown,
    priority: QueuedAction['priority'] = 'normal'
  ): Promise<string> {
    const action: QueuedAction = {
      id: this.generateId(),
      type,
      entity,
      payload,
      timestamp: Date.now(),
      retry_count: 0,
      priority,
    };

    this.actionQueue.push(action);
    await this.saveQueueToStorage();
    this.emitQueueStatus();

    // If online, try to process immediately
    if (this.isOnline) {
      this.processQueue();
    }

    return action.id;
  }

  /**
   * Process the action queue
   */
  private async processQueue(): Promise<void> {
    if (!this.isOnline || this.isProcessing || this.actionQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.emitQueueStatus();

    // Sort by priority and timestamp
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    const sortedQueue = [...this.actionQueue].sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });

    const failedActions: QueuedAction[] = [];

    for (const action of sortedQueue) {
      try {
        const success = await this.executeAction(action);
        if (!success) {
          action.retry_count++;
          if (action.retry_count < 3) {
            failedActions.push(action);
          }
        }
      } catch (error) {
        console.error('Failed to execute action:', action, error);
        action.retry_count++;
        if (action.retry_count < 3) {
          failedActions.push(action);
        }
      }
    }

    this.actionQueue = failedActions;
    await this.saveQueueToStorage();

    this.isProcessing = false;
    this.emitQueueStatus();
    this.syncComplete$.next(failedActions.length === 0);

    // If some actions failed, retry after delay
    if (failedActions.length > 0) {
      setTimeout(() => this.processQueue(), 30000);
    }
  }

  /**
   * Execute a queued action
   * This would integrate with actual API calls
   */
  private async executeAction(action: QueuedAction): Promise<boolean> {
    // This is a placeholder - actual implementation would call the appropriate service
    console.log('Executing action:', action);

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // 90% success rate for demo
        resolve(Math.random() > 0.1);
      }, 500);
    });
  }

  /**
   * Cache data to IndexedDB
   */
  async cacheData<T>(key: string, data: T, ttlMinutes = 60): Promise<void> {
    if (!this.db) return;

    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      expires_at: Date.now() + ttlMinutes * 60 * 1000,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_STORE], 'readwrite');
      const store = transaction.objectStore(CACHE_STORE);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cached data from IndexedDB
   */
  async getCachedData<T>(key: string): Promise<T | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_STORE], 'readonly');
      const store = transaction.objectStore(CACHE_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry: CacheEntry<T> | undefined = request.result;
        if (!entry) {
          resolve(null);
          return;
        }

        // Check if expired
        if (entry.expires_at < Date.now()) {
          // Delete expired entry
          this.deleteCachedData(key);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete cached data
   */
  async deleteCachedData(key: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_STORE], 'readwrite');
      const store = transaction.objectStore(CACHE_STORE);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_STORE], 'readwrite');
      const store = transaction.objectStore(CACHE_STORE);
      const index = store.index('expires_at');
      const range = IDBKeyRange.upperBound(Date.now());
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get current queue status
   */
  getQueueStatus(): { queueLength: number; isProcessing: boolean; isOnline: boolean } {
    return {
      queueLength: this.actionQueue.length,
      isProcessing: this.isProcessing,
      isOnline: this.isOnline,
    };
  }

  /**
   * Clear the action queue
   */
  async clearQueue(): Promise<void> {
    this.actionQueue = [];
    await this.saveQueueToStorage();
    this.emitQueueStatus();
  }

  /**
   * Save queue to storage
   */
  private async saveQueueToStorage(): Promise<void> {
    try {
      localStorage.setItem('offlineActionQueue', JSON.stringify(this.actionQueue));
    } catch (error) {
      console.error('Failed to save queue:', error);
    }
  }

  /**
   * Load queue from storage
   */
  private loadQueueFromStorage(): void {
    try {
      const saved = localStorage.getItem('offlineActionQueue');
      if (saved) {
        this.actionQueue = JSON.parse(saved);
        this.emitQueueStatus();
      }
    } catch (error) {
      console.error('Failed to load queue:', error);
    }
  }

  /**
   * Emit queue status
   */
  private emitQueueStatus(): void {
    this.queueStatus$.next({
      queueLength: this.actionQueue.length,
      isProcessing: this.isProcessing,
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
