import { Component, inject, input, model, signal } from '@angular/core';
import { StudioApi } from '../studio-api';

/**
 * Image picker: shows a preview, uploads a chosen file to blob storage via the API, and
 * two-way-binds the resulting URL. Also accepts a pasted URL.
 */
@Component({
  selector: 'app-image-field',
  template: `
    <div class="flex items-start gap-3">
      <div class="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
        @if (value()) {
          <img [src]="value()" alt="" class="h-full w-full object-cover" />
        } @else {
          <div class="flex h-full items-center justify-center text-xs text-neutral-400">none</div>
        }
      </div>

      <div class="flex-1 space-y-2">
        <input
          type="text" placeholder="Image URL"
          [value]="value() ?? ''" (input)="value.set($any($event.target).value || null)"
          class="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
        />
        <div class="flex items-center gap-2">
          <label class="cursor-pointer rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100">
            {{ uploading() ? 'Uploading…' : 'Upload…' }}
            <input type="file" accept="image/*" class="hidden" (change)="pick($event)" [disabled]="uploading()" />
          </label>
          @if (value()) {
            <button type="button" (click)="value.set(null)" class="text-xs text-neutral-500 hover:text-red-600">
              Clear
            </button>
          }
        </div>
        @if (error()) {
          <p class="text-xs text-red-600">{{ error() }}</p>
        }
      </div>
    </div>
  `,
})
export class ImageFieldComponent {
  private readonly api = inject(StudioApi);

  readonly value = model<string | null>(null);
  readonly label = input('');

  readonly uploading = signal(false);
  readonly error = signal<string | null>(null);

  async pick(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.error.set(null);
    this.uploading.set(true);
    try {
      const result = await this.api.uploadImage(file);
      this.value.set(result.url);
    } catch {
      this.error.set('Upload failed. Check the file type and size (max 10 MB).');
    } finally {
      this.uploading.set(false);
      (event.target as HTMLInputElement).value = '';
    }
  }
}
