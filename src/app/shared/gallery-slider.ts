import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';

/** Image carousel reusing the `.gallery-slider` styles (project detail look). */
@Component({
  selector: 'app-gallery-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (images().length) {
      <div class="gallery-slider" data-testid="gallery-slider">
        <div class="gallery-slider__viewport">
          <img [src]="images()[active()]" [alt]="alt()" decoding="async" class="w-full h-full object-cover" />

          @if (images().length > 1) {
            <button type="button" class="gallery-slider__nav gallery-slider__nav--prev" (click)="prev()" aria-label="Previous image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button type="button" class="gallery-slider__nav gallery-slider__nav--next" (click)="next()" aria-label="Next image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          }
        </div>

        @if (images().length > 1) {
          <div class="gallery-slider__dots">
            @for (img of images(); track $index) {
              <button
                type="button"
                class="gallery-slider__dot"
                [class.gallery-slider__dot--active]="active() === $index"
                (click)="active.set($index)"
                [attr.aria-label]="'Go to image ' + ($index + 1)"
              ></button>
            }
          </div>
        }
      </div>
    }
  `,
})
export class GallerySliderComponent {
  readonly images = input<string[]>([]);
  readonly alt = input('');

  protected readonly active = signal(0);
  private readonly total = computed(() => this.images().length);

  constructor() {
    effect(() => {
      this.images();
      this.active.set(0);
    });
  }

  prev(): void {
    const n = this.total();
    if (n > 0) this.active.update((i) => (i - 1 + n) % n);
  }

  next(): void {
    const n = this.total();
    if (n > 0) this.active.update((i) => (i + 1) % n);
  }
}
