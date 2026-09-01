import { Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudioApi } from '../studio-api';
import { COLLECTIONS } from '../collections.config';

@Component({
  selector: 'app-studio-dashboard',
  imports: [RouterLink],
  template: `
    <h1 class="text-xl font-semibold mb-6">Dashboard</h1>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      @for (c of collections; track c.key) {
        <a [routerLink]="['/studio', c.key]"
           class="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500">
          <div class="text-2xl" aria-hidden="true">{{ c.icon }}</div>
          <div class="mt-2 text-sm font-medium">{{ c.title }}</div>
          <div class="text-xs text-neutral-500">{{ countLabel(c.key) }}</div>
        </a>
      }
    </div>
  `,
})
export class StudioDashboardComponent {
  private readonly api = inject(StudioApi);
  readonly collections = COLLECTIONS;

  countLabel(key: string): string {
    const n = this.counts.value()?.[key];
    if (n == null) return '…';
    return `${n} ${n === 1 ? 'item' : 'items'}`;
  }

  readonly counts = resource({
    loader: async () => {
      const entries = await Promise.all(
        this.collections.map(async (c) => {
          try {
            const items = await this.api.list<unknown[]>(c.path ?? c.key);
            return [c.key, items.length] as const;
          } catch {
            return [c.key, 0] as const;
          }
        }),
      );
      return Object.fromEntries(entries) as Record<string, number>;
    },
  });
}
