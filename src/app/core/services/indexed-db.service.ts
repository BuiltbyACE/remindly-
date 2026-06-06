import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {
  private dbName = 'remindly-offline-db';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.initDB();
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB is not supported in this browser.');
        resolve();
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error('IndexedDB error:', event);
        reject('IndexedDB error');
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache');
        }
        
        if (!db.objectStoreNames.contains('sync-queue')) {
          db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async get<T>(storeName: string, key: string | number): Promise<T | null> {
    await this.initPromise;
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result as T || null);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async set(storeName: string, key: string | number, value: any): Promise<void> {
    await this.initPromise;
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(value, key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }
  
  async add(storeName: string, value: any): Promise<number | string> {
    await this.initPromise;
    if (!this.db) return -1;

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(value);

        request.onsuccess = () => resolve(request.result as number | string);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async delete(storeName: string, key: string | number): Promise<void> {
    await this.initPromise;
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    await this.initPromise;
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve((request.result as T[]) || []);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async clear(storeName: string): Promise<void> {
    await this.initPromise;
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }
}
