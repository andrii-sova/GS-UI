import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { T } from '../studio-i18n';
import { LocListComponent, LocPairComponent } from '../shared/loc-field';
import { LocalizedText, blankLoc, moveItem } from '../shared/localized';

export interface LegalSection {
  heading: LocalizedText;
  text: LocalizedText;
  items: LocalizedText[];
  textAfter: LocalizedText;
}

export const blankSection = (): LegalSection => ({
  heading: blankLoc(), text: blankLoc(), items: [], textAfter: blankLoc(),
});

type LocKey = 'heading' | 'text' | 'textAfter';

/** Legal-page sections editor: heading, text, bullet items, trailing text — both languages side by side. */
@Component({
  selector: 'app-sections-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LocPairComponent, LocListComponent],
  template: `
    <div class="st-stack">
      @for (s of sections(); track $index; let i = $index) {
        <fieldset class="st-card" style="margin:0;background:var(--surface-alt)" [attr.data-testid]="'section-' + i">
          <legend class="st-label" style="padding:0 .35rem">{{ t.form.section(i + 1) }}</legend>

          <div style="display:flex;justify-content:flex-end;gap:2px;margin-top:-1.6rem;margin-bottom:.5rem">
            <button type="button" class="st-icon-btn" [disabled]="i === 0" (click)="move(i, -1)"
                    [attr.aria-label]="t.form.moveSectionUp(i + 1)">▲</button>
            <button type="button" class="st-icon-btn" [disabled]="i === sections().length - 1" (click)="move(i, 1)"
                    [attr.aria-label]="t.form.moveSectionDown(i + 1)">▼</button>
            <button type="button" class="st-icon-btn danger" (click)="remove(i)"
                    [attr.aria-label]="t.form.removeSection(i + 1)">✕</button>
          </div>

          <span class="st-label" style="margin-bottom:.3rem">{{ t.form.heading }}</span>
          <app-loc-pair [value]="s.heading" (valueChange)="setLoc(i, 'heading', $event)"
                        [label]="t.form.section(i + 1) + ': ' + t.form.heading"
                        [testid]="'section-' + i + '-heading'" />

          <span class="st-label" style="margin:.85rem 0 .3rem">{{ t.form.text }}</span>
          <app-loc-pair [value]="s.text" (valueChange)="setLoc(i, 'text', $event)" [multiline]="true" [rows]="4"
                        [label]="t.form.section(i + 1) + ': ' + t.form.text"
                        [testid]="'section-' + i + '-text'" />

          <span class="st-label" style="margin:.85rem 0 .1rem">{{ t.form.bullets }}</span>
          <app-loc-list [items]="s.items" (itemsChange)="setItems(i, $event)"
                        [label]="t.form.section(i + 1) + ': ' + t.form.bullets"
                        [addLabel]="t.form.addBullet" [testid]="'section-' + i + '-item'" />

          <span class="st-label" style="margin:.85rem 0 .3rem">{{ t.form.trailingText }}</span>
          <app-loc-pair [value]="s.textAfter" (valueChange)="setLoc(i, 'textAfter', $event)" [multiline]="true" [rows]="3"
                        [label]="t.form.section(i + 1) + ': ' + t.form.trailingText"
                        [testid]="'section-' + i + '-after'" />
        </fieldset>
      } @empty {
        <p class="st-help">{{ t.form.noSections }}</p>
      }
      <button type="button" class="st-btn" (click)="add()" data-testid="section-add">{{ t.form.addSection }}</button>
    </div>
  `,
})
export class SectionsFieldComponent {
  protected readonly t = T;
  readonly sections = model<LegalSection[]>([]);

  add(): void { this.sections.update((s) => [...s, blankSection()]); }
  remove(i: number): void { this.sections.update((s) => s.filter((_, k) => k !== i)); }
  move(i: number, dir: -1 | 1): void { this.sections.update((s) => moveItem(s, i, i + dir)); }

  setLoc(i: number, key: LocKey, value: LocalizedText): void {
    this.sections.update((all) => all.map((s, k) => (k === i ? { ...s, [key]: value } : s)));
  }

  setItems(i: number, items: LocalizedText[]): void {
    this.sections.update((all) => all.map((s, k) => (k === i ? { ...s, items } : s)));
  }
}
