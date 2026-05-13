import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../stores/auth.store';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center relative overflow-hidden" 
         style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%);">
      
      <!-- Decorative curved shapes -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <!-- Top right curve -->
        <svg class="absolute -top-20 -right-20 w-96 h-96 opacity-20" viewBox="0 0 200 200">
          <path d="M100,0 C150,0 200,50 200,100 C200,150 150,200 100,200 C50,200 0,150 0,100 C0,50 50,0 100,0" 
                fill="white"/>
        </svg>
        <!-- Bottom left curve -->
        <svg class="absolute -bottom-32 -left-32 w-[500px] h-[500px] opacity-15" viewBox="0 0 200 200">
          <path d="M100,0 C155,0 200,45 200,100 C200,155 155,200 100,200 C45,200 0,155 0,100 C0,45 45,0 100,0" 
                fill="white"/>
        </svg>
        <!-- Middle wave -->
        <svg class="absolute top-1/2 right-0 w-80 h-80 opacity-10 transform translate-x-20 -translate-y-1/2" viewBox="0 0 200 200">
          <ellipse cx="100" cy="100" rx="100" ry="80" fill="white"/>
        </svg>
        <!-- Small decorative dots -->
        <div class="absolute top-20 left-20 w-2 h-2 rounded-full bg-white opacity-30"></div>
        <div class="absolute top-32 left-40 w-1.5 h-1.5 rounded-full bg-white opacity-20"></div>
        <div class="absolute bottom-40 right-20 w-2 h-2 rounded-full bg-white opacity-25"></div>
        <div class="absolute top-1/3 right-32 w-1 h-1 rounded-full bg-white opacity-20"></div>
      </div>

      <!-- Main content -->
      <div class="relative z-10 w-full max-w-[420px] px-4">
        
        <!-- Logo Section -->
        <div class="text-center mb-8">
          <!-- Bell Logo -->
          <div class="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-lg">
              <!-- Bell shape -->
              <defs>
                <linearGradient id="bellGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#60a5fa"/>
                  <stop offset="100%" stop-color="#2563eb"/>
                </linearGradient>
              </defs>
              <path d="M40 8 C40 8 20 8 20 30 C20 45 15 52 15 55 L65 55 C65 52 60 45 60 30 C60 8 40 8 40 8" 
                    fill="url(#bellGradient)" stroke="white" stroke-width="2"/>
              <!-- Checkmark inside bell -->
              <path d="M33 38 L38 43 L48 33" 
                    fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <!-- Bell bottom -->
              <path d="M30 55 C30 61 34 68 40 68 C46 68 50 61 50 55" 
                    fill="#1e40af" stroke="white" stroke-width="2"/>
            </svg>
          </div>
          <h1 class="text-4xl font-bold text-white tracking-tight mb-1">remindly</h1>
          <p class="text-blue-100 text-sm font-medium tracking-wide">Stay organized. Stay ahead.</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white rounded-2xl shadow-2xl p-8">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h2>
            <p class="text-gray-500 text-sm">Sign in to your account</p>
          </div>

          <!-- Error Message -->
          @if (error()) {
            <div class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 text-center">
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Email Field -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white
                         text-gray-800 placeholder-gray-400
                         focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                         transition-all duration-200"
                  placeholder="Enter your email" />
              </div>
            </div>

            <!-- Password Field -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  class="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 bg-white
                         text-gray-800 placeholder-gray-400
                         focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                         transition-all duration-200"
                  placeholder="Enter your password" />
                <!-- Toggle password visibility -->
                <button
                  type="button"
                  (click)="togglePassword()"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors">
                  @if (showPassword()) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  }
                </button>
              </div>
            </div>

            <!-- Sign In Button -->
            <button
              type="submit"
              [disabled]="isLoading() || !email() || !password()"
              class="w-full py-3.5 px-4 rounded-xl font-semibold text-white text-base
                     bg-gradient-to-r from-blue-600 to-blue-500
                     hover:from-blue-700 hover:to-blue-600
                     focus:outline-none focus:ring-4 focus:ring-blue-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transform active:scale-[0.98]
                     transition-all duration-200 shadow-lg shadow-blue-500/30">
              @if (isLoading()) {
                <div class="flex items-center justify-center gap-2">
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </div>
              } @else {
                <span>Sign In</span>
              }
            </button>
          </form>
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-blue-100 mt-6 opacity-80">
          Development Environment Only
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly isLoading = this.authStore.isLoading;
  readonly error = this.authStore.error;

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  async onSubmit(): Promise<void> {
    if (!this.email() || !this.password()) return;
    
    try {
      await this.authStore.login(this.email(), this.password());
      await this.router.navigate(['/dashboard']);
    } catch {
      // Error is handled in store
    }
  }
}
