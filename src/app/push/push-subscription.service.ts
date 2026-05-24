import { Injectable, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { lastValueFrom } from 'rxjs';
import { BaseApiClient } from '../api/base-api.client';

@Injectable({ providedIn: 'root' })
export class PushSubscriptionService extends BaseApiClient {
  private readonly swPush = inject(SwPush);
  private vapidKey: string | null = null;

  async initialize(): Promise<void> {
    if (!this.swPush.isEnabled) return;
    if (this.vapidKey) return;
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
    console.log('[PushSubscriptionService] Registering... swPush.isEnabled:', this.swPush.isEnabled, 'vapidKey:', this.vapidKey);
    if (!this.vapidKey || !this.swPush.isEnabled) {
      console.warn('[PushSubscriptionService] Registration skipped: missing VAPID key or service worker disabled.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('[PushSubscriptionService] Notification permission:', permission);
      if (permission !== 'granted') return;

      console.log('[PushSubscriptionService] Requesting subscription from SwPush...');
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: this.vapidKey,
      });
      console.log('[PushSubscriptionService] Received SwPush subscription:', subscription.toJSON());

      await lastValueFrom(
        this.post('/api/v1/push/subscribe', subscription.toJSON())
      );
      console.log('[PushSubscriptionService] Subscription successfully saved on backend.');
    } catch (err) {
      console.error('[PushSubscriptionService] Registration failed:', err);
    }
  }

  async unregister(): Promise<void> {
    if (!this.swPush.isEnabled) return;
    try {
      const subscription = await this.swPush.subscription.toPromise();
      if (subscription) {
        await lastValueFrom(
          this.post('/api/v1/push/unsubscribe', subscription.toJSON())
        );
        await this.swPush.unsubscribe();
      }
    } catch {
      // unsubscribe failed — non-critical
    }
  }
}
