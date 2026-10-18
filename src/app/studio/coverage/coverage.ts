import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, resource, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { StudioApi, ContentItem } from '../studio-api';
import { T } from '../studio-i18n';
import { LocPairComponent } from '../shared/loc-field';
import { StudioToast } from '../shared/toast';
import { LocalizedText, isMissingEn, pickLoc } from '../shared/localized';

interface GeoItem extends ContentItem {
  key: string;
  name: LocalizedText;
}

type Filter = 'all' | 'active' | 'inactive';

const KINDS = T.coverage.kinds;
type Kind = keyof typeof KINDS;

/** Searchable toggle list for `export-countries` / `regions`: highlight, un-highlight, rename uk/en. */
@Component({
  selector: 'app-coverage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LocPairComponent],
  template: `
    <div class="st-page-head">
      <div>
        <h1 class="st-h1">{{ meta().title }}</h1>
        <p class="st-help">{{ meta().help }}</p>
      </div>
    </div>

    @if (items.isLoading() && !items.hasValue()) {
      <div class="st-list" aria-busy="true"><div class="st-skeleton"></div><div class="st-skeleton"></div><div class="st-skeleton"></div><span class="st-visually-hidden">{{ t.common.loading }}</span></div>
    } @else if (items.error()) {
      <div class="st-card st-state error" role="alert">
        {{ t.coverage.loadError }}
        <button type="button" class="st-btn st-btn-sm" (click)="items.reload()">{{ t.common.retry }}</button>
      </div>
    } @else {
      <div class="st-card" style="margin-bottom:1rem" [attr.aria-label]="t.coverage.preview">
        <p class="st-label" role="status" data-testid="active-count">
          {{ t.coverage.activeCount(activeItems().length, rows().length, meta().noun) }}
        </p>
        <div style="display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.5rem">
          @for (r of activeItems(); track r.id) {
            <span class="st-chip ok">{{ label(r) }}</span>
          } @empty {
            <span class="st-help">{{ t.coverage.nothingHighlighted }}</span>
          }
        </div>
      </div>

      <div class="st-toolbar">
        <label class="st-visually-hidden" for="cov-search">{{ t.coverage.searchLabel(meta().noun) }}</label>
        <input id="cov-search" type="search" class="st-input" [placeholder]="t.common.search" autocomplete="off"
               [value]="query()" (input)="query.set($any($event.target).value)" />
        <div class="st-seg" role="group" [attr.aria-label]="t.coverage.filter">
          <button type="button" [attr.aria-pressed]="filter() === 'all'" (click)="filter.set('all')">{{ t.common.all }}</button>
          <button type="button" [attr.aria-pressed]="filter() === 'active'" (click)="filter.set('active')">{{ t.coverage.active }}</button>
          <button type="button" [attr.aria-pressed]="filter() === 'inactive'" (click)="filter.set('inactive')">{{ t.coverage.inactive }}</button>
        </div>
      </div>

      @if (filtered().length === 0) {
        <div class="st-card st-state">{{ t.common.nothingFound }}</div>
      } @else {
        <ul class="st-list">
          @for (r of filtered(); track r.id) {
            <li class="st-row" style="align-items:flex-start" [class.hidden-item]="!r.isPublished">
              <button type="button" role="switch" class="st-switch" style="margin-top:1.3rem" [attr.aria-checked]="r.isPublished"
                      [attr.aria-label]="r.isPublished ? t.coverage.unhighlight(pick(r)) : t.coverage.highlight(pick(r))"
                      (click)="toggle(r)"></button>
              <app-loc-pair style="flex:1;min-width:0" [value]="r.name" [label]="t.coverage.nameOf(pick(r))"
                            [testid]="'cov-' + r.key"
                            (valueChange)="draft(r, $event)" (committed)="rename(r, $event)" />
              <code class="st-help st-only-desktop" style="margin-top:1.3rem">{{ r.key }}</code>
            </li>
          }
        </ul>
      }
    }
  `,
})
export class CoverageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(StudioApi);
  private readonly toast = inject(StudioToast);
  protected readonly t = T;

  private readonly kind = toSignal(
    this.route.data.pipe(map((d) => (d['collection'] as Kind) ?? 'export-countries')),
    { initialValue: 'export-countries' as Kind },
  );
  readonly meta = computed(() => KINDS[this.kind()]);

  readonly query = signal('');
  readonly filter = signal<Filter>('all');

  readonly items = resource({
    params: () => this.kind(),
    loader: ({ params }) => this.api.list<GeoItem>(params),
  });

  readonly rows = linkedSignal<GeoItem[]>(() =>
    [...(this.items.hasValue() ? this.items.value() : [])].sort(
      (a, b) => pickLoc(a.name).localeCompare(pickLoc(b.name), 'uk'),
    ),
  );

  readonly activeItems = computed(() => this.rows().filter((r) => r.isPublished));
  readonly anyMissing = computed(() => this.rows().some((r) => r.isPublished && isMissingEn(r.name)));
  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const f = this.filter();
    return this.rows().filter(
      (r) =>
        (f === 'all' || (f === 'active') === r.isPublished) &&
        (!q || `${r.name.uk} ${r.name.en} ${r.key}`.toLowerCase().includes(q)),
    );
  });

  protected pick(r: GeoItem): string { return pickLoc(r.name, 'uk') || r.key; }
  protected label(r: GeoItem): string { return pickLoc(r.name, 'uk') || r.key; }

  private replace(id: string, fn: (r: GeoItem) => GeoItem): void {
    this.rows.update((rs) => rs.map((r) => (r.id === id ? fn(r) : r)));
  }

  private readonly baseline = new Map<string, LocalizedText>();

  /** Keeps the typed text in the row so the preview/hint follow; persisted on commit (blur / Enter). */
  draft(r: GeoItem, name: LocalizedText): void {
    if (!this.baseline.has(r.id)) this.baseline.set(r.id, r.name);
    this.rows.update((rs) => rs.map((x) => (x.id === r.id ? { ...x, name } : x)));
  }

  async toggle(r: GeoItem): Promise<void> {
    const next = !r.isPublished;
    this.replace(r.id, (x) => ({ ...x, isPublished: next }));
    try {
      await this.api.setPublished(this.kind(), r.id, next);
    } catch {
      this.replace(r.id, (x) => ({ ...x, isPublished: !next }));
      this.toast.error(T.coverage.toggleFailed);
    }
  }

  async rename(r: GeoItem, name: LocalizedText): Promise<void> {
    const saved = this.baseline.get(r.id);
    if (saved && saved.uk === name.uk && saved.en === name.en) return;
    try {
      const current = this.rows().find((x) => x.id === r.id) ?? r;
      await this.api.update(this.kind(), r.id, { key: r.key, name, isPublished: current.isPublished });
      this.baseline.set(r.id, name);
      if (!name.en.trim()) this.toast.warn(T.coverage.enMissingToast);
      else this.toast.success(T.coverage.nameSaved);
    } catch {
      if (saved) this.replace(r.id, (x) => ({ ...x, name: saved }));
      this.toast.error(T.coverage.renameFailed);
    }
  }
}
