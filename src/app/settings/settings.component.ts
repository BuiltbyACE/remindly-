import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { PwaInstallService } from '../core/services/pwa-install.service';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .settings-card {
      background: white;
      border-radius: 16px;
      border: 1px solid var(--color-border);
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,.06);
    }
    .settings-card-header {
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--color-border);
    }
    .settings-card-body {
      padding: 24px;
    }

    /* PWA install card gradient */
    .pwa-card {
      background: linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%);
      border-radius: 20px;
      padding: 32px;
      color: white;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(37,99,235,.35);
    }
    .pwa-card::before {
      content: '';
      position: absolute;
      top: -40px; right: -40px;
      width: 200px; height: 200px;
      border-radius: 50%;
      background: rgba(255,255,255,.07);
    }
    .pwa-card::after {
      content: '';
      position: absolute;
      bottom: -60px; left: -20px;
      width: 160px; height: 160px;
      border-radius: 50%;
      background: rgba(255,255,255,.05);
    }
    .pwa-icon {
      width: 72px; height: 72px;
      border-radius: 18px;
      object-fit: cover;
      box-shadow: 0 4px 16px rgba(0,0,0,.3);
      border: 3px solid rgba(255,255,255,.3);
    }
    .install-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: white;
      color: #1E3A5F;
      font-weight: 700;
      font-size: 15px;
      padding: 14px 28px;
      border-radius: 50px;
      border: none;
      cursor: pointer;
      transition: transform .15s ease, box-shadow .15s ease;
      box-shadow: 0 4px 16px rgba(0,0,0,.2);
      position: relative; z-index: 1;
    }
    .install-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,.25);
    }
    .install-btn:active { transform: translateY(0); }
    .install-btn:disabled {
      opacity: .7; cursor: not-allowed;
      transform: none;
    }
    .installed-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,.15);
      border: 1px solid rgba(255,255,255,.3);
      backdrop-filter: blur(8px);
      color: white;
      font-weight: 600;
      font-size: 14px;
      padding: 10px 20px;
      border-radius: 50px;
      position: relative; z-index: 1;
    }
    .feature-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,.12);
      border: 1px solid rgba(255,255,255,.2);
      padding: 6px 14px;
      border-radius: 50px;
      font-size: 13px;
      font-weight: 500;
    }

    /* Section rows */
    .pref-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      border-bottom: 1px solid var(--color-border);
    }
    .pref-row:last-child { border-bottom: none; }
    .pref-label { font-size: 14px; font-weight: 500; color: var(--color-text-primary); }
    .pref-desc { font-size: 12px; color: var(--color-text-muted); margin-top: 2px; }
    .badge-tag {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 50px;
      background: #EFF6FF;
      color: #2563EB;
    }
    .badge-tag.green { background: #F0FDF4; color: #16A34A; }
    .badge-tag.orange { background: #FFF7ED; color: #EA580C; }

    :host {
      display: block;
    }

    /* Dark mode */
    @media (prefers-color-scheme: dark) {
      .settings-card { background: #1E293B; }
    }
  `],
  template: `
    <div class="space-y-8">
      <!-- Page header -->
      <div>
        <h1 class="text-2xl font-bold" style="color:var(--color-text-primary)">Settings</h1>
        <p class="text-sm mt-1" style="color:var(--color-text-muted)">Manage your account, preferences, and app installation</p>
      </div>

      <!-- ─── PWA Install Card ─────────────────────────────── -->
      <div class="pwa-card">
        <div style="display:flex;align-items:flex-start;gap:20px;flex-wrap:wrap;position:relative;z-index:1">
          <img src="icons/icon.jpeg" alt="Remindly App Icon" class="pwa-icon" />

          <div style="flex:1;min-width:200px">
            <p style="font-size:12px;font-weight:600;letter-spacing:.08em;opacity:.7;text-transform:uppercase;margin-bottom:4px">
              Progressive Web App
            </p>
            <h2 style="font-size:22px;font-weight:800;margin:0 0 6px">Install Remindly</h2>
            <p style="font-size:14px;opacity:.85;margin:0 0 20px;line-height:1.5;max-width:420px">
              Get the full executive experience — fast, offline-ready, and installable on any device.
              Works on Android, iOS, Windows, macOS and Linux.
            </p>

            <!-- Feature pills -->
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px">
              <span class="feature-pill">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Lightning Fast
              </span>
              <span class="feature-pill">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12v.01"/>
                </svg>
                Works Offline
              </span>
              <span class="feature-pill">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                Push Notifications
              </span>
              <span class="feature-pill">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                Secure
              </span>
            </div>

            <!-- Action -->
            @if (pwa.installState() === 'installed') {
              <span class="installed-badge">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                </svg>
                Remindly is already installed
              </span>
            } @else if (pwa.canInstall()) {
              <button
                id="pwa-install-btn"
                class="install-btn"
                [disabled]="installing()"
                (click)="install()"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                {{ installing() ? 'Installing…' : 'Download & Install App' }}
              </button>
            } @else {
              <div style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:12px;padding:16px;max-width:420px">
                <p style="font-size:13px;font-weight:600;margin:0 0 8px">Install manually:</p>
                <ul style="font-size:13px;opacity:.85;line-height:1.7;margin:0;padding-left:18px">
                  <li><strong>Chrome / Edge:</strong> Menu → "Install Remindly" or the ⊕ icon in the address bar</li>
                  <li><strong>Safari (iOS):</strong> Share → Add to Home Screen</li>
                  <li><strong>Firefox:</strong> Address bar → Install icon</li>
                </ul>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- ─── App Information ─────────────────────────────── -->
      <div class="settings-card">
        <div class="settings-card-header">
          <h3 style="font-size:15px;font-weight:700;color:var(--color-text-primary);margin:0">Application</h3>
          <p style="font-size:12px;color:var(--color-text-muted);margin:4px 0 0">Platform details and version information</p>
        </div>
        <div class="settings-card-body" style="padding-top:8px;padding-bottom:8px">
          <div class="pref-row">
            <div>
              <p class="pref-label">App Name</p>
            </div>
            <span class="badge-tag">Remindly</span>
          </div>
          <div class="pref-row">
            <div>
              <p class="pref-label">Version</p>
              <p class="pref-desc">Current release</p>
            </div>
            <span class="badge-tag green">v1.0.0</span>
          </div>
          <div class="pref-row">
            <div>
              <p class="pref-label">Platform</p>
              <p class="pref-desc">Angular 21 PWA · FastAPI Backend</p>
            </div>
            <span class="badge-tag">Enterprise</span>
          </div>
          <div class="pref-row">
            <div>
              <p class="pref-label">Offline Support</p>
              <p class="pref-desc">IndexedDB queue + Service Worker cache</p>
            </div>
            <span class="badge-tag green">Enabled</span>
          </div>
          <div class="pref-row">
            <div>
              <p class="pref-label">Install Status</p>
              <p class="pref-desc">Current PWA installation state</p>
            </div>
            @if (pwa.installState() === 'installed') {
              <span class="badge-tag green">Installed</span>
            } @else if (pwa.installState() === 'available') {
              <span class="badge-tag orange">Available</span>
            } @else {
              <span class="badge-tag">Browser Mode</span>
            }
          </div>
        </div>
      </div>

      <!-- ─── Preferences ─────────────────────────────────── -->
      <div class="settings-card">
        <div class="settings-card-header">
          <h3 style="font-size:15px;font-weight:700;color:var(--color-text-primary);margin:0">Preferences</h3>
          <p style="font-size:12px;color:var(--color-text-muted);margin:4px 0 0">Notification and display preferences</p>
        </div>
        <div class="settings-card-body" style="padding-top:8px;padding-bottom:8px">
          <div class="pref-row">
            <div>
              <p class="pref-label">User & Organization settings</p>
              <p class="pref-desc">Profile, roles, and org configuration</p>
            </div>
            <span class="badge-tag orange">Coming soon</span>
          </div>
          <div class="pref-row">
            <div>
              <p class="pref-label">Notification channels</p>
              <p class="pref-desc">Push, email, SMS, WhatsApp</p>
            </div>
            <span class="badge-tag orange">Coming soon</span>
          </div>
          <div class="pref-row">
            <div>
              <p class="pref-label">Theme</p>
              <p class="pref-desc">Follows your system preference (light / dark)</p>
            </div>
            <span class="badge-tag">System</span>
          </div>
        </div>
      </div>

      <!-- Built by -->
      <p style="text-align:center;font-size:12px;color:var(--color-text-muted);padding-bottom:8px">
        Built with ❤️ by <strong>SafariStack Solutions</strong> · Remindly Executive AI Assistant
      </p>
    </div>
  `,
})
export class SettingsComponent {
  readonly pwa = inject(PwaInstallService);
  readonly installing = signal(false);

  async install(): Promise<void> {
    this.installing.set(true);
    await this.pwa.promptInstall();
    this.installing.set(false);
  }
}

