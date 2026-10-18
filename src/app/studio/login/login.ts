import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { T } from '../studio-i18n';

@Component({
  selector: 'app-studio-login',
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-10"
         style="background: radial-gradient(70% 90% at 80% 0%, rgba(0,113,188,.35), transparent 60%), #0b1822">
      <form
        (ngSubmit)="submit()"
        class="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 sm:p-10 shadow-2xl"
        style="box-shadow: 0 30px 80px rgba(0,0,0,.45)"
      >
        <div class="flex items-center gap-3">
          <span class="grid h-11 w-11 place-items-center rounded-xl text-lg font-extrabold text-white"
                style="background: linear-gradient(135deg,#0071bc,#0a8ad8)">G</span>
          <div>
            <h1 class="text-xl font-extrabold leading-tight" style="color:#18232a">{{ t.brand }}</h1>
            <p class="text-sm" style="color:#465053">{{ t.login.subtitle }}</p>
          </div>
        </div>

        <label class="block space-y-1.5">
          <span class="text-sm font-semibold" style="color:#18232a">{{ t.login.email }}</span>
          <input
            name="email" type="email" autocomplete="username" spellcheck="false" required
            [(ngModel)]="email"
            class="w-full rounded-lg border px-3.5 text-base"
          />
        </label>

        <label class="block space-y-1.5">
          <span class="text-sm font-semibold" style="color:#18232a">{{ t.login.password }}</span>
          <input
            name="password" type="password" autocomplete="current-password" required
            [(ngModel)]="password"
            class="w-full rounded-lg border px-3.5 text-base"
          />
        </label>

        <p class="min-h-5 text-sm font-medium" style="color:#b81e15" role="alert">{{ error() }}</p>

        <button
          type="submit" [disabled]="busy()"
          class="w-full rounded-lg px-4 text-base font-semibold text-white disabled:opacity-60"
          style="min-height:48px; background:#0071bc; box-shadow:0 6px 18px rgba(0,113,188,.35)"
        >
          {{ busy() ? t.login.busy : t.login.submit }}
        </button>
      </form>
    </div>
  `,
})
export class StudioLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly t = T;
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
          ? T.login.invalid
          : T.login.failed,
      );
    } finally {
      this.busy.set(false);
    }
  }
}
