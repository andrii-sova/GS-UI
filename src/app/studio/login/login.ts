import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-studio-login',
  imports: [FormsModule],
  host: { style: 'color-scheme: dark' },
  template: `
    <div class="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
      <form
        (ngSubmit)="submit()"
        class="w-full max-w-sm space-y-5 rounded-xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl"
      >
        <div class="space-y-1">
          <h1 class="text-lg font-semibold">Galicia Steel · Studio</h1>
          <p class="text-sm text-neutral-400">Sign in to manage site content.</p>
        </div>

        <label class="block space-y-1">
          <span class="text-sm text-neutral-300">Email</span>
          <input
            name="email" type="email" autocomplete="username" spellcheck="false" required
            [(ngModel)]="email"
            class="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          />
        </label>

        <label class="block space-y-1">
          <span class="text-sm text-neutral-300">Password</span>
          <input
            name="password" type="password" autocomplete="current-password" required
            [(ngModel)]="password"
            class="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          />
        </label>

        <p class="min-h-5 text-sm text-red-400" role="alert">{{ error() }}</p>

        <button
          type="submit" [disabled]="busy()"
          class="w-full rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200
                 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
        >
          {{ busy() ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  `,
})
export class StudioLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);

  async submit(): Promise<void> {
    this.error.set(null);
    this.busy.set(true);
    try {
      await this.auth.login({ email: this.email, password: this.password });
      await this.router.navigateByUrl('/studio');
    } catch (err) {
      this.error.set(
        err instanceof HttpErrorResponse && err.status === 401
          ? 'Invalid email or password.'
          : 'Something went wrong. Please try again.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}
