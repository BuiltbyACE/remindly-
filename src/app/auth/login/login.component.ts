import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../stores/auth.store';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[var(--color-surface-alt)]">
      <div class="w-full max-w-[400px] p-8">
        
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-12 h-12 rounded-xl bg-blue-600 mx-auto mb-4 flex items-center justify-center">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 class="text-2xl font-semibold text-[var(--color-text-primary)]">Remindly</h1>
          <p class="text-sm text-[var(--color-text-secondary)] mt-1">Executive AI Assistant</p>
        </div>

        <!-- Login Form -->
        <form (ngSubmit)="onSubmit()" class="space-y-4">
          
          @if (error()) {
            <div class="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {{ error() }}
            </div>
          }

          <div>
            <label for="email" class="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              required
              class="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-white
                     text-[var(--color-text-primary)] text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     transition-all"
              placeholder="you@organization.com" />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              class="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-white
                     text-[var(--color-text-primary)] text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     transition-all"
              placeholder="••••••••" />
          </div>

          <button
            type="submit"
            [disabled]="isLoading() || !email() || !password()"
            class="w-full py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium text-sm
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all flex items-center justify-center gap-2">
            
            @if (isLoading()) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Signing in...</span>
            } @else {
              <span>Sign In</span>
            }
          </button>
        </form>

        <p class="text-center text-xs text-[var(--color-text-muted)] mt-6">
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
  readonly isLoading = this.authStore.isLoading;
  readonly error = this.authStore.error;

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
