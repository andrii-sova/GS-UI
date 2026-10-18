import { ChangeDetectionStrategy, Component, HostListener, computed, inject, resource, signal } from '@angular/core';
import { StudioApi, ContentItem } from '../studio-api';
import { T } from '../studio-i18n';
import { LocPairComponent } from '../shared/loc-field';
import { StudioToast } from '../shared/toast';
import { StudioConfirm } from '../shared/confirm';
import { LocalizedText, blankLoc, isMissingEn, moveItem } from '../shared/localized';
import { HasUnsavedChanges } from '../collection/unsaved-changes.guard';

type Group = 'hero' | 'about' | 'team' | 'metrics';

interface StatDto extends ContentItem {
  group: Group;
  value: string;
  label: LocalizedText;
}

interface Item {
  uid: number;
  id?: string;
  value: string;
  label: LocalizedText;
  isPublished: boolean;
}

type Data = Record<Group, Item[]>;

export const STAT_GROUPS: Array<{ key: Group; title: string; help: string }> = [
  { key: 'hero', ...T.numbers.groups.hero },
  { key: 'about', ...T.numbers.groups.about },
  { key: 'team', ...T.numbers.groups.team },
  { key: 'metrics', ...T.numbers.groups.metrics },
];

const emptyData = (): Data => ({ hero: [], about: [], team: [], metrics: [] });
const snapshot = (d: Data): string =>
  JSON.stringify(STAT_GROUPS.map((g) => d[g.key].map((i) => [i.id ?? null, i.value, i.label, i.isPublished])));

/** Site statistics editor (`site-stats`), grouped by where they appear on the site. */
@Component({
  selector: 'app-numbers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LocPairComponent],
  template: `
    <div class="st-page-head">
      <div>
        <h1 class="st-h1">{{ t.numbers.title }}</h1>
        <p class="st-help">{{ t.numbers.help }}</p>
      </div>
    </div>

    @if (stats.isLoading() && !stats.hasValue()) {
      <div class="st-list" aria-busy="true"><div class="st-skeleton"></div><div class="st-skeleton"></div><span class="st-visually-hidden">{{ t.common.loading }}</span></div>
    } @else if (stats.error()) {
      <div class="st-card st-state error" role="alert">
        {{ t.numbers.loadError }}
        <button type="button" class="st-btn st-btn-sm" (click)="stats.reload()">{{ t.common.retry }}</button>
      </div>
    } @else {
      <div class="st-stack">
        @for (g of groups; track g.key) {
          <div class="st-card" [attr.aria-labelledby]="'grp-' + g.key">
            <h2 class="st-label" [id]="'grp-' + g.key" style="font-size:1rem">{{ g.title }}</h2>
            <p class="st-help">{{ g.help }}</p>

            <ul style="list-style:none;margin:.6rem 0 0;padding:0">
              @for (it of data()[g.key]; track it.uid; let i = $index) {
                <li style="display:flex;flex-wrap:wrap;gap:.6rem;align-items:flex-start;margin-top:.75rem;padding-bottom:.75rem;border-bottom:1px dashed var(--border)"
                    [style.opacity]="it.isPublished ? 1 : 0.6">
                  <div style="width:130px;flex:none">
                    <label class="st-loc-badge" [for]="'num-v-' + it.uid">{{ t.numbers.value }}</label>
                    <input [id]="'num-v-' + it.uid" class="st-input" style="margin-top:.3rem" [value]="it.value"
                           [attr.aria-label]="t.numbers.valueAria(g.title, i + 1)"
                           [attr.data-testid]="'num-' + g.key + '-' + i + '-value'"
                           (input)="patch(g.key, it.uid, { value: $any($event.target).value })" />
                  </div>
                  <app-loc-pair style="flex:1;min-width:260px" [value]="it.label"
                                (valueChange)="patch(g.key, it.uid, { label: $event })"
                                [label]="t.numbers.labelAria(g.title, i + 1)"
                                [testid]="'num-' + g.key + '-' + i + '-label'" />
                  <div style="display:flex;align-items:center;gap:2px;padding-top:1.3rem">
                    <button type="button" role="switch" class="st-switch" [attr.aria-checked]="it.isPublished"
                            [attr.aria-label]="t.numbers.toggleAria(it.isPublished, g.title, i + 1)"
                            (click)="patch(g.key, it.uid, { isPublished: !it.isPublished })"></button>
                    <button type="button" class="st-icon-btn" [disabled]="i === 0" (click)="move(g.key, i, -1)"
                            [attr.aria-label]="t.numbers.moveUp(g.title, i + 1)">▲</button>
                    <button type="button" class="st-icon-btn" [disabled]="i === data()[g.key].length - 1" (click)="move(g.key, i, 1)"
                            [attr.aria-label]="t.numbers.moveDown(g.title, i + 1)">▼</button>
                    <button type="button" class="st-icon-btn danger" (click)="remove(g.key, it.uid)"
                            [attr.aria-label]="t.numbers.removeAria(g.title, i + 1)">✕</button>
                  </div>
                </li>
              } @empty {
                <li class="st-help" style="margin-top:.5rem">{{ t.numbers.emptyGroup }}</li>
              }
            </ul>
            <button type="button" class="st-btn st-btn-sm" style="margin-top:.75rem" (click)="add(g.key)" [attr.data-testid]="'num-add-' + g.key">{{ t.numbers.add }}</button>
          </div>
        }

        @if (error()) { <p class="st-alert error" role="alert">{{ error() }}</p> }
        @if (anyMissing()) {
          <p class="st-alert warn" role="status">{{ t.numbers.missingWarn }}</p>
        }

        <div class="st-formbar">
          <button type="button" class="st-btn st-btn-primary" [disabled]="saving() || !dirty()" (click)="save()">
            {{ saving() ? t.common.saving : t.numbers.save }}
          </button>
          <button type="button" class="st-btn" [disabled]="saving() || !dirty()" (click)="discard()">{{ t.common.discardChanges }}</button>
          @if (dirty()) { <span class="st-chip warn" role="status">{{ t.common.unsavedChanges }}</span> }
        </div>
      </div>
    }
  `,
})
export class NumbersComponent implements HasUnsavedChanges {
  private readonly api = inject(StudioApi);
  private readonly toast = inject(StudioToast);
  private readonly confirm = inject(StudioConfirm);
  protected readonly t = T;

  protected readonly groups = STAT_GROUPS;

  private nextUid = 1;
  readonly data = signal<Data>(emptyData());
  private readonly baseline = signal('');
  private original: StatDto[] = [];

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly stats = resource({
    loader: async () => {
      const list = await this.api.list<StatDto>('site-stats');
      this.apply(list);
      return list;
    },
  });

  readonly dirty = computed(() => this.baseline() !== '' && snapshot(this.data()) !== this.baseline());
  readonly anyMissing = computed(() =>
    STAT_GROUPS.some((g) => this.data()[g.key].some((i) => isMissingEn(i.label))),
  );

  private apply(list: StatDto[]): void {
    this.original = list;
    const data = emptyData();
    for (const s of [...list].sort((a, b) => a.sortOrder - b.sortOrder)) {
      data[s.group]?.push({
        uid: this.nextUid++, id: s.id, value: s.value,
        label: { uk: s.label?.uk ?? '', en: s.label?.en ?? '' }, isPublished: s.isPublished,
      });
    }
    this.data.set(data);
    this.baseline.set(snapshot(data));
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.dirty()) event.preventDefault();
  }

  canLeave(): boolean | Promise<boolean> {
    if (!this.dirty()) return true;
    return this.confirm.ask({
      title: T.form.discardTitle,
      message: T.numbers.discardMessage,
      confirmLabel: T.form.discardConfirm, cancelLabel: T.common.keepEditing, danger: true,
    });
  }

  private update(group: Group, fn: (items: Item[]) => Item[]): void {
    this.data.update((d) => ({ ...d, [group]: fn(d[group]) }));
  }

  patch(group: Group, uid: number, change: Partial<Item>): void {
    this.update(group, (items) => items.map((i) => (i.uid === uid ? { ...i, ...change } : i)));
  }

  add(group: Group): void {
    this.update(group, (items) => [...items, { uid: this.nextUid++, value: '', label: blankLoc(), isPublished: true }]);
  }

  remove(group: Group, uid: number): void {
    this.update(group, (items) => items.filter((i) => i.uid !== uid));
  }

  move(group: Group, index: number, dir: -1 | 1): void {
    this.update(group, (items) => moveItem(items, index, index + dir));
  }

  discard(): void {
    this.apply(this.original);
  }

  async save(): Promise<void> {
    if (this.saving()) return;
    this.error.set(null);
    this.saving.set(true);
    try {
      const data = this.data();
      const all = STAT_GROUPS.flatMap((g) => data[g.key].map((item) => ({ g: g.key, item })));
      const keep = new Set(all.map((x) => x.item.id).filter(Boolean));
      const byId = new Map(this.original.map((o) => [o.id, o]));

      for (const o of this.original) if (!keep.has(o.id)) await this.api.remove('site-stats', o.id);

      const orderedIds: string[] = [];
      for (const { g, item } of all) {
        const body = { group: g, value: item.value.trim(), label: item.label, isPublished: item.isPublished };
        if (!item.id) {
          const created = await this.api.create<StatDto>('site-stats', body);
          orderedIds.push(created.id);
          continue;
        }
        const o = byId.get(item.id)!;
        const changed =
          o.group !== g || o.value !== body.value || o.isPublished !== body.isPublished ||
          o.label?.uk !== body.label.uk || o.label?.en !== body.label.en;
        if (changed) await this.api.update('site-stats', item.id, body);
        orderedIds.push(item.id);
      }
      if (orderedIds.length) await this.api.reorder('site-stats', orderedIds);

      const missing = this.anyMissing();
      await this.stats.reload();
      if (missing) this.toast.warn(T.numbers.savedWarn);
      else this.toast.success(T.numbers.saved);
    } catch {
      this.error.set(T.numbers.saveError);
      this.toast.error(T.numbers.saveFailedToast);
    } finally {
      this.saving.set(false);
    }
  }
}
