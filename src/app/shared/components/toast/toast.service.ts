import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  private push(type: ToastType, message: string, duration = 4000): void {
    const id = crypto.randomUUID();
    this.toasts.update(t => [...t, { id, type, message, duration }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string): void { this.push('success', message); }
  error(message: string): void   { this.push('error', message, 6000); }
  warning(message: string): void { this.push('warning', message); }
  info(message: string): void    { this.push('info', message); }

  dismiss(id: string): void {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
