import { Component, ElementRef, Injector, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { LangService } from '../../services/lang.service';
import { ContentStore } from '../../core/content/content.store';
import { PublicTestimonial } from '../../core/content/content.types';
import { GallerySliderComponent } from '../../shared/gallery-slider';

@Component({
  selector: 'app-testimonials',
  imports: [GallerySliderComponent],
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

  /** Called for both the close button and the native `close` event (Esc / backdrop). */
  closeDialog(): void {
    const el = this.dialog()?.nativeElement;
    if (el?.open) el.close();
    this.selected.set(null);
    this.opener?.focus();
    this.opener = null;
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog()?.nativeElement) this.closeDialog();
  }
}
