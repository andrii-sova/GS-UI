import { Component, computed, inject, resource, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
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
           class="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-700
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2">
          + New {{ d.singular.toLowerCase() }}
        </a>
      </div>

      @if (actionError()) {
        <p class="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{{ actionError() }}</p>
      }

      <div aria-live="polite">
        @if (items.isLoading()) {
          <p class="text-sm text-neutral-500">Loading…</p>
        } @else if (items.error()) {
          <p class="text-sm text-red-600" role="alert">Could not load items.</p>
        } @else {
          <ul class="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
            @for (row of rows(); track row.id; let i = $index) {
              <li class="flex items-center gap-3 px-4 py-3 text-sm">
                <div class="flex flex-col">
                  <button type="button" (click)="move(i, -1)" [disabled]="i === 0" aria-label="Move up"
                          class="text-neutral-400 hover:text-neutral-900 disabled:opacity-30 leading-none
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500">▲</button>
                  <button type="button" (click)="move(i, 1)" [disabled]="i === rows().length - 1" aria-label="Move down"
                          class="text-neutral-400 hover:text-neutral-900 disabled:opacity-30 leading-none
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500">▼</button>
                </div>

                <a [routerLink]="['/studio', d.key, row.id]"
                   class="flex-1 min-w-0 truncate font-medium hover:underline
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500">
                  {{ title(row) }}
                </a>

                <button type="button" (click)="togglePublished(row)"
                        [attr.aria-pressed]="row.isPublished"
                        [attr.aria-label]="(row.isPublished ? 'Published' : 'Draft') + ' — toggle'"
                        class="rounded-full px-2 py-0.5 text-xs
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
                        [class]="row.isPublished
                          ? 'bg-green-100 text-green-700'
                          : 'bg-neutral-200 text-neutral-600'">
                  {{ row.isPublished ? 'Published' : 'Draft' }}
                </button>

                @if (confirmingId() === row.id) {
                  <button type="button" (click)="remove(row)"
                          class="text-red-600 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500">
                    Confirm delete
                  </button>
                  <button type="button" (click)="confirmingId.set(null)"
                          class="text-neutral-500 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500">
                    Cancel
                  </button>
                } @else {
                  <button type="button" (click)="confirmingId.set(row.id)"
                          class="text-neutral-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500">
                    Delete
                  </button>
                }
              </li>
            } @empty {
              <li class="px-4 py-6 text-sm text-neutral-500">No items yet.</li>
            }
          </ul>
        }
      </div>
    } @else {
      <p class="text-sm text-red-600" role="alert">Unknown collection.</p>
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

  readonly confirmingId = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);

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
    this.actionError.set(null);
    try {
      await this.api.setPublished(this.path, row.id, !row.isPublished);
      this.items.reload();
    } catch {
      this.actionError.set('Could not change the publish state. Try again.');
    }
  }

  async remove(row: Row): Promise<void> {
    this.actionError.set(null);
    try {
      await this.api.remove(this.path, row.id);
      this.confirmingId.set(null);
      this.items.reload();
    } catch {
      this.actionError.set('Could not delete this item — it may still be referenced elsewhere.');
    }
  }

  async move(index: number, direction: -1 | 1): Promise<void> {
    const ordered = this.rows().map((r) => r.id);
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    this.actionError.set(null);
    try {
      await this.api.reorder(this.path, ordered);
      this.items.reload();
    } catch {
      this.actionError.set('Could not save the new order. Try again.');
    }
  }
}
