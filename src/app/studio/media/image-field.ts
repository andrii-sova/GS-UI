import { ChangeDetectionStrategy, Component, inject, input, model, signal } from '@angular/core';
import { StudioApi } from '../studio-api';
import { T } from '../studio-i18n';

let nextId = 0;

/**
 * Image picker: preview, upload/replace via the API, optional pasted URL. Two-way binds the URL.
 */
@Component({
  selector: 'app-image-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="display:flex;gap:.9rem;align-items:flex-start;flex-wrap:wrap">
      <div class="st-imgbox" [class.contain]="contain()">
        @if (value()) {
          <img [src]="value()" [alt]="t.image.preview(label() || t.image.imageFallback)" />
        } @else {
          <span>{{ t.image.none }}</span>
        }
      </div>

      <div style="flex:1;min-width:200px">
        <div style="display:flex;flex-wrap:wrap;gap:.5rem;align-items:center">
          <label class="st-btn st-btn-sm" style="cursor:pointer">
            {{ uploading() ? t.image.uploading : value() ? t.image.replace : t.image.upload }}
            <input type="file" accept="image/*" class="st-visually-hidden" (change)="pick($event)"
                   [disabled]="uploading()" [attr.aria-label]="(value() ? t.image.replaceAria(label() || t.image.imageFallback) : t.image.uploadAria(label() || t.image.imageFallback))" />
          </label>
          @if (value()) {
            <button type="button" class="st-btn st-btn-sm st-btn-ghost" (click)="value.set(null)">{{ t.image.remove }}</button>
          }
        </div>
        <details style="margin-top:.5rem">
          <summary class="st-help" style="cursor:pointer">{{ t.image.useUrl }}</summary>
          <label [for]="inputId" class="st-visually-hidden">{{ t.image.urlLabel(label() || t.image.imageFallback) }}</label>
          <input [id]="inputId" class="st-input" type="url" inputmode="url" autocomplete="off" spellcheck="false"
                 placeholder="https://…/image.jpg" style="margin-top:.35rem"
                 [value]="value() ?? ''" (input)="value.set($any($event.target).value || null)" />
        </details>
        @if (error()) {
          <p class="st-help" style="color:var(--coral)" role="alert">{{ error() }}</p>
        }
      </div>
    </div>
  `,
})
export class ImageFieldComponent {
  private readonly api = inject(StudioApi);
  protected readonly t = T;

  readonly value = model<string | null>(null);
  readonly label = input('');
  readonly contain = input(false);

  readonly uploading = signal(false);
  readonly error = signal<string | null>(null);

  protected readonly inputId = `image-field-${nextId++}`;

  async pick(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.error.set(null);
    this.uploading.set(true);
    try {
      const result = await this.api.uploadImage(file);
      this.value.set(result.url);
    } catch {
      this.error.set(T.image.uploadFailed);
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }
}
