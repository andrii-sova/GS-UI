import { Component, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { StudioApi } from '../studio-api';
import { AuthService } from '../../core/auth/auth.service';
import { T } from '../studio-i18n';

const RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500';

@Component({
  selector: 'app-studio-users',
  imports: [FormsModule],
  template: `
    <h1 class="text-xl font-semibold mb-6">{{ t.users.title }}</h1>

    @if (error()) {
      <p class="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{{ error() }}</p>
    }
    @if (notice()) {
      <p class="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700" role="status">{{ notice() }}</p>
    }

    <ul class="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white mb-8" aria-live="polite">
      @for (u of users.value() ?? []; track u.id) {
        <li class="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
          <div class="min-w-0 flex-1">
            <div class="font-medium">
              {{ u.displayName }}
              @if (u.isSystemAccount) { <span class="ml-1 text-xs text-neutral-400">{{ t.users.builtIn }}</span> }
            </div>
            <div class="truncate text-xs text-neutral-500">{{ u.email }} · {{ roleLabel(u.role) }}</div>
          </div>

          <span class="rounded-full px-2 py-0.5 text-xs"
                [class]="u.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-600'">
            {{ u.isActive ? t.users.active : t.users.disabled }}
          </span>

          <button type="button" (click)="toggleActive(u)" [disabled]="u.id === auth.user()?.id"
                  class="text-xs text-neutral-500 hover:text-neutral-900 disabled:opacity-30 {{ RING }}">
            {{ u.isActive ? t.users.disable : t.users.enable }}
          </button>

          <button type="button" (click)="startReset(u.id)"
                  class="text-xs text-neutral-500 hover:text-neutral-900 {{ RING }}">
            {{ t.users.resetPassword }}
          </button>

          @if (!u.isSystemAccount && u.id !== auth.user()?.id) {
            @if (confirmingId() === u.id) {
              <button type="button" (click)="remove(u)"
                      class="text-xs font-medium text-red-600 {{ RING }}">{{ t.users.confirmDelete }}</button>
              <button type="button" (click)="confirmingId.set(null)"
                      class="text-xs text-neutral-500 hover:text-neutral-900 {{ RING }}">{{ t.common.cancel }}</button>
            } @else {
              <button type="button" (click)="confirmingId.set(u.id)"
                      class="text-xs text-neutral-400 hover:text-red-600 {{ RING }}">{{ t.common.delete }}</button>
            }
          }

          @if (resettingId() === u.id) {
            <form (ngSubmit)="submitReset(u.id)" class="mt-2 flex w-full items-center gap-2">
              <label class="sr-only" [for]="'reset-' + u.id">{{ t.users.newPasswordFor(u.displayName) }}</label>
              <input [id]="'reset-' + u.id" [(ngModel)]="resetPw" name="resetPw" type="password"
                     autocomplete="new-password" [placeholder]="t.users.newPasswordPlaceholder" required
                     class="flex-1 rounded-md border border-neutral-300 px-2 py-1 text-sm {{ RING }}" />
              <button type="submit" class="rounded-md bg-neutral-900 px-2 py-1 text-xs text-white hover:bg-neutral-700 {{ RING }}">
                {{ t.users.set }}
              </button>
              <button type="button" (click)="cancelReset()" class="text-xs text-neutral-500 hover:text-neutral-900 {{ RING }}">
                {{ t.common.cancel }}
              </button>
            </form>
          }
        </li>
      }
    </ul>

    <form (ngSubmit)="create()" autocomplete="off"
          class="max-w-md space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
      <h2 class="text-sm font-semibold">{{ t.users.addTitle }}</h2>

      <label class="block text-sm">
        <span class="text-neutral-600">{{ t.users.fullName }}</span>
        <input name="displayName" [(ngModel)]="draft.displayName" required autocomplete="off"
               class="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1 text-sm {{ RING }}" />
      </label>

      <label class="block text-sm">
        <span class="text-neutral-600">{{ t.users.email }}</span>
        <input name="email" [(ngModel)]="draft.email" type="email" inputmode="email" required
               autocomplete="off" spellcheck="false"
               class="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1 text-sm {{ RING }}" />
      </label>

      <label class="block text-sm">
        <span class="text-neutral-600">{{ t.users.tempPassword }}</span>
        <input name="password" [(ngModel)]="draft.password" type="password" required
               autocomplete="new-password" [placeholder]="t.users.tempPlaceholder"
               class="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1 text-sm {{ RING }}" />
      </label>

      <button type="submit" [disabled]="busy()"
              class="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-700 disabled:opacity-50 {{ RING }}">
        {{ busy() ? t.users.creating : t.users.create }}
      </button>
    </form>
  `,
})
export class StudioUsersComponent {
  private readonly api = inject(StudioApi);
  readonly auth = inject(AuthService);

  protected readonly RING = RING;
  protected readonly t = T;
  protected roleLabel(r: string): string { return T.users.roles[r] ?? r; }

  readonly users = resource({ loader: () => this.api.listUsers() });
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  readonly busy = signal(false);

  readonly confirmingId = signal<string | null>(null);
  readonly resettingId = signal<string | null>(null);
  resetPw = '';

  draft = { displayName: '', email: '', password: '' };

  async create(): Promise<void> {
    this.reset();
    this.busy.set(true);
    try {
      await this.api.createUser({ ...this.draft });
      this.draft = { displayName: '', email: '', password: '' };
      this.notice.set(T.users.created);
      this.users.reload();
    } catch (err) {
      this.error.set(message(err));
    } finally {
      this.busy.set(false);
    }
  }

  async toggleActive(u: { id: string; displayName: string; isActive: boolean }): Promise<void> {
    this.reset();
    try {
      await this.api.updateUser(u.id, { displayName: u.displayName, isActive: !u.isActive });
      this.users.reload();
    } catch (err) {
      this.error.set(message(err));
    }
  }

  startReset(id: string): void {
    this.reset();
    this.resetPw = '';
    this.resettingId.set(id);
  }

  cancelReset(): void {
    this.resettingId.set(null);
    this.resetPw = '';
  }

  async submitReset(id: string): Promise<void> {
    this.reset();
    try {
      await this.api.changeUserPassword(id, this.resetPw);
      this.cancelReset();
      this.notice.set(T.users.passwordUpdated);
    } catch (err) {
      this.error.set(message(err));
    }
  }

  async remove(u: { id: string; displayName: string }): Promise<void> {
    this.reset();
    try {
      await this.api.removeUser(u.id);
      this.confirmingId.set(null);
      this.notice.set(T.users.removed(u.displayName));
      this.users.reload();
    } catch (err) {
      this.error.set(message(err));
    }
  }

  private reset(): void {
    this.error.set(null);
    this.notice.set(null);
  }
}

function message(err: unknown): string {
  if (err instanceof HttpErrorResponse && err.error?.title) return String(err.error.title);
  return T.users.requestFailed;
}
