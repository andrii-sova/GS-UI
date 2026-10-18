import { ChangeDetectionStrategy, Component, inject, input, model, signal } from '@angular/core';
import { StudioApi } from '../studio-api';
import { T } from '../studio-i18n';
import { moveItem } from '../shared/localized';

/**
 * Multi-image gallery: multi-upload (batch endpoint with per-file fallback), drag & drop files,
 * thumbnails, reorder, remove, and "set as main image" when a main image URL is bound.
 */
@Component({
  selector: 'app-gallery-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="st-drop" [class.over]="over()"
         (dragover)="$event.preventDefault(); over.set(true)" (dragleave)="over.set(false)"
         (drop)="onDrop($event)">
      <label class="st-btn st-btn-sm" style="cursor:pointer">
        {{ uploading() ? t.gallery.uploading : t.gallery.addImages }}
        <input type="file" accept="image/*" multiple class="st-visually-hidden" [disabled]="uploading()"
               [attr.aria-label]="t.gallery.uploadAria(label() || t.gallery.galleryFallback)" (change)="pick($event)" />
      </label>
      <span style="margin-left:.5rem">{{ t.gallery.orDrop }}</span>
    </div>

    @if (error()) {
      <p class="st-help" style="color:var(--coral)" role="alert">{{ error() }}</p>
    }

    @if (urls().length) {
      <ul class="st-gal" style="margin-top:.75rem" [attr.aria-label]="t.gallery.imagesAria(label() || t.gallery.galleryFallback)">
        @for (url of urls(); track url + $index; let i = $index) {
          <li class="st-gal-item">
            <img [src]="url" [alt]="t.gallery.imageAlt(label() || t.gallery.galleryFallback, i + 1)" loading="lazy" />
            <div class="st-gal-actions">
              <button type="button" class="st-icon-btn" [disabled]="i === 0" (click)="move(i, -1)"
                      [attr.aria-label]="t.gallery.earlier(i + 1)">←</button>
              <button type="button" class="st-icon-btn" [disabled]="i === urls().length - 1" (click)="move(i, 1)"
                      [attr.aria-label]="t.gallery.later(i + 1)">→</button>
              @if (hasMain()) {
                <button type="button" class="st-icon-btn" [title]="t.gallery.setMain" (click)="makeMain(i)"
                        [attr.aria-label]="t.gallery.setMainAria(i + 1)">★</button>
              }
              <button type="button" class="st-icon-btn danger" (click)="remove(i)"
                      [attr.aria-label]="t.gallery.removeImage(i + 1)">✕</button>
            </div>
          </li>
        }
      </ul>
    } @else {
      <p class="st-help" style="margin-top:.5rem">{{ t.gallery.empty }}</p>
    }
  `,
})
export class GalleryFieldComponent {
  private readonly api = inject(StudioApi);
  protected readonly t = T;

  readonly urls = model<string[]>([]);
  /** Bound main image URL; when `hasMain` the "set as main" action swaps it with a gallery image. */
  readonly main = model<string | null>(null);
  readonly hasMain = input(false);
  readonly label = input('');

  readonly uploading = signal(false);
  readonly over = signal(false);
  readonly error = signal<string | null>(null);

  async pick(event: Event): Promise<void> {
    const el = event.target as HTMLInputElement;
    const files = Array.from(el.files ?? []);
    await this.upload(files);
    el.value = '';
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    this.over.set(false);
    const files = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'));
    await this.upload(files);
  }

  private async upload(files: File[]): Promise<void> {
    if (!files.length) return;
    this.error.set(null);
    this.uploading.set(true);
    try {
      const results = await this.api.uploadImages(files);
      this.urls.update((u) => [...u, ...results.map((r) => r.url)]);
    } catch {
      this.error.set(T.gallery.uploadFailed);
    } finally {
      this.uploading.set(false);
    }
  }

  move(index: number, dir: -1 | 1): void {
    this.urls.update((u) => moveItem(u, index, index + dir));
  }

  remove(index: number): void {
    this.urls.update((u) => u.filter((_, i) => i !== index));
  }

  makeMain(index: number): void {
    const chosen = this.urls()[index];
    const previous = this.main();
    this.urls.update((u) => {
      const next = u.filter((_, i) => i !== index);
      if (previous && previous !== chosen) next.unshift(previous);
      return next;
    });
    this.main.set(chosen);
  }
}
