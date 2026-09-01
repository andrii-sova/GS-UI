import { Component, computed, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { StudioApi } from '../studio-api';
import { collectionByKey } from '../collections.config';

interface Row {
  id: string;
  isPublished: boolean;
  [key: string]: unknown;
}

@Component({
  selector: 'app-collection-list',
  imports: [RouterLink],
  template: `
    @if (def(); as d) {
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-semibold">{{ d.title }}</h1>
        <a [routerLink]="['/studio', d.key, 'new']"
           class="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-700">
          + New {{ d.singular.toLowerCase() }}
        </a>
      </div>

      @if (items.isLoading()) {
        <p class="text-sm text-neutral-500">Loading…</p>
      } @else if (items.error()) {
        <p class="text-sm text-red-600">Could not load items.</p>
      } @else {
        <ul class="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
          @for (row of rows(); track row.id; let i = $index) {
            <li class="flex items-center gap-3 px-4 py-3 text-sm">
              <div class="flex flex-col">
                <button (click)="move(i, -1)" [disabled]="i === 0"
                        class="text-neutral-400 hover:text-neutral-900 disabled:opacity-30 leading-none">▲</button>
                <button (click)="move(i, 1)" [disabled]="i === rows().length - 1"
                        class="text-neutral-400 hover:text-neutral-900 disabled:opacity-30 leading-none">▼</button>
              </div>

              <a [routerLink]="['/studio', d.key, row.id]" class="flex-1 font-medium hover:underline">
                {{ title(row) }}
              </a>

              <button (click)="togglePublished(row)"
                      class="rounded-full px-2 py-0.5 text-xs"
                      [class]="row.isPublished
                        ? 'bg-green-100 text-green-700'
                        : 'bg-neutral-200 text-neutral-600'">
                {{ row.isPublished ? 'Published' : 'Draft' }}
              </button>

              <button (click)="remove(row)" class="text-neutral-400 hover:text-red-600">Delete</button>
            </li>
          } @empty {
            <li class="px-4 py-6 text-sm text-neutral-500">No items yet.</li>
          }
        </ul>
      }
    } @else {
      <p class="text-sm text-red-600">Unknown collection.</p>
    }
  `,
})
export class CollectionListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(StudioApi);

  readonly collectionKey = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('collection') ?? '')),
    { initialValue: '' },
  );

  readonly def = computed(() => collectionByKey(this.collectionKey()));

  readonly items = resource({
    params: () => ({ path: this.def()?.path ?? this.def()?.key }),
    loader: async ({ params }) => {
      if (!params.path) return [] as Row[];
      return this.api.list<Row>(params.path);
    },
  });

  readonly rows = computed(() =>
    [...(this.items.value() ?? [])].sort(
      (a, b) => Number(a['sortOrder'] ?? 0) - Number(b['sortOrder'] ?? 0),
    ),
  );

  private get path(): string {
    return this.def()?.path ?? this.def()!.key;
  }

  title(row: Row): string {
    const field = this.def()?.fields.find((f) => f.titleField);
    if (!field) return row.id;
    const value = row[field.key];
    if (value && typeof value === 'object' && 'uk' in value) {
      const loc = value as { uk?: string; en?: string };
      return loc.uk || loc.en || '(untitled)';
    }
    return String(value ?? '(untitled)');
  }

  async togglePublished(row: Row): Promise<void> {
    await this.api.setPublished(this.path, row.id, !row.isPublished);
    this.items.reload();
  }

  async remove(row: Row): Promise<void> {
    if (!confirm(`Delete "${this.title(row)}"? This cannot be undone.`)) return;
    try {
      await this.api.remove(this.path, row.id);
      this.items.reload();
    } catch {
      alert('Could not delete this item (it may still be referenced elsewhere).');
    }
  }

  async move(index: number, direction: -1 | 1): Promise<void> {
    const ordered = this.rows().map((r) => r.id);
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    await this.api.reorder(this.path, ordered);
    this.items.reload();
  }
}
