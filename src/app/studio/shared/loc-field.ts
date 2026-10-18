import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { T } from '../studio-i18n';
import { LocalizedText, blankLoc, isMissingEn, moveItem } from './localized';

let nextUid = 0;

/**
 * Always-visible bilingual input: Ukrainian and English side by side (stacked in narrow containers),
 * each with a clear badge. A missing English text only shows a hint — it never blocks saving.
 */
@Component({
  selector: 'app-loc-pair',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="st-loc">
      <div class="st-loc-col">
        <label class="st-loc-badge" [for]="uid + '-uk'">
          <b class="st-lang-tag uk" aria-hidden="true">{{ t.lang.ukBadge }}</b>{{ t.lang.uk }}
        </label>
        @if (multiline()) {
          <textarea [id]="uid + '-uk'" class="st-textarea" [attr.rows]="rows()" lang="uk"
                    [value]="value().uk" (input)="setUk($event)" [attr.aria-label]="aria('uk')"
                    [attr.data-testid]="testid() ? testid() + '-uk' : null"></textarea>
        } @else {
          <input [id]="uid + '-uk'" class="st-input" lang="uk" autocomplete="off"
                 [value]="value().uk" (input)="setUk($event)" [attr.aria-label]="aria('uk')"
                 (change)="committed.emit(value())"
                 [attr.data-testid]="testid() ? testid() + '-uk' : null" />
        }
      </div>
      <div class="st-loc-col">
        <label class="st-loc-badge" [for]="uid + '-en'">
          <b class="st-lang-tag en" aria-hidden="true">{{ t.lang.enBadge }}</b>{{ t.lang.en }}
        </label>
        @if (multiline()) {
          <textarea [id]="uid + '-en'" class="st-textarea" [attr.rows]="rows()" lang="en"
                    [value]="value().en" (input)="setEn($event)" [attr.aria-label]="aria('en')"
                    [attr.aria-describedby]="missing() ? uid + '-hint' : null"
                    [attr.data-testid]="testid() ? testid() + '-en' : null"></textarea>
        } @else {
          <input [id]="uid + '-en'" class="st-input" lang="en" autocomplete="off"
                 [value]="value().en" (input)="setEn($event)" [attr.aria-label]="aria('en')"
                 [attr.aria-describedby]="missing() ? uid + '-hint' : null"
                 (change)="committed.emit(value())"
                 [attr.data-testid]="testid() ? testid() + '-en' : null" />
        }
        @if (missing()) {
          <p class="st-loc-hint" [id]="uid + '-hint'" data-testid="en-missing-hint">{{ t.lang.missingHint }}</p>
        }
      </div>
    </div>
  `,
})
export class LocPairComponent {
  protected readonly t = T;
  protected readonly uid = `loc-${nextUid++}`;

  readonly value = model<LocalizedText>(blankLoc());
  readonly label = input('');
  readonly multiline = input(false);
  readonly rows = input(3);
  readonly testid = input('');
  /** Emits on the native `change` event of a single-line input (blur / Enter), for save-on-commit UIs. */
  readonly committed = output<LocalizedText>();

  protected readonly missing = computed(() => isMissingEn(this.value()));

  protected aria(lang: 'uk' | 'en'): string {
    const l = lang === 'uk' ? T.lang.uk : T.lang.en;
    return this.label() ? `${this.label()} — ${l}` : l;
  }

  protected setUk(e: Event): void {
    this.value.set({ ...this.value(), uk: (e.target as HTMLInputElement).value });
  }
  protected setEn(e: Event): void {
    this.value.set({ ...this.value(), en: (e.target as HTMLInputElement).value });
  }
}

/** List of bilingual rows (details, advantages, paragraphs…): each row = UA | EN + reorder/remove. */
@Component({
  selector: 'app-loc-list',
  imports: [LocPairComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (item of items(); track $index; let i = $index) {
      <div class="st-loc-row" [attr.data-testid]="testid() ? testid() + '-row' : null">
        <app-loc-pair class="st-loc-row-main" [value]="item" (valueChange)="setItem(i, $event)"
                      [multiline]="multiline()" [rows]="3" [label]="t.form.rowLabel(label(), i + 1)"
                      [testid]="testid() ? testid() + '-' + i : ''" />
        <div class="st-loc-row-ctrl">
          <button type="button" class="st-icon-btn" [disabled]="i === 0" (click)="move(i, -1)"
                  [attr.aria-label]="t.form.moveRowUp(label(), i + 1)">▲</button>
          <button type="button" class="st-icon-btn" [disabled]="i === items().length - 1" (click)="move(i, 1)"
                  [attr.aria-label]="t.form.moveRowDown(label(), i + 1)">▼</button>
          <button type="button" class="st-icon-btn danger" (click)="remove(i)"
                  [attr.aria-label]="t.form.removeRow(label(), i + 1)">✕</button>
        </div>
      </div>
    } @empty {
      <p class="st-help">{{ t.form.emptyList }}</p>
    }
    <button type="button" class="st-btn st-btn-sm" style="margin-top:.6rem" (click)="add()"
            [attr.data-testid]="testid() ? testid() + '-add' : null">{{ addLabel() || t.form.addRow }}</button>
  `,
})
export class LocListComponent {
  protected readonly t = T;
  readonly items = model<LocalizedText[]>([]);
  readonly label = input('');
  readonly multiline = input(false);
  readonly testid = input('');
  readonly addLabel = input('');

  setItem(i: number, v: LocalizedText): void { this.items.update((l) => l.map((x, k) => (k === i ? v : x))); }
  add(): void { this.items.update((l) => [...l, blankLoc()]); }
  remove(i: number): void { this.items.update((l) => l.filter((_, k) => k !== i)); }
  move(i: number, dir: -1 | 1): void { this.items.update((l) => moveItem(l, i, i + dir)); }
}
