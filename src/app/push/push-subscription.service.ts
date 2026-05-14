import { Injectable, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { BaseApiClient } from '../api/base-api.client';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

@Injectable({ providedIn: 'root' })
export class PushSubscriptionService extends BaseApiClient {
  private vapidKey: string | null = null;

  async initialize(): Promise<void> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    try {
      const response = await lastValueFrom(
        this.get<{ public_key: string }>('/api/v1/push/vapid-key')
      );
      this.vapidKey = response.public_key;
    } catch {
      this.vapidKey = null;
    }
  }

  async register(): Promise<void> {
    if (!this.vapidKey) return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(this.vapidKey).buffer as ArrayBuffer,
      });
      await lastValueFrom(
        this.post('/api/v1/push/subscribe', subscription.toJSON())
      );
    } catch {
      // push subscription failed — non-critical
    }
  }

  async unregister(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await lastValueFrom(
          this.post('/api/v1/push/unsubscribe', subscription.toJSON())
        );
        await subscription.unsubscribe();
      }
    } catch {
      // unsubscribe failed — non-critical
    }
  }
}
