import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { PwaInstallService } from '../core/services/pwa-install.service';
import { SettingsStore } from './stores/settings.store';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }

    .page-heading {
      margin-bottom: 24px;
    }

    .page-heading h1 {
      font-family: var(--font-heading);
      font-size: 26px;
      font-weight: 400;
      color: var(--color-text-primary);
      margin: 0 0 4px;
    }

    .page-heading p {
      font-size: 13.5px;
      color: var(--color-text-secondary);
      margin: 0;
    }

    /* ── Cards ── */
    .card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 14px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .card-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--color-border);
    }

    .card-header h3 {
      font-family: var(--font-heading);
      font-size: 17px;
      font-weight: 400;
      color: var(--color-text-primary);
      margin: 0;
    }

    .card-header p {
      font-size: 12.5px;
      color: var(--color-text-secondary);
      margin: 4px 0 0;
    }

    .card-body {
      padding: 4px 24px;
    }

    /* ── PWA install card ── */
    .pwa-card {
      background: linear-gradient(135deg, #0A1929 0%, #0F2B4C 40%, #1A5F8B 100%);
      border-radius: 16px;
      padding: 32px;
      color: white;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(15,43,76,.3);
    }

    .pwa-card::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 200px; height: 200px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(201,169,110,.06) 0%, transparent 70%);
    }

    .pwa-card::after {
      content: '';
      position: absolute;
      bottom: -80px; left: -40px;
      width: 180px; height: 180px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(90,158,207,.05) 0%, transparent 70%);
    }

    .pwa-icon {
      width: 72px; height: 72px;
      border-radius: 18px;
      object-fit: cover;
      box-shadow: 0 4px 16px rgba(0,0,0,.3);
      border: 2px solid rgba(232,220,206,.15);
    }

    .pwa-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: .15em;
      text-transform: uppercase;
      opacity: .4;
      margin: 0 0 4px;
    }

    .pwa-title {
      font-family: var(--font-heading);
      font-size: 22px;
      font-weight: 400;
      margin: 0 0 6px;
      letter-spacing: -0.01em;
    }

    .pwa-desc {
      font-size: 13.5px;
      opacity: .7;
      margin: 0 0 20px;
      line-height: 1.6;
      max-width: 420px;
    }

    .feature-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(232,220,206,.06);
      border: 1px solid rgba(232,220,206,.1);
      padding: 6px 14px;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 500;
      color: rgba(255,255,255,.8);
    }

    .feature-pill svg { opacity: .6; }

    .install-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #FCFAF7;
      color: #0A1929;
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 14px;
      padding: 14px 28px;
      border-radius: 50px;
      border: none;
      cursor: pointer;
      transition: all .15s ease;
      box-shadow: 0 4px 16px rgba(0,0,0,.2);
      position: relative; z-index: 1;
    }

    .install-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(0,0,0,.25);
    }

    .install-btn:active:not(:disabled) { transform: translateY(0); }

    .install-btn:disabled {
      opacity: .6; cursor: not-allowed;
      transform: none;
    }

    .installed-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(232,220,206,.08);
      border: 1px solid rgba(232,220,206,.15);
      backdrop-filter: blur(8px);
      color: rgba(255,255,255,.9);
      font-weight: 500;
      font-size: 13px;
      padding: 10px 20px;
      border-radius: 50px;
      position: relative; z-index: 1;
    }

    .manual-card {
      background: rgba(232,220,206,.06);
      border: 1px solid rgba(232,220,206,.1);
      border-radius: 12px;
      padding: 20px;
      max-width: 420px;
      position: relative; z-index: 1;
    }

    .manual-card h4 {
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 400;
      color: rgba(255,255,255,.9);
      margin: 0 0 12px;
    }

    .manual-card li {
      font-size: 12.5px;
      color: rgba(255,255,255,.6);
      line-height: 1.8;
    }

    .manual-card li strong { color: rgba(255,255,255,.8); }

    /* ── Preference rows ── */
    .pref-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      border-bottom: 1px solid var(--color-border);
    }

    .pref-row:last-child { border-bottom: none; }

    .pref-label {
      font-size: 13.5px;
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .pref-desc {
      font-size: 12px;
      color: var(--color-text-secondary);
      margin-top: 2px;
    }

    .badge {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 50px;
      background: var(--ocean-50);
      color: var(--ocean-600);
    }

    .badge-green {
      background: #E2F0E6;
      color: #2D7D46;
    }

    .badge-orange {
      background: #F5EDD8;
      color: #B8863A;
    }

    /* ── Toggle switch ── */
    .switch {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 22px;
      flex-shrink: 0;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background: var(--color-border);
      border-radius: 22px;
      transition: .2s;
    }

    .slider::before {
      content: '';
      position: absolute;
      height: 16px;
      width: 16px;
      left: 3px;
      bottom: 3px;
      background: #fff;
      border-radius: 50%;
      transition: .2s;
    }

    .switch input:checked + .slider {
      background: var(--ocean-500, #2563eb);
    }

    .switch input:checked + .slider::before {
      transform: translateX(18px);
    }

    .switch input:disabled + .slider {
      opacity: .4;
      cursor: not-allowed;
    }

    .time-input {
      padding: 4px 10px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: var(--color-surface);
      color: var(--color-text-primary);
      font-size: 13px;
      font-family: var(--font-body);
      outline: none;
    }

    .time-input:focus {
      border-color: var(--ocean-500, #2563eb);
    }

    .time-input:disabled {
      opacity: .4;
      cursor: not-allowed;
    }

    /* ── Frame ── */
    .section { margin-bottom: 24px; }

    .footer-note {
      text-align: center;
      font-size: 11.5px;
      color: var(--color-text-muted);
      padding-bottom: 16px;
    }

    .footer-note strong { color: var(--color-text-secondary); }

    @media (max-width: 640px) {
      .page-heading h1 { font-size: 22px; }
      .page-heading p { font-size: 13px; }

      .card { border-radius: 14px; border-left: none; border-right: none; }
      .card-header { padding: 16px 18px; }
      .card-header h3 { font-size: 16px; }
      .card-header p { font-size: 12px; }
      .card-body { padding: 12px 18px; }

      .pwa-card { padding: 24px 20px; border-radius: 16px; }
      .pwa-icon { width: 56px; height: 56px; border-radius: 14px; }

      .pref-row { padding: 12px 0; }
      .pref-label { font-size: 14px; }
      .pref-desc { font-size: 12px; }

      .feature-grid { grid-template-columns: 1fr; gap: 8px; }
      .feature-pill { padding: 10px 14px; font-size: 12px; }

      .section { margin-bottom: 20px; }

      .footer-note { font-size: 11px; padding-bottom: env(safe-area-inset-bottom, 0px); }
    }
  `],
  template: `
    <div>
      <!-- Page heading -->
      <div class="page-heading">
        <h1>Settings</h1>
        <p>Manage your account, preferences, and app installation</p>
      </div>

      <!-- ─── PWA Install ─────────────────────────────── -->
      <div class="section">
        <div class="pwa-card">
          <div style="display:flex;align-items:flex-start;gap:20px;flex-wrap:wrap;position:relative;z-index:1">
            <img src="icons/icon.jpeg" alt="Remindly App Icon" class="pwa-icon" />
            <div style="flex:1;min-width:200px">
              <p class="pwa-label">Progressive Web App</p>
              <h2 class="pwa-title">Install Remindly</h2>
              <p class="pwa-desc">
                Get the full executive experience — fast, offline-ready, and installable on any device.
              </p>

              <!-- Feature pills -->
              <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px">
                <span class="feature-pill">
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  Lightning Fast
                </span>
                <span class="feature-pill">
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12v.01"/>
                  </svg>
                  Works Offline
                </span>
                <span class="feature-pill">
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                  Push Alerts
                </span>
                <span class="feature-pill">
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  Secure
                </span>
              </div>

              <!-- Action -->
              @if (pwa.installState() === 'installed') {
                <span class="installed-badge">
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                  Remindly is installed
                </span>
              } @else if (pwa.canInstall()) {
                <button
                  class="install-btn"
                  [disabled]="installing()"
                  (click)="install()"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  {{ installing() ? 'Installing\u2026' : 'Download App' }}
                </button>
              } @else {
                <div class="manual-card">
                  <h4>Install manually:</h4>
                  <ul style="margin:0;padding-left:18px">
                    <li><strong>Chrome / Edge:</strong> Menu \u2192 "Install Remindly" or the \u2295 icon in the address bar</li>
                    <li><strong>Safari (iOS):</strong> Share \u2192 Add to Home Screen</li>
                    <li><strong>Firefox:</strong> Address bar \u2192 Install icon</li>
                  </ul>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- ─── App Information ─────────────────────────── -->
      <div class="section">
        <div class="card">
          <div class="card-header">
            <h3>Application</h3>
            <p>Platform details and version information</p>
          </div>
          <div class="card-body">
            <div class="pref-row">
              <div>
                <p class="pref-label">App Name</p>
              </div>
              <span class="badge">Remindly</span>
            </div>
            <div class="pref-row">
              <div>
                <p class="pref-label">Version</p>
                <p class="pref-desc">Current release</p>
              </div>
              <span class="badge badge-green">v1.0.0</span>
            </div>
            <div class="pref-row">
              <div>
                <p class="pref-label">Platform</p>
                <p class="pref-desc">Angular PWA &middot; FastAPI Backend</p>
              </div>
              <span class="badge">Enterprise</span>
            </div>
            <div class="pref-row">
              <div>
                <p class="pref-label">Offline Support</p>
                <p class="pref-desc">Service Worker cache + IndexedDB queue</p>
              </div>
              <span class="badge badge-green">Enabled</span>
            </div>
            <div class="pref-row">
              <div>
                <p class="pref-label">Install Status</p>
                <p class="pref-desc">Current PWA installation state</p>
              </div>
              @if (pwa.installState() === 'installed') {
                <span class="badge badge-green">Installed</span>
              } @else if (pwa.installState() === 'available') {
                <span class="badge badge-orange">Available</span>
              } @else {
                <span class="badge">Browser Mode</span>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Preferences ─────────────────────────────── -->
      <div class="section">
        <div class="card">
          <div class="card-header">
            <h3>Preferences</h3>
            <p>Notification and display preferences</p>
          </div>
          <div class="card-body">
            <div class="pref-row">
              <div>
                <p class="pref-label">Daily Digest</p>
                <p class="pref-desc">Receive a push notification each morning with your daily schedule</p>
              </div>
              <div style="display:flex;align-items:center;gap:10px">
                <input type="time"
                  class="time-input"
                  [value]="(settingsStore.notificationPrefs()?.daily_digest_time ?? '08:00')"
                  (change)="setDailyDigestTime(($any($event).target).value)"
                  [disabled]="!settingsStore.notificationPrefs()?.daily_digest"
                />
                <label class="switch">
                  <input type="checkbox"
                    [checked]="settingsStore.notificationPrefs()?.daily_digest ?? false"
                    (change)="toggleDailyDigest(($any($event).target).checked)"
                  />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            <div class="pref-row">
              <div>
                <p class="pref-label">Weekly Digest</p>
                <p class="pref-desc">Weekly summary of completed events and upcoming items</p>
              </div>
              <label class="switch">
                <input type="checkbox"
                  [checked]="settingsStore.notificationPrefs()?.weekly_digest ?? false"
                  (change)="toggleWeeklyDigest(($any($event).target).checked)"
                />
                <span class="slider"></span>
              </label>
            </div>
            <div class="pref-row">
              <div>
                <p class="pref-label">Event Reminders</p>
                <p class="pref-desc">Push notifications before scheduled events</p>
              </div>
              <label class="switch">
                <input type="checkbox"
                  [checked]="settingsStore.notificationPrefs()?.event_reminder ?? false"
                  (change)="toggleEventReminders(($any($event).target).checked)"
                />
                <span class="slider"></span>
              </label>
            </div>
            <div class="pref-row">
              <div>
                <p class="pref-label">Theme</p>
                <p class="pref-desc">Follows your system preference</p>
              </div>
              <span class="badge">Light / Dark</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <p class="footer-note">
        Built by <strong>SafariStack Solutions</strong> &middot; Remindly Executive AI Assistant
      </p>
    </div>
  `,
})
export class SettingsComponent {
  readonly pwa = inject(PwaInstallService);
  readonly settingsStore = inject(SettingsStore);
  readonly installing = signal(false);

  async install(): Promise<void> {
    this.installing.set(true);
    await this.pwa.promptInstall();
    this.installing.set(false);
  }

  async toggleDailyDigest(enabled: boolean): Promise<void> {
    await this.settingsStore.updateNotificationPreferences({ daily_digest: enabled });
  }

  async setDailyDigestTime(time: string): Promise<void> {
    await this.settingsStore.updateNotificationPreferences({ daily_digest_time: time });
  }

  async toggleWeeklyDigest(enabled: boolean): Promise<void> {
    await this.settingsStore.updateNotificationPreferences({ weekly_digest: enabled });
  }

  async toggleEventReminders(enabled: boolean): Promise<void> {
    await this.settingsStore.updateNotificationPreferences({ event_reminder: enabled });
  }
}
