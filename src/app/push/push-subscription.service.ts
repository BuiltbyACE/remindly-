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
    if (!this.vapidKey || !this.swPush.isEnabled) return;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: this.vapidKey,
      });
      await lastValueFrom(
        this.post('/api/v1/push/subscribe', subscription.toJSON())
      );
    } catch {
      // push subscription failed — non-critical
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
