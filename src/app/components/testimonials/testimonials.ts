import { Component, ElementRef, Injector, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { LangService } from '../../services/lang.service';
import { ContentStore } from '../../core/content/content.store';
import { PublicTestimonial } from '../../core/content/content.types';
import { GallerySliderComponent } from '../../shared/gallery-slider';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-testimonials',
  imports: [RevealDirective, GallerySliderComponent],
  templateUrl: './testimonials.html',
})
export class TestimonialsComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);

  readonly selected = signal<PublicTestimonial | null>(null);
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('detailsDialog');
  private readonly injector = inject(Injector);
  private opener: HTMLElement | null = null;

  hasDetails(item: PublicTestimonial): boolean {
    return (item.detail?.length ?? 0) > 0 || (item.gallery?.length ?? 0) > 0;
  }

  open(item: PublicTestimonial, event: Event): void {
    this.opener = event.currentTarget as HTMLElement;
    this.selected.set(item);
    // The <dialog> is rendered by @if during the next change detection pass.
    afterNextRender(
      () => {
        const el = this.dialog()?.nativeElement;
        if (el && !el.open) el.showModal();
      },
      { injector: this.injector },
    );
  }

  /** True while the exit transition plays; drives `.is-closing` on the dialog. */
  readonly closing = signal(false);
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  /** Close button, backdrop click and Esc (`cancel`): plays the exit animation first. */
  closeDialog(): void {
    const el = this.dialog()?.nativeElement;
    if (!el?.open) return this.finalize();
    if (this.closing()) return;

    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return this.finishClose();

    this.closing.set(true);
    const done = (e?: Event) => {
      if (e && (e.target !== el || e.type === 'transitionend' && (e as TransitionEvent).propertyName !== 'opacity')) return;
      el.removeEventListener('transitionend', done);
      this.finishClose();
    };
    el.addEventListener('transitionend', done);
    this.closeTimer = setTimeout(done, 400); // fallback if no transition fires
  }

  /** Esc: keep the dialog open and animate out instead of closing instantly. */
  onCancel(event: Event): void {
    event.preventDefault();
    this.closeDialog();
  }

  private finishClose(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.closeTimer = null;
    const el = this.dialog()?.nativeElement;
    if (el?.open) el.close(); // fires `close` -> finalize()
    this.finalize();
  }

  /** Native `close` event / end of exit: drop the dialog and restore focus. Idempotent. */
  finalize(): void {
    this.closing.set(false);
    this.selected.set(null);
    this.opener?.focus();
    this.opener = null;
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog()?.nativeElement) this.closeDialog();
  }
}
