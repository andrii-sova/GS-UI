import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { StudioApi } from '../studio-api';
import { T } from '../studio-i18n';

@Component({
  selector: 'app-studio-account',
  imports: [FormsModule],
  template: `
    <h1 class="text-xl font-semibold mb-6">{{ t.account.title }}</h1>

    <dl class="mb-8 rounded-lg border border-neutral-200 bg-white p-4 text-sm">
      <div class="flex justify-between py-1"><dt class="text-neutral-500">{{ t.account.name }}</dt><dd>{{ auth.user()?.displayName }}</dd></div>
      <div class="flex justify-between py-1"><dt class="text-neutral-500">{{ t.account.email }}</dt><dd>{{ auth.user()?.email }}</dd></div>
      <div class="flex justify-between py-1"><dt class="text-neutral-500">{{ t.account.role }}</dt><dd>{{ roleLabel() }}</dd></div>
    </dl>

    <form (ngSubmit)="changePassword()" class="max-w-md space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
      <h2 class="text-sm font-semibold">{{ t.account.changePassword }}</h2>
      <label class="block text-sm">
        <span class="text-neutral-600">{{ t.account.newPassword }}</span>
        <input name="pw" [(ngModel)]="newPassword" type="password" required
               autocomplete="new-password" [placeholder]="t.account.placeholder"
               class="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1 text-sm
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500" />
      </label>
      @if (message()) {
        <p class="flex items-center gap-1.5 text-xs"
           [class.text-red-600]="isError()" [class.text-green-700]="!isError()"
           [attr.role]="isError() ? 'alert' : 'status'">
          <span aria-hidden="true">{{ isError() ? '⚠' : '✓' }}</span>{{ message() }}
        </p>
      }
      <button type="submit" [disabled]="busy()"
              class="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-700 disabled:opacity-50
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2">
        {{ busy() ? t.account.busy : t.account.submit }}
      </button>
    </form>
  `,
})
export class StudioAccountComponent {
  readonly auth = inject(AuthService);
  protected readonly t = T;
  protected roleLabel(): string { const r = this.auth.user()?.role ?? ''; return T.users.roles[r] ?? r; }
  private readonly api = inject(StudioApi);

  newPassword = '';
  readonly message = signal<string | null>(null);
  readonly isError = signal(false);
  readonly busy = signal(false);

  async changePassword(): Promise<void> {
    const id = this.auth.user()?.id;
    if (!id) return;
    this.busy.set(true);
    this.message.set(null);
    try {
      await this.api.changeUserPassword(id, this.newPassword);
      this.isError.set(false);
      this.message.set(T.account.updated);
      this.newPassword = '';
    } catch (err) {
      this.isError.set(true);
      this.message.set(
        err instanceof HttpErrorResponse && err.error?.title ? String(err.error.title) : T.account.failed,
      );
    } finally {
      this.busy.set(false);
    }
  }
}
