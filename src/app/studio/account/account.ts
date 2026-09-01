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
      <input name="pw" [(ngModel)]="newPassword" type="password" placeholder="New password (min 10 characters)" required
             class="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm" />
      @if (message()) { <p class="text-xs" [class.text-red-600]="isError()" [class.text-green-700]="!isError()">{{ message() }}</p> }
      <button type="submit" [disabled]="busy()"
              class="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-700 disabled:opacity-50">
        Update password
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
