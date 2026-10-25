import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';

/** Image carousel reusing the `.gallery-slider` styles (project detail look). */
@Component({
  selector: 'app-gallery-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (images().length) {
      <div class="gallery-slider" data-testid="gallery-slider">
        <div
          class="gallery-slider__viewport"
          tabindex="0"
          role="group"
          aria-roledescription="carousel"
          [attr.aria-label]="alt() || null"
          (keydown)="onKey($event)"
          (pointerdown)="onPointerDown($event)"
          (pointerup)="onPointerUp($event)"
          (pointercancel)="startX = null"
        >
          @for (src of images(); track $index) {
            <img
              [src]="src"
              [alt]="alt()"
              decoding="async"
              [attr.loading]="$index === 0 ? null : 'lazy'"
              draggable="false"
              class="gallery-slider__slide w-full h-full object-cover"
              [class.gallery-slider__slide--active]="active() === $index"
              [class.gallery-slider__slide--before]="$index < active()"
              [class.gallery-slider__slide--after]="$index > active()"
              [attr.aria-hidden]="active() === $index ? null : 'true'"
            />
          }

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
            <div class="gallery-slider__track" [style.--active]="active()">
            <span class="gallery-slider__indicator" aria-hidden="true"></span>
            @for (img of images(); track $index) {
              <button
                type="button"
                class="gallery-slider__dot"
                [class.gallery-slider__dot--active]="active() === $index"
                (click)="active.set($index)"
                [attr.aria-label]="'Go to image ' + ($index + 1)"
                [attr.aria-current]="active() === $index ? 'true' : null"
              ></button>
            }
            </div>
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

  protected startX: number | null = null;

  protected onKey(e: KeyboardEvent): void {
    if (this.total() < 2) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); this.prev(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); this.next(); }
  }

  protected onPointerDown(e: PointerEvent): void {
    this.startX = e.pointerType === 'mouse' ? null : e.clientX;
  }

  protected onPointerUp(e: PointerEvent): void {
    if (this.startX === null) return;
    const dx = e.clientX - this.startX;
    this.startX = null;
    if (Math.abs(dx) > 40) dx < 0 ? this.next() : this.prev();
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
