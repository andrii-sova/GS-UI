import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { COLLECTIONS } from '../collections.config';

@Component({
  selector: 'app-studio-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-900 flex">
      <aside class="w-60 shrink-0 border-r border-neutral-200 bg-white flex flex-col">
        <div class="px-5 py-4 border-b border-neutral-200">
          <p class="text-sm font-semibold">Galicia Steel</p>
          <p class="text-xs text-neutral-500">Content Studio</p>
        </div>

        <nav class="flex-1 overflow-y-auto p-3 space-y-1 text-sm">
          <a routerLink="/studio/dashboard" routerLinkActive="bg-neutral-900 text-white"
             class="block rounded-md px-3 py-2 hover:bg-neutral-100">Dashboard</a>

          <p class="px-3 pt-4 pb-1 text-xs uppercase tracking-wide text-neutral-400">Content</p>
          @for (c of collections; track c.key) {
            <a [routerLink]="['/studio', c.key]" routerLinkActive="bg-neutral-900 text-white"
               class="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-neutral-100">
              <span>{{ c.icon }}</span>{{ c.title }}
            </a>
          }

          <p class="px-3 pt-4 pb-1 text-xs uppercase tracking-wide text-neutral-400">System</p>
          <a routerLink="/studio/users" routerLinkActive="bg-neutral-900 text-white"
             class="block rounded-md px-3 py-2 hover:bg-neutral-100">Operator accounts</a>
          <a routerLink="/studio/account" routerLinkActive="bg-neutral-900 text-white"
             class="block rounded-md px-3 py-2 hover:bg-neutral-100">My account</a>
        </nav>

        <div class="border-t border-neutral-200 p-3 text-sm">
          <p class="px-3 text-xs text-neutral-500">{{ auth.user()?.displayName }}</p>
          <p class="px-3 text-xs text-neutral-400 truncate">{{ auth.user()?.email }}</p>
          <button (click)="logout()" class="mt-2 w-full rounded-md px-3 py-2 text-left hover:bg-neutral-100">
            Sign out
          </button>
          <a routerLink="/" class="mt-1 block rounded-md px-3 py-2 text-xs text-neutral-500 hover:bg-neutral-100">
            ← View site
          </a>
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto">
        <div class="mx-auto max-w-4xl px-6 py-8">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class StudioShellComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly collections = COLLECTIONS;

  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/studio/login');
  }
}
