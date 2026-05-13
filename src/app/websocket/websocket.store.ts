/**
 * WebSocketStore
 * Signal-based state management for WebSocket connection
 */

import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { WebSocketService, type ConnectionStatus, type WebSocketMessage } from './websocket.service';
import { Subscription } from 'rxjs';

interface WebSocketState {
  connectionStatus: ConnectionStatus;
  lastEvent: string | null;
  reconnectAttempts: number;
  isManualDisconnect: boolean;
}

const initialState: WebSocketState = {
  connectionStatus: 'disconnected',
  lastEvent: null,
  reconnectAttempts: 0,
  isManualDisconnect: false,
};

export const WebSocketStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  
  withMethods((store, webSocketService = inject(WebSocketService)) => {
    let statusSubscription: Subscription | null = null;
    let messageSubscription: Subscription | null = null;

    return {
      /**
       * Initialize the store by subscribing to WebSocket service
       */
      initialize(): void {
        // Subscribe to connection status changes
        statusSubscription = webSocketService.status$.subscribe((status) => {
          patchState(store, { 
            connectionStatus: status,
            reconnectAttempts: status === 'connected' ? 0 : webSocketService.currentReconnectAttempts
          });
        });

        // Subscribe to messages to track last event
        messageSubscription = webSocketService.messages$.subscribe((message) => {
          patchState(store, { 
            lastEvent: new Date().toISOString()
          });
        });
      },

      /**
       * Connect to WebSocket server
       */
      connect(organizationId?: string): void {
        patchState(store, { isManualDisconnect: false });
        webSocketService.connect(organizationId);
      },

      /**
       * Disconnect from WebSocket server
       */
      disconnect(): void {
        patchState(store, { isManualDisconnect: true });
        webSocketService.disconnect();
      },

      /**
       * Manually trigger reconnect
       */
      reconnect(): void {
        webSocketService.disconnect();
        setTimeout(() => {
          webSocketService.connect();
        }, 100);
      },

      /**
       * Get observable for specific message types
       */
      messagesOfType(type: string) {
        return webSocketService.messagesOfType(type);
      },

      /**
       * Get observable for multiple message types
       */
      messagesOfTypes(types: string[]) {
        return webSocketService.messagesOfTypes(types);
      },

      /**
       * Send a message through WebSocket
       */
      send(message: unknown): void {
        webSocketService.send(message);
      },

      /**
       * Cleanup subscriptions
       */
      cleanup(): void {
        if (statusSubscription) {
          statusSubscription.unsubscribe();
          statusSubscription = null;
        }
        if (messageSubscription) {
          messageSubscription.unsubscribe();
          messageSubscription = null;
        }
        webSocketService.disconnect();
      },

      /**
       * Check if currently connected
       */
      isConnected(): boolean {
        return webSocketService.isConnected;
      },

      /**
       * Reset store to initial state
       */
      reset(): void {
        patchState(store, initialState);
      }
    };
  })
);
