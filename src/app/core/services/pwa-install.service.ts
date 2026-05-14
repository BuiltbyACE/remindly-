import { Injectable, signal, computed, effect } from '@angular/core';

export type PwaInstallState = 'idle' | 'available' | 'installed' | 'unsupported';

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private _deferredPrompt = signal<BeforeInstallPromptEvent | null>(null);
  private _installState = signal<PwaInstallState>('idle');

  /** Whether the browser has provided an install prompt (app is installable) */
  readonly canInstall = computed(() => this._installState() === 'available');

  /** Current install lifecycle state */
  readonly installState = this._installState.asReadonly();

  constructor() {
    this._detectInstalledState();
    this._listenForInstallPrompt();
    this._listenForInstalled();
  }

  /** Trigger the native browser install prompt */
  async promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    const prompt = this._deferredPrompt();
    if (!prompt) return 'unavailable';

    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    this._deferredPrompt.set(null);

    if (outcome === 'accepted') {
      this._installState.set('installed');
      return 'accepted';
    }
    this._installState.set('available');
    return 'dismissed';
  }

  private _detectInstalledState(): void {
    if (typeof window === 'undefined') return;

    // Check if already running as installed PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      this._installState.set('installed');
    }
  }

  private _listenForInstallPrompt(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this._deferredPrompt.set(event as BeforeInstallPromptEvent);
      this._installState.set('available');
    });
  }

  private _listenForInstalled(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('appinstalled', () => {
      this._deferredPrompt.set(null);
      this._installState.set('installed');
    });
  }
}

// Augment the Window interface with the non-standard BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}
