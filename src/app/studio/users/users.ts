import { Component, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { StudioApi } from '../studio-api';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-studio-users',
  imports: [FormsModule],
  template: `
    <h1 class="text-xl font-semibold mb-6">Operator accounts</h1>

    <ul class="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white mb-8">
      @for (u of users.value() ?? []; track u.id) {
        <li class="flex items-center gap-3 px-4 py-3 text-sm">
          <div class="flex-1">
            <div class="font-medium">
              {{ u.displayName }}
              @if (u.isSystemAccount) { <span class="ml-1 text-xs text-neutral-400">(built-in)</span> }
            </div>
            <div class="text-xs text-neutral-500">{{ u.email }} · {{ u.role }}</div>
          </div>
          <span class="rounded-full px-2 py-0.5 text-xs"
                [class]="u.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-600'">
            {{ u.isActive ? 'Active' : 'Disabled' }}
          </span>
          <button (click)="toggleActive(u)" [disabled]="u.id === auth.user()?.id"
                  class="text-xs text-neutral-500 hover:text-neutral-900 disabled:opacity-30">
            {{ u.isActive ? 'Disable' : 'Enable' }}
          </button>
          <button (click)="resetPassword(u)" class="text-xs text-neutral-500 hover:text-neutral-900">
            Reset password
          </button>
          @if (!u.isSystemAccount && u.id !== auth.user()?.id) {
            <button (click)="remove(u)" class="text-xs text-neutral-400 hover:text-red-600">Delete</button>
          }
        </li>
      }
    </ul>

    <form (ngSubmit)="create()" class="max-w-md space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
      <h2 class="text-sm font-semibold">Add an operator</h2>
      <input name="displayName" [(ngModel)]="draft.displayName" placeholder="Full name" required
             class="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm" />
      <input name="email" [(ngModel)]="draft.email" type="email" placeholder="Email" required
             class="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm" />
      <input name="password" [(ngModel)]="draft.password" type="password" placeholder="Temporary password (min 10 chars)" required
             class="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm" />
      @if (error()) { <p class="text-xs text-red-600">{{ error() }}</p> }
      <button type="submit" [disabled]="busy()"
              class="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-700 disabled:opacity-50">
        Create account
      </button>
    </form>
  `,
})
export class StudioUsersComponent {
  private readonly api = inject(StudioApi);
  readonly auth = inject(AuthService);

  readonly users = resource({ loader: () => this.api.listUsers() });
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);

  draft = { displayName: '', email: '', password: '' };

  async create(): Promise<void> {
    this.error.set(null);
    this.busy.set(true);
    try {
      await this.api.createUser({ ...this.draft });
      this.draft = { displayName: '', email: '', password: '' };
      this.users.reload();
    } catch (err) {
      this.error.set(message(err));
    } finally {
      this.busy.set(false);
    }
  }

  async toggleActive(u: { id: string; displayName: string; isActive: boolean }): Promise<void> {
    try {
      await this.api.updateUser(u.id, { displayName: u.displayName, isActive: !u.isActive });
      this.users.reload();
    } catch (err) {
      alert(message(err));
    }
  }

  async resetPassword(u: { id: string }): Promise<void> {
    const pw = prompt('New password (min 10 characters):');
    if (!pw) return;
    try {
      await this.api.changeUserPassword(u.id, pw);
      alert('Password updated.');
    } catch (err) {
      alert(message(err));
    }
  }

  async remove(u: { id: string; displayName: string }): Promise<void> {
    if (!confirm(`Delete ${u.displayName}?`)) return;
    try {
      await this.api.removeUser(u.id);
      this.users.reload();
    } catch (err) {
      alert(message(err));
    }
  }
}

function message(err: unknown): string {
  if (err instanceof HttpErrorResponse && err.error?.title) return String(err.error.title);
  return 'Request failed.';
}
