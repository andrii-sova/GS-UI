import { Directive, ElementRef, Injectable, afterNextRender, inject, input } from '@angular/core';

/** One shared IntersectionObserver for every revealed element on the page. */
@Injectable({ providedIn: 'root' })
export class RevealObserver {
  private callbacks = new Map<Element, () => void>();
  private io: IntersectionObserver | null = null;

  observe(el: Element, onVisible: () => void): void {
    if (typeof IntersectionObserver === 'undefined') return onVisible();
    this.io ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          this.io!.unobserve(entry.target);
          this.callbacks.get(entry.target)?.();
          this.callbacks.delete(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    this.callbacks.set(el, onVisible);
    this.io.observe(el);
  }

  unobserve(el: Element): void {
    this.callbacks.delete(el);
    this.io?.unobserve(el);
  }
}

/**
 * Fades an element in (up / fade / scale / left / right) the first time it scrolls into view.
 * `appRevealGroup` does the same for a container and staggers its direct children; children added
 * later (e.g. once API data arrives) animate on insertion.
 */
@Directive({
  selector: '[appReveal], [appRevealGroup]',
  host: {
    '[class.reveal]': 'isSingle',
    '[class.reveal-group]': '!isSingle',
    '[attr.data-reveal]': 'variant()',
    '[style.--reveal-delay]': 'delay() ? delay() + "ms" : null',
  },
})
export class RevealDirective {
  /** Variant: up (default) | fade | scale | left | right. */
  readonly variant = input<'up' | 'fade' | 'scale' | 'left' | 'right' | ''>('up', { alias: 'appReveal' });
  readonly delay = input(0, { alias: 'revealDelay' });

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly observer = inject(RevealObserver);
  protected readonly isSingle = !this.el.hasAttribute('appRevealGroup');

  constructor() {
    afterNextRender(() => this.observer.observe(this.el, () => this.el.classList.add('is-visible')));
  }
}
