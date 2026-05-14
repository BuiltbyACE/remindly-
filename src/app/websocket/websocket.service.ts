/**
 * WebSocketService
 * Enterprise-grade WebSocket client with auto-reconnect and heartbeat
 */

import { Injectable, inject, NgZone } from '@angular/core';
import { Subject, Observable, filter, map, retry, timer, Subscription } from 'rxjs';
import { API_CONFIG } from '../core/tokens/api-config.token';
import { AuthStore } from '../auth/stores/auth.store';

export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: string;
  organization_id?: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

/**
 * WebSocket message type constants matching backend app/websocket/enums.py
 */
export const WS_MESSAGE_TYPE = {
  NOTIFICATION_NEW: 'notification.new',
  NOTIFICATION_UPDATED: 'notification.updated',
  EVENT_UPDATED: 'event.updated',
  EVENT_REMINDER: 'event.reminder',
  ESCALATION_CREATED: 'escalation.created',
  APPROVAL_CREATED: 'approval.created',
  APPROVAL_UPDATED: 'approval.updated',
  VOICE_COMMAND_RESULT: 'voice.command_result',
  BRIEFING_READY: 'briefing.ready',
  CONNECTION_ACK: 'connection.ack',
  ERROR: 'error',
  PING: 'ping',
  PONG: 'pong',
} as const;

export type WsMessageType = (typeof WS_MESSAGE_TYPE)[keyof typeof WS_MESSAGE_TYPE];

/**
 * WebSocket subscription channel constants matching backend app/websocket/enums.py
 */
export const WS_SUBSCRIBE_TYPE = {
  USER: 'user',
  ORGANIZATION: 'organization',
  EVENT: 'event',
} as const;

export type WsSubscribeType = (typeof WS_SUBSCRIBE_TYPE)[keyof typeof WS_SUBSCRIBE_TYPE];

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private readonly apiConfig = inject(API_CONFIG);
  private readonly ngZone = inject(NgZone);
  private readonly authStore = inject(AuthStore);

  private ws: WebSocket | null = null;
  private messageSubject = new Subject<WebSocketMessage>();
  private statusSubject = new Subject<ConnectionStatus>();
  private connectionAckSubject = new Subject<void>();
  
  // Reconnect configuration
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly baseReconnectDelay = 1000; // 1 second
  private readonly maxReconnectDelay = 30000; // 30 seconds
  private reconnectSubscription: Subscription | null = null;
  
  // Heartbeat configuration
  private heartbeatInterval = 30000; // 30 seconds
  private heartbeatTimeout = 5000; // 5 seconds for pong response
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private pongTimeout: ReturnType<typeof setTimeout> | null = null;

  // Connection state
  private isManualDisconnect = false;
  private currentOrganizationId: string | null = null;

  /**
   * Observable of all WebSocket messages
   */
  get messages$(): Observable<WebSocketMessage> {
    return this.messageSubject.asObservable();
  }

  /**
   * Observable of connection status changes
   */
  get status$(): Observable<ConnectionStatus> {
    return this.statusSubject.asObservable();
  }

  /**
   * Observable that emits when connection.ack is received from server
   */
  get connectionAck$(): Observable<void> {
    return this.connectionAckSubject.asObservable();
  }

  /**
   * Connect to WebSocket server
   */
  connect(organizationId?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isManualDisconnect = false;
    this.currentOrganizationId = organizationId || null;
    
    const wsUrl = this.buildWebSocketUrl(organizationId);
    
    this.updateStatus('connecting');

    this.ngZone.runOutsideAngular(() => {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        this.ngZone.run(() => {
          this.reconnectAttempts = 0;
          this.updateStatus('connected');
          this.startHeartbeat();
        });
      };

      this.ws.onmessage = (event) => {
        this.ngZone.run(() => {
          this.handleMessage(event.data);
        });
      };

      this.ws.onerror = (error) => {
        this.ngZone.run(() => {
          console.error('[WebSocket] Connection error:', error);
        });
      };

      this.ws.onclose = (event) => {
        this.ngZone.run(() => {
          this.stopHeartbeat();
          this.updateStatus('disconnected');
          
          if (!this.isManualDisconnect) {
            this.scheduleReconnect();
          }
        });
      };
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isManualDisconnect = true;
    this.stopReconnect();
    this.stopHeartbeat();
    
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000, 'Manual disconnect');
      }
      this.ws = null;
    }
    
    this.updateStatus('disconnected');
  }

  /**
   * Send a message to the server
   */
  send(message: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const data = typeof message === 'string' ? message : JSON.stringify(message);
      this.ws.send(data);
    }
  }

  /**
   * Subscribe to a WebSocket channel (user, organization, or event)
   */
  subscribe(channel: WsSubscribeType, id: string): void {
    this.send({
      type: 'subscribe',
      channel,
      [`${channel}_id`]: id,
    });
  }

  /**
   * Unsubscribe from a WebSocket channel
   */
  unsubscribe(channel: WsSubscribeType, id: string): void {
    this.send({
      type: 'unsubscribe',
      channel,
      [`${channel}_id`]: id,
    });
  }

  /**
   * Convenience: subscribe to an organization channel
   */
  subscribeToOrganization(orgId: string): void {
    this.subscribe(WS_SUBSCRIBE_TYPE.ORGANIZATION, orgId);
  }

  /**
   * Convenience: subscribe to a user channel
   */
  subscribeToUser(userId: string): void {
    this.subscribe(WS_SUBSCRIBE_TYPE.USER, userId);
  }

  /**
   * Convenience: subscribe to event-specific updates
   */
  subscribeToEvent(eventId: string): void {
    this.subscribe(WS_SUBSCRIBE_TYPE.EVENT, eventId);
  }

  /**
   * Get filtered observable for specific message types
   */
  messagesOfType(type: string): Observable<WebSocketMessage> {
    return this.messages$.pipe(
      filter(msg => msg.type === type),
      filter(msg => this.isMessageForCurrentOrg(msg))
    );
  }

  /**
   * Get filtered observable for multiple message types
   */
  messagesOfTypes(types: string[]): Observable<WebSocketMessage> {
    return this.messages$.pipe(
      filter(msg => types.includes(msg.type)),
      filter(msg => this.isMessageForCurrentOrg(msg))
    );
  }

  /**
   * Check if currently connected
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get current reconnect attempt count
   */
  get currentReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  private buildWebSocketUrl(organizationId?: string): string {
    // Convert http(s) to ws(s)
    let url = this.apiConfig.wsBaseUrl;
    
    // Ensure proper WebSocket protocol
    if (url.startsWith('http://')) {
      url = url.replace('http://', 'ws://');
    } else if (url.startsWith('https://')) {
      url = url.replace('https://', 'wss://');
    }
    
    // Append path if not present
    if (!url.includes('/ws')) {
      url = url.endsWith('/') ? `${url}api/v1/ws` : `${url}/api/v1/ws`;
    }
    
    // Build query params
    const params: string[] = [];
    
    // Add JWT token from auth store (primary auth mechanism for WS)
    const token = this.authStore.accessToken();
    if (token) {
      params.push(`token=${encodeURIComponent(token)}`);
    }
    
    // Add organization ID if provided
    if (organizationId) {
      params.push(`org=${encodeURIComponent(organizationId)}`);
    }
    
    // Append query params to URL
    if (params.length > 0) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}${params.join('&')}`;
    }
    
    return url;
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data) as WebSocketMessage;

      // Handle pong response
      if (message.type === WS_MESSAGE_TYPE.PONG) {
        this.handlePong();
        return;
      }

      // Handle connection acknowledgment
      if (message.type === WS_MESSAGE_TYPE.CONNECTION_ACK) {
        this.handleConnectionAck();
        return;
      }

      // Validate message structure
      if (!message.type) {
        return;
      }

      this.messageSubject.next(message);
    } catch (error) {
      // ignore parse errors
    }
  }

  private handleConnectionAck(): void {
    this.connectionAckSubject.next();
    // Auto-subscribe to organization channel on successful auth
    if (this.currentOrganizationId) {
      this.subscribe(WS_SUBSCRIBE_TYPE.ORGANIZATION, this.currentOrganizationId);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.updateStatus('disconnected');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );
    
    this.updateStatus('reconnecting');

    this.reconnectSubscription = timer(delay).subscribe(() => {
      this.connect(this.currentOrganizationId || undefined);
    });
  }

  private stopReconnect(): void {
    if (this.reconnectSubscription) {
      this.reconnectSubscription.unsubscribe();
      this.reconnectSubscription = null;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: WS_MESSAGE_TYPE.PING });
        
        // Set timeout for pong response
        this.pongTimeout = setTimeout(() => {
          this.ws?.close(3000, 'Pong timeout');
        }, this.heartbeatTimeout);
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  private handlePong(): void {
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  private updateStatus(status: ConnectionStatus): void {
    this.statusSubject.next(status);
  }

  private isMessageForCurrentOrg(message: WebSocketMessage): boolean {
    // If no org filter set, accept all messages
    if (!this.currentOrganizationId) return true;
    // If message has no org, accept it
    if (!message.organization_id) return true;
    // Only accept messages for current org
    return message.organization_id === this.currentOrganizationId;
  }
}
