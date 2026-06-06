import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PwaInstallService } from '../core/services/pwa-install.service';
import { AuthStore } from '../auth/stores/auth.store';
import { SettingsStore } from './stores/settings.store';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
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

    /* ── Form fields (password section) ── */
    .field { margin-bottom: 20px; }

    .field-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #5C666F;
      margin-bottom: 8px;
    }

    .input-wrap { position: relative; }

    .input-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #8C959E;
      pointer-events: none;
      display: flex;
    }

    .input-field {
      width: 100%;
      padding: 12px 14px 12px 42px;
      font-family: var(--font-body);
      font-size: 14px;
      color: #1A1C1E;
      background: #F5F2ED;
      border: 1.5px solid transparent;
      border-radius: 12px;
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .input-field::placeholder { color: #B5AD9F; }

    .input-field:focus {
      background: #fff;
      border-color: #3A82B5;
      box-shadow: 0 0 0 3px rgba(58,130,181,.12);
    }

    .toggle-pw {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      padding: 6px;
      color: #8C959E;
      cursor: pointer;
      display: flex;
      border-radius: 6px;
      transition: color 0.15s;
    }

    .toggle-pw:hover { color: #3A82B5; }

    .error-msg {
      padding: 12px 16px;
      background: #FDF6F4;
      border: 1px solid #E8D0C8;
      border-radius: 10px;
      font-size: 13px;
      color: #8B3F2E;
      margin-bottom: 20px;
      text-align: center;
    }

    .success-msg {
      padding: 12px 16px;
      background: #F0F9F4;
      border: 1px solid #C8E6D0;
      border-radius: 10px;
      font-size: 13px;
      color: #2E7D5A;
      margin-bottom: 20px;
      text-align: center;
    }

    .submit-btn {
      width: 100%;
      padding: 14px 24px;
      font-family: var(--font-body);
      font-size: 15px;
      font-weight: 600;
      color: #fff;
      background: linear-gradient(135deg, #0F2B4C 0%, #1A5F8B 100%);
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 16px rgba(15,43,76,.25);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 24px rgba(15,43,76,.3);
    }

    .submit-btn:active:not(:disabled) { transform: translateY(0); }

    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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
                Get the full admin experience — fast, offline-ready, and installable on any device.
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

      <!-- ─── Password ────────────────────────────────── -->
      <div class="section">
        <div class="card">
          <div class="card-header">
            <h3>Password</h3>
            <p>Update your account password</p>
          </div>
          <div class="card-body">
            @if (passwordSuccess()) {
              <div class="success-msg" role="status">{{ passwordSuccess() }}</div>
            }

            @if (authStore.changePasswordError()) {
              <div class="error-msg" role="alert">{{ authStore.changePasswordError() }}</div>
            }

            <form (ngSubmit)="onChangePassword()">
              <div class="field">
                <label class="field-label" for="settings-currentPassword">Current password</label>
                <div class="input-wrap">
                  <span class="input-icon">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </span>
                  <input id="settings-currentPassword"
                    [type]="showCurrent() ? 'text' : 'password'"
                    [(ngModel)]="currentPassword" name="currentPassword" required
                    class="input-field" placeholder="Enter current password"
                  />
                  <button type="button" class="toggle-pw" (click)="showCurrent.update(v => !v)" aria-label="Toggle current password visibility">
                    @if (showCurrent()) {
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                    } @else {
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    }
                  </button>
                </div>
              </div>

              <div class="field">
                <label class="field-label" for="settings-newPassword">New password</label>
                <div class="input-wrap">
                  <span class="input-icon">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </span>
                  <input id="settings-newPassword"
                    [type]="showNew() ? 'text' : 'password'"
                    [(ngModel)]="newPassword" name="newPassword" required
                    class="input-field" placeholder="Min. 8 characters"
                  />
                  <button type="button" class="toggle-pw" (click)="showNew.update(v => !v)" aria-label="Toggle new password visibility">
                    @if (showNew()) {
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                    } @else {
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    }
                  </button>
                </div>
                @if (newPassword()) {
                  <div style="margin-top:8px;padding-left:4px;display:flex;flex-direction:column;gap:4px;font-size:12px;">
                    <span [style.color]="hasMinLength() ? '#2E7D5A' : '#8C959E'">
                      @if (hasMinLength()) { ✓ } @else { ○ } At least 8 characters
                    </span>
                    <span [style.color]="hasUpperCase() ? '#2E7D5A' : '#8C959E'">
                      @if (hasUpperCase()) { ✓ } @else { ○ } At least 1 uppercase letter
                    </span>
                    <span [style.color]="hasNumber() ? '#2E7D5A' : '#8C959E'">
                      @if (hasNumber()) { ✓ } @else { ○ } At least 1 number
                    </span>
                    <span [style.color]="hasSpecialChar() ? '#2E7D5A' : '#8C959E'">
                      @if (hasSpecialChar()) { ✓ } @else { ○ } At least 1 special character
                    </span>
                  </div>

                  @if (passwordStrength() > 0) {
                    <div style="margin-top:10px;padding-left:4px;">
                      <div style="height:4px;background:#E2E6EB;border-radius:4px;overflow:hidden;">
                        <div [style.width]="strengthWidth()" [style.background]="strengthColor()"
                             style="height:100%;border-radius:4px;transition:all 0.2s ease;"></div>
                      </div>
                      <p [style.color]="strengthColor()" style="font-size:11px;margin:4px 0 0 0;font-weight:600;">
                        {{ strengthLabel() }}
                      </p>
                    </div>
                  }
                }
              </div>

              <div class="field">
                <label class="field-label" for="settings-confirmPassword">Confirm new password</label>
                <div class="input-wrap">
                  <span class="input-icon">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </span>
                  <input id="settings-confirmPassword"
                    [type]="showConfirm() ? 'text' : 'password'"
                    [(ngModel)]="confirmPassword" name="confirmPassword" required
                    class="input-field" placeholder="Repeat new password"
                  />
                  <button type="button" class="toggle-pw" (click)="showConfirm.update(v => !v)" aria-label="Toggle confirm password visibility">
                    @if (showConfirm()) {
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                    } @else {
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    }
                  </button>
                </div>
                @if (confirmPassword() && newPassword() !== confirmPassword()) {
                  <p style="font-size:12px;color:#B8543B;margin-top:6px;padding-left:4px;">Passwords do not match</p>
                }
              </div>

              <button type="submit" class="submit-btn"
                [disabled]="authStore.isChangingPassword() || !currentPassword() || !confirmPassword() || newPassword() !== confirmPassword() || !hasMinLength() || !hasUpperCase() || !hasNumber() || !hasSpecialChar()"
              >
                @if (authStore.isChangingPassword()) {
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                } @else {
                  Update Password
                }
              </button>
            </form>
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
        Built by <strong>SafariStack Solutions</strong> &middot; Remindly Admin AI Assistant
      </p>
    </div>
  `,
})
export class SettingsComponent {
  readonly pwa = inject(PwaInstallService);
  readonly settingsStore = inject(SettingsStore);
  readonly authStore = inject(AuthStore);
  readonly installing = signal(false);

  // ── Password change signals ──
  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly showCurrent = signal(false);
  readonly showNew = signal(false);
  readonly showConfirm = signal(false);
  readonly passwordSuccess = signal('');

  readonly hasMinLength = computed(() => this.newPassword().length >= 8);
  readonly hasUpperCase = computed(() => /[A-Z]/.test(this.newPassword()));
  readonly hasNumber = computed(() => /[0-9]/.test(this.newPassword()));
  readonly hasSpecialChar = computed(() => /[^a-zA-Z0-9]/.test(this.newPassword()));
  readonly passwordStrength = computed(() =>
    [this.hasMinLength(), this.hasUpperCase(), this.hasNumber(), this.hasSpecialChar].filter(Boolean).length
  );
  readonly strengthLabel = computed(() =>
    ['', 'Weak', 'Fair', 'Good', 'Strong'][this.passwordStrength()]
  );
  readonly strengthColor = computed(() =>
    ['#E2E6EB', '#B8543B', '#D68A3C', '#3A82B5', '#2E7D5A'][this.passwordStrength()]
  );
  readonly strengthWidth = computed(() => `${this.passwordStrength() * 25}%`);

  async onChangePassword(): Promise<void> {
    this.passwordSuccess.set('');
    if (!this.currentPassword() || !this.newPassword() || this.newPassword() !== this.confirmPassword()) {
      return;
    }
    try {
      await this.authStore.changePassword(this.currentPassword(), this.newPassword());
      this.passwordSuccess.set('Password updated successfully.');
      this.currentPassword.set('');
      this.newPassword.set('');
      this.confirmPassword.set('');
    } catch {
      // error is already surfaced via authStore.changePasswordError()
    }
  }

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
