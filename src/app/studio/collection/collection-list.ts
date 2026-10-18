import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, resource, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { StudioApi } from '../studio-api';
import { CollectionDef, FieldDef, apiPathOf, collectionByKey, listLink } from '../collections.config';
import { T } from '../studio-i18n';
import { StudioToast } from '../shared/toast';
import { StudioConfirm } from '../shared/confirm';
import { fieldMissingEn, moveItem, pickLoc } from '../shared/localized';

interface Row {
  id: string;
  isPublished: boolean;
  sortOrder?: number;
  [key: string]: unknown;
}

type StatusFilter = 'all' | 'published' | 'hidden';

/** Flattens every string / localized value of a row for the search box. */
function searchText(row: Row): string {
  const parts: string[] = [];
  for (const v of Object.values(row)) {
    if (typeof v === 'string') parts.push(v);
    else if (v && typeof v === 'object' && !Array.isArray(v)) parts.push(...Object.values(v).filter((x) => typeof x === 'string'));
    else if (Array.isArray(v)) {
      for (const it of v) {
        if (typeof it === 'string') parts.push(it);
        else if (it && typeof it === 'object') parts.push(...Object.values(it).filter((x) => typeof x === 'string'));
      }
    }
  }
  return parts.join(' ').toLowerCase();
}

@Component({
  selector: 'app-collection-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (def(); as d) {
      <div class="st-page-head">
        <div>
          <h1 class="st-h1">{{ d.title }}</h1>
          <p class="st-help">
            {{ t.list.total(rows().length, publishedCount()) }}
          </p>
        </div>
        <a [routerLink]="newLink()" class="st-btn st-btn-primary" data-testid="add-new">{{ t.list.addNew(d.singular) }}</a>
      </div>

      <div class="st-toolbar">
        <label class="st-visually-hidden" for="list-search">{{ t.list.search(d.title) }}</label>
        <input id="list-search" type="search" class="st-input" [placeholder]="t.common.search" autocomplete="off"
               [value]="query()" (input)="query.set($any($event.target).value)" />
        <div class="st-seg" role="group" [attr.aria-label]="t.list.filterStatus">
          <button type="button" [attr.aria-pressed]="status() === 'all'" (click)="status.set('all')">{{ t.common.all }}</button>
          <button type="button" [attr.aria-pressed]="status() === 'published'" (click)="status.set('published')">{{ t.common.published }}</button>
          <button type="button" [attr.aria-pressed]="status() === 'hidden'" (click)="status.set('hidden')">{{ t.common.hidden }}</button>
        </div>
      </div>

      @if (!canReorder() && rows().length > 1) {
        <p class="st-help" style="margin-bottom:.5rem">{{ t.list.reorderHint }}</p>
      }

      <div aria-live="polite">
        @if (items.isLoading() && !items.hasValue()) {
          <div class="st-list" aria-busy="true">
            <div class="st-skeleton"></div><div class="st-skeleton"></div><div class="st-skeleton"></div>
            <span class="st-visually-hidden">{{ t.common.loading }}</span>
          </div>
        } @else if (items.error()) {
          <div class="st-card st-state error" role="alert">
            {{ t.list.loadError(d.title) }}
            <button type="button" class="st-btn st-btn-sm" (click)="items.reload()">{{ t.common.retry }}</button>
          </div>
        } @else if (rows().length === 0) {
          <div class="st-card st-state">
            <p style="margin:0 0 .75rem">{{ t.list.empty() }}</p>
            <a [routerLink]="newLink()" class="st-btn st-btn-primary">{{ t.list.addNew(d.singular) }}</a>
          </div>
        } @else if (filtered().length === 0) {
          <div class="st-card st-state">{{ t.common.nothingFound }}</div>
        } @else {
          <ul class="st-list" [attr.aria-label]="d.title">
            @for (row of filtered(); track row.id; let i = $index) {
              <li class="st-row" [class.hidden-item]="!row.isPublished" [class.dragging]="dragFrom() === i"
                  [class.dropover]="dragOver() === i && dragFrom() !== i"
                  [attr.draggable]="canReorder()"
                  (dragstart)="onDragStart(i, $event)" (dragover)="onDragOver(i, $event)"
                  (drop)="onDrop(i, $event)" (dragend)="dragFrom.set(null); dragOver.set(null)">
                @if (canReorder()) {
                  <span class="st-grip st-only-desktop" aria-hidden="true" [title]="t.list.dragToReorder">⋮⋮</span>
                  <div style="display:flex;flex-direction:column">
                    <button type="button" class="st-icon-btn" style="height:22px" [disabled]="i === 0" (click)="move(i, -1)"
                            [attr.aria-label]="t.list.move(title(row), 'вгору')">▲</button>
                    <button type="button" class="st-icon-btn" style="height:22px" [disabled]="i === filtered().length - 1"
                            (click)="move(i, 1)" [attr.aria-label]="t.list.move(title(row), 'вниз')">▼</button>
                  </div>
                }

                @if (thumbField(); as tf) {
                  @if (row[tf.key]) {
                    <img class="st-thumb" [class.contain]="tf.contain" [src]="$any(row[tf.key])" alt="" loading="lazy" />
                  } @else {
                    <span class="st-thumb" aria-hidden="true"></span>
                  }
                }

                <div style="flex:1;min-width:0">
                  <a [routerLink]="editLink(row)" class="st-row-title">{{ title(row) }}</a>
                  @if (subtitle(row); as sub) { <div class="st-row-sub">{{ sub }}</div> }
                </div>

                @if (missingEn(row)) {
                  <span class="st-chip warn" [title]="t.lang.missingHint">EN?</span>
                  <span class="st-visually-hidden">{{ t.lang.missingShort }}</span>
                }

                <span class="st-chip st-only-desktop" [class.ok]="row.isPublished">{{ row.isPublished ? t.common.published : t.common.hidden }}</span>

                <button type="button" role="switch" class="st-switch" [attr.aria-checked]="row.isPublished"
                        [attr.aria-label]="t.list.toggle(row.isPublished, title(row))"
                        [title]="t.list.toggleTitle(row.isPublished)"
                        (click)="togglePublished(row)"></button>

                <a [routerLink]="editLink(row)" class="st-btn st-btn-sm st-only-desktop" [attr.aria-label]="t.list.edit(title(row))">{{ t.common.edit }}</a>
                <button type="button" class="st-icon-btn danger" (click)="remove(row)"
                        [attr.aria-label]="t.list.del(title(row))" [title]="t.common.delete">🗑</button>
              </li>
            }
          </ul>
        }
      </div>
    } @else {
      <p class="st-state error" role="alert">{{ t.common.unknownType }}</p>
    }
  `,
})
export class CollectionListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(StudioApi);
  private readonly toast = inject(StudioToast);
  private readonly confirm = inject(StudioConfirm);
  protected readonly t = T;

  readonly collectionKey = toSignal(
    this.route.data.pipe(map((d) => String(d['collection'] ?? ''))),
    { initialValue: '' },
  );
  readonly def = computed<CollectionDef | undefined>(() => collectionByKey(this.collectionKey()));

  readonly query = signal('');
  readonly status = signal<StatusFilter>('all');
  readonly dragFrom = signal<number | null>(null);
  readonly dragOver = signal<number | null>(null);

  readonly items = resource({
    params: () => {
      const d = this.def();
      return d ? { path: apiPathOf(d) } : undefined;
    },
    loader: ({ params }) => this.api.list<Row>(params.path),
  });

  /** Local, optimistically reorderable copy of the server list. */
  readonly rows = linkedSignal<Row[]>(() =>
    [...(this.items.hasValue() ? this.items.value() : [])].sort(
      (a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0),
    ),
  );

  readonly publishedCount = computed(() => this.rows().filter((r) => r.isPublished).length);

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const s = this.status();
    return this.rows().filter(
      (r) =>
        (s === 'all' || (s === 'published') === r.isPublished) && (!q || searchText(r).includes(q)),
    );
  });

  readonly canReorder = computed(() => !this.query().trim() && this.status() === 'all');
  readonly thumbField = computed<FieldDef | undefined>(() => this.def()?.fields.find((f) => f.thumbField));

  newLink(): string[] { return [...listLink(this.def()!), 'new']; }
  editLink(row: Row): string[] { return [...listLink(this.def()!), row.id]; }

  private fieldText(field: FieldDef | undefined, row: Row): string {
    if (!field) return '';
    const v = row[field.key];
    if (v && typeof v === 'object') return pickLoc(v, 'uk');
    return v == null ? '' : String(v);
  }

  title(row: Row): string {
    const field = this.def()?.fields.find((f) => f.titleField);
    return this.fieldText(field, row) || T.common.untitled;
  }

  subtitle(row: Row): string {
    const field = this.def()?.fields.find((f) => f.subtitleField);
    if (field?.kind === 'date') return String(row[field.key] ?? '').slice(0, 10);
    return this.fieldText(field, row);
  }

  missingEn(row: Row): boolean {
    return !!this.def()?.fields.some((f) => fieldMissingEn(f, row[f.key]));
  }

  async togglePublished(row: Row): Promise<void> {
    const d = this.def()!;
    const next = !row.isPublished;
    this.rows.update((rs) => rs.map((r) => (r.id === row.id ? { ...r, isPublished: next } : r)));
    try {
      await this.api.setPublished(apiPathOf(d), row.id, next);
      this.toast.success(next ? T.list.nowVisible : T.list.nowHidden);
    } catch {
      this.rows.update((rs) => rs.map((r) => (r.id === row.id ? { ...r, isPublished: !next } : r)));
      this.toast.error(T.list.toggleFailed);
    }
  }

  async remove(row: Row): Promise<void> {
    const d = this.def()!;
    const ok = await this.confirm.ask({
      title: T.list.deleteTitle(d.singular),
      message: T.list.deleteMessage(this.title(row)),
      confirmLabel: T.common.delete,
      danger: true,
    });
    if (!ok) return;
    try {
      await this.api.remove(apiPathOf(d), row.id);
      this.rows.update((rs) => rs.filter((r) => r.id !== row.id));
      this.toast.success(T.common.deleted);
    } catch {
      this.toast.error(T.list.deleteFailed);
    }
  }

  async move(index: number, direction: -1 | 1): Promise<void> {
    await this.moveTo(index, index + direction);
  }

  private async moveTo(from: number, to: number): Promise<void> {
    if (!this.canReorder() || from === to) return;
    const before = this.rows();
    const after = moveItem(before, from, to);
    if (after === before) return;
    this.rows.set(after);
    try {
      await this.api.reorder(apiPathOf(this.def()!), after.map((r) => r.id));
    } catch {
      this.rows.set(before);
      this.toast.error(T.list.reorderFailed);
    }
  }

  onDragStart(index: number, event: DragEvent): void {
    if (!this.canReorder()) return;
    this.dragFrom.set(index);
    event.dataTransfer?.setData('text/plain', String(index));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onDragOver(index: number, event: DragEvent): void {
    if (this.dragFrom() == null) return;
    event.preventDefault();
    this.dragOver.set(index);
  }

  onDrop(index: number, event: DragEvent): void {
    event.preventDefault();
    const from = this.dragFrom();
    this.dragFrom.set(null);
    this.dragOver.set(null);
    if (from != null) void this.moveTo(from, index);
  }
}
