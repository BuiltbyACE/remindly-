import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../auth/stores/auth.store';

@Component({
  selector: 'app-admin-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  styles: [`
    :host { display: contents; }

    .page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(165deg, #0A1929 0%, #0F2B4C 35%, #1A5F8B 65%, #2D7A9F 100%);
      position: relative;
      overflow: hidden;
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
    .lines {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.03;
      background-image: repeating-linear-gradient(90deg, transparent, transparent 120px, #E8DCCE 120px, #E8DCCE 121px);
    }
    .lines-vert {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.025;
      background-image: repeating-linear-gradient(0deg, transparent, transparent 80px, #E8DCCE 80px, #E8DCCE 81px);
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
      width: 72px; height: 72px;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-ring-inner {
      width: 72px; height: 72px;
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
      margin: 0 0 6px;
    }

    .brand-tagline {
      font-family: var(--font-body);
      font-size: 13px;
      color: rgba(255,255,255,.5);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin: 0;
    }

    .card {
      background: #FCFAF7;
      border-radius: 20px;
      padding: 40px 36px;
      box-shadow: 0 20px 60px rgba(10,25,41,.25), 0 4px 16px rgba(10,25,41,.15);
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

    .admin-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      background: rgba(201,169,110,.15);
      border: 1px solid rgba(201,169,110,.3);
      border-radius: 50px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #C9A96E;
      margin-bottom: 16px;
    }

    .back-link {
      display: block;
      text-align: center;
      margin-top: 16px;
      font-size: 13px;
      color: #8C959E;
      text-decoration: none;
    }
    .back-link:hover { color: #3A82B5; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 640px) {
      .page { align-items: flex-start; padding-top: env(safe-area-inset-top); min-height: 100dvh; }
      .content { max-width: 100%; padding: 0; animation: none; }
      .logo-area { margin-bottom: 0; padding: 48px 24px 32px; }
      .brand-name { font-size: 30px; }
      .card { border-radius: 20px 20px 0 0; padding: 32px 24px calc(24px + env(safe-area-inset-bottom)); min-height: 60vh; display: flex; flex-direction: column; justify-content: center; }
      .card-title { font-size: 22px; }
      .wave-1, .wave-2 { display: none; }
      .input-field { padding: 14px 14px 14px 42px; font-size: 16px; }
      .submit-btn { padding: 16px 24px; font-size: 16px; }
    }
  `],
  template: `
    <div class="page">
      <div class="wave-layer">
        <div class="wave wave-1"></div>
        <div class="wave wave-2"></div>
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
          <p class="brand-tagline">Admin Portal</p>
        </div>

        <div class="card">
          <div style="text-align:center">
            <div class="admin-badge">
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              Super Admin
            </div>
          </div>
          <div class="card-header">
            <h2 class="card-title">Admin Sign In</h2>
            <p class="card-sub">Enter your credentials to continue</p>
          </div>

          @if (error()) {
            <div class="error-msg" role="alert">{{ error() }}</div>
          }

          <form (ngSubmit)="onSubmit()">
            <div class="field">
              <label class="field-label" for="email">Email</label>
              <div class="input-wrap">
                <span class="input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </span>
                <input id="email" type="email" [(ngModel)]="email" name="email" required
                       class="input-field" placeholder="admin@remindly" />
              </div>
            </div>

            <div class="field">
              <label class="field-label" for="password">Password</label>
              <div class="input-wrap">
                <span class="input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </span>
                <input id="password" [type]="showPassword() ? 'text' : 'password'"
                       [(ngModel)]="password" name="password" required
                       class="input-field" placeholder="Enter your password" />
                <button type="button" class="toggle-pw" (click)="showPassword.update(v => !v)" aria-label="Toggle password">
                  @if (showPassword()) {
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

            <button type="submit" class="submit-btn" [disabled]="isLoading() || !email() || !password()">
              @if (isLoading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              } @else {
                Sign In
              }
            </button>
          </form>

          <a routerLink="/auth/login" class="back-link">Back to user login</a>
        </div>
      </div>
    </div>
  `,
})
export class AdminLoginComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly email = signal('admin@remindly.com');
  readonly password = signal('Remindly@2026');
  readonly showPassword = signal(false);
  readonly isLoading = this.authStore.isLoading;
  readonly error = this.authStore.error;

  ngOnInit(): void {
    if (this.authStore.isAuthenticated()) {
      this.redirectByRole();
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.email() || !this.password()) return;
    try {
      await this.authStore.login(this.email(), this.password());
      await this.redirectByRole();
    } catch {
      // handled by store
    }
  }

  private redirectByRole(): void {
    const userCached = sessionStorage.getItem('remindly_user');
    if (userCached) {
      try {
        const user = JSON.parse(userCached);
        if (user.super_admin === true || user.role === 'super_admin') {
          this.router.navigate(['/admin/dashboard']);
          return;
        }
      } catch {
        // fall through
      }
    }
    const cached = sessionStorage.getItem('remindly_permissions');
    if (cached) {
      try {
        const raw = JSON.parse(cached);
        const permissions: string[] = Array.isArray(raw) ? raw : [];
        if (permissions.includes('admin.access')) {
          this.router.navigate(['/admin/dashboard']);
          return;
        }
      } catch {
        // ignore
      }
    }
    this.router.navigate(['/dashboard']);
  }
}
