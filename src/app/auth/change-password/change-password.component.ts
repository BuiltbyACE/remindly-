import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../stores/auth.store';

@Component({
  selector: 'app-change-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  styles: [`
    :host { display: contents; }

    .page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background: linear-gradient(165deg, #0A1929 0%, #0F2B4C 35%, #1A5F8B 65%, #2D7A9F 100%);
    }

    .wave-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .wave {
      position: absolute;
      border-radius: 50%;
      opacity: 0.06;
    }

    .wave-1 {
      width: 800px; height: 800px;
      background: radial-gradient(circle at 30% 50%, #E8DCCE 0%, transparent 70%);
      top: -200px; left: -200px;
    }

    .wave-2 {
      width: 600px; height: 600px;
      background: radial-gradient(circle at 70% 30%, #C9A96E 0%, transparent 60%);
      bottom: -150px; right: -100px;
    }

    .wave-3 {
      width: 400px; height: 400px;
      background: radial-gradient(circle at 50% 50%, #E8DCCE 0%, transparent 60%);
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.04;
    }

    .lines {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.03;
      background-image: repeating-linear-gradient(
        90deg,
        transparent,
        transparent 120px,
        #E8DCCE 120px,
        #E8DCCE 121px
      );
    }

    .lines-vert {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.025;
      background-image: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 80px,
        #E8DCCE 80px,
        #E8DCCE 81px
      );
    }

    .content {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 420px;
      padding: 0 20px;
      animation: fadeUp 0.6s ease-out;
    }

    .logo-area {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo-ring {
      width: 72px;
      height: 72px;
      margin: 0 auto 16px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-ring-inner {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: rgba(255,255,255,.06);
      border: 1.5px solid rgba(255,255,255,.15);
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
    }

    .brand-name {
      font-family: var(--font-heading);
      font-size: 36px;
      font-weight: 400;
      color: #fff;
      letter-spacing: -0.02em;
      line-height: 1;
      margin: 0 0 6px;
    }

    .brand-tagline {
      font-family: var(--font-body);
      font-size: 13px;
      color: rgba(255,255,255,.5);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      font-weight: 400;
      margin: 0;
    }

    .card {
      background: #FCFAF7;
      border-radius: 20px;
      padding: 40px 36px;
      box-shadow:
        0 20px 60px rgba(10,25,41,.25),
        0 4px 16px rgba(10,25,41,.15);
    }

    .card-header {
      text-align: center;
      margin-bottom: 28px;
    }

    .card-title {
      font-family: var(--font-heading);
      font-size: 24px;
      color: #1A1C1E;
      margin: 0 0 4px;
      font-weight: 400;
    }

    .card-sub {
      font-size: 13.5px;
      color: #8C959E;
      margin: 0;
    }

    .field {
      margin-bottom: 20px;
    }

    .field-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #5C666F;
      margin-bottom: 8px;
    }

    .input-wrap {
      position: relative;
    }

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
    }

    .input-field::placeholder {
      color: #B5AD9F;
    }

    .input-field:focus {
      background: #fff;
      border-color: #3A82B5;
      box-shadow: 0 0 0 3px rgba(58,130,181,.12);
    }

    .input-field.input-error {
      border-color: #B8543B;
      background: #FDF6F4;
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

    .submit-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 640px) {
      .page {
        align-items: flex-start;
        justify-content: flex-start;
        padding-top: env(safe-area-inset-top, 0px);
        min-height: 100dvh;
      }

      .content {
        max-width: 100%;
        padding: 0;
        animation: none;
      }

      .logo-area {
        margin-bottom: 0;
        padding: 48px 24px 32px;
      }

      .brand-name { font-size: 30px; }

      .card {
        border-radius: 20px 20px 0 0;
        padding: 32px 24px calc(24px + env(safe-area-inset-bottom, 0px));
        min-height: 60vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .card-title { font-size: 22px; }

      .wave-1, .wave-2, .wave-3 { display: none; }

      .input-field {
        padding: 14px 14px 14px 42px;
        font-size: 16px;
      }

      .submit-btn {
        padding: 16px 24px;
        font-size: 16px;
      }
    }
  `],
  template: `
    <div class="page">
      <div class="wave-layer">
        <div class="wave wave-1"></div>
        <div class="wave wave-2"></div>
        <div class="wave wave-3"></div>
      </div>
      <div class="lines"></div>
      <div class="lines-vert"></div>

      <div class="content">
        <div class="logo-area">
          <div class="logo-ring">
            <div class="logo-ring-inner">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M18 4 C18 4 10 4 10 16 C10 24 8 28 8 30 L28 30 C28 28 26 24 26 16 C26 4 18 4 18 4"
                      stroke="rgba(255,255,255,.7)" stroke-width="1.5" fill="rgba(255,255,255,.05)"/>
                <path d="M16 23 L18 25 L22 21" stroke="#C9A96E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 30 C14 33 16 36 18 36 C20 36 22 33 22 30" stroke="rgba(255,255,255,.3)" stroke-width="1.5" fill="none"/>
              </svg>
            </div>
          </div>
          <h1 class="brand-name">remindly</h1>
          <p class="brand-tagline">Admin Command Center</p>
        </div>

        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Change password</h2>
            <p class="card-sub">Set a new password for your account</p>
          </div>

          @if (successMessage()) {
            <div class="success-msg" role="status">{{ successMessage() }}</div>
          }

          @if (error()) {
            <div class="error-msg" role="alert">{{ error() }}</div>
          }

          <form (ngSubmit)="onSubmit()">
            <div class="field">
              <label class="field-label" for="currentPassword">Current password</label>
              <div class="input-wrap">
                <span class="input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </span>
                <input
                  id="currentPassword"
                  [type]="showCurrent() ? 'text' : 'password'"
                  [(ngModel)]="currentPassword"
                  name="currentPassword"
                  required
                  class="input-field"
                  placeholder="Enter current password"
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
              <label class="field-label" for="newPassword">New password</label>
              <div class="input-wrap">
                <span class="input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </span>
                <input
                  id="newPassword"
                  [type]="showNew() ? 'text' : 'password'"
                  [(ngModel)]="newPassword"
                  name="newPassword"
                  required
                  minlength="8"
                  class="input-field"
                  placeholder="Min. 8 characters"
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
              <label class="field-label" for="confirmPassword">Confirm new password</label>
              <div class="input-wrap">
                <span class="input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </span>
                <input
                  id="confirmPassword"
                  [type]="showConfirm() ? 'text' : 'password'"
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  required
                  class="input-field"
                  placeholder="Repeat new password"
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

            <button
              type="submit"
              class="submit-btn"
              [disabled]="isChangingPassword() || !currentPassword() || !confirmPassword() || newPassword() !== confirmPassword() || !hasMinLength() || !hasUpperCase() || !hasNumber() || !hasSpecialChar()"
            >
              @if (isChangingPassword()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Changing password...
              } @else {
                Change password
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class ChangePasswordComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly showCurrent = signal(false);
  readonly showNew = signal(false);
  readonly showConfirm = signal(false);
  readonly successMessage = signal('');
  readonly isChangingPassword = this.authStore.isChangingPassword;
  readonly error = this.authStore.changePasswordError;

  readonly hasMinLength = computed(() => this.newPassword().length >= 8);
  readonly hasUpperCase = computed(() => /[A-Z]/.test(this.newPassword()));
  readonly hasNumber = computed(() => /[0-9]/.test(this.newPassword()));
  readonly hasSpecialChar = computed(() => /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'\/`~]/.test(this.newPassword()));

  readonly passwordStrength = computed(() => {
    let score = 0;
    if (this.hasMinLength()) score++;
    if (this.hasUpperCase()) score++;
    if (this.hasNumber()) score++;
    if (this.hasSpecialChar()) score++;
    return score;
  });

  readonly strengthLabel = computed(() => {
    const s = this.passwordStrength();
    if (s === 0) return '';
    if (s === 1) return 'Weak';
    if (s === 2) return 'Fair';
    if (s === 3) return 'Good';
    return 'Strong';
  });

  readonly strengthColor = computed(() => {
    const s = this.passwordStrength();
    if (s === 0) return '';
    if (s === 1) return '#B8543B';
    if (s === 2) return '#D4A043';
    if (s === 3) return '#5A9ECF';
    return '#2E7D5A';
  });

  readonly strengthWidth = computed(() => `${(this.passwordStrength() / 4) * 100}%`);

  async onSubmit(): Promise<void> {
    if (!this.currentPassword() || !this.confirmPassword() || this.newPassword() !== this.confirmPassword() || !this.hasMinLength() || !this.hasUpperCase() || !this.hasNumber() || !this.hasSpecialChar()) return;

    try {
      await this.authStore.changePassword(this.currentPassword(), this.newPassword());
      this.successMessage.set('Password changed successfully. Redirecting...');
      setTimeout(() => this.router.navigate(['/dashboard']), 1500);
    } catch {
      // Error handled in store
    }
  }
}
