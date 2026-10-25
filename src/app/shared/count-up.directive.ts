import { Directive, ElementRef, afterNextRender, effect, inject, input } from '@angular/core';
import { RevealObserver } from './reveal.directive';

/**
 * Renders a stat like "15+" or "1 200 м²" and counts the number up when it scrolls into view.
 * Values without digits are shown as-is; reduced motion shows the final value immediately.
 */
@Directive({ selector: '[appCountUp]' })
export class CountUpDirective {
  readonly value = input.required<string>({ alias: 'appCountUp' });

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly observer = inject(RevealObserver);
  private visible = false;
  private frame = 0;

  constructor() {
    effect(() => {
      const value = this.value();
      cancelAnimationFrame(this.frame);
      this.el.textContent = value;
      if (this.visible) this.run(value);
    });
    afterNextRender(() =>
      this.observer.observe(this.el, () => {
        this.visible = true;
        this.run(this.value());
      }),
    );
  }

  private run(value: string): void {
    const m = /^(\D*?)(\d[\d\s.,]*)(.*)$/.exec(value);
    if (!m || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const [, prefix, num, suffix] = m;
    const sep = /\d([\s.,])\d{3}(?!\d)/.exec(num)?.[1] ?? '';
    const target = Number(num.replace(/[\s.,]/g, ''));
    if (!Number.isFinite(target) || target === 0) return;
    const format = (n: number) => {
      const s = String(Math.round(n));
      return prefix + (sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : s) + suffix;
    };
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      this.el.textContent = format(target * (1 - Math.pow(1 - t, 4)));
      if (t < 1) this.frame = requestAnimationFrame(tick);
      else this.el.textContent = value;
    };
    this.el.textContent = format(0);
    this.frame = requestAnimationFrame(tick);
  }
}
