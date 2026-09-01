import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { StudioApi } from '../studio-api';

@Component({
  selector: 'app-studio-account',
  imports: [FormsModule],
  template: `
    <h1 class="text-xl font-semibold mb-6">My account</h1>

    <dl class="mb-8 rounded-lg border border-neutral-200 bg-white p-4 text-sm">
      <div class="flex justify-between py-1"><dt class="text-neutral-500">Name</dt><dd>{{ auth.user()?.displayName }}</dd></div>
      <div class="flex justify-between py-1"><dt class="text-neutral-500">Email</dt><dd>{{ auth.user()?.email }}</dd></div>
      <div class="flex justify-between py-1"><dt class="text-neutral-500">Role</dt><dd>{{ auth.user()?.role }}</dd></div>
    </dl>

    <form (ngSubmit)="changePassword()" class="max-w-md space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
      <h2 class="text-sm font-semibold">Change password</h2>
      <label class="block text-sm">
        <span class="text-neutral-600">New password</span>
        <input name="pw" [(ngModel)]="newPassword" type="password" required
               autocomplete="new-password" placeholder="Min 10 characters — e.g. Lviv-Steel-2026"
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
        {{ busy() ? 'Updating…' : 'Update password' }}
      </button>
    </form>
  `,
})
export class StudioAccountComponent {
  readonly auth = inject(AuthService);
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
      this.message.set('Password updated. Use it next time you sign in.');
      this.newPassword = '';
    } catch (err) {
      this.isError.set(true);
      this.message.set(
        err instanceof HttpErrorResponse && err.error?.title ? String(err.error.title) : 'Could not update password.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}
