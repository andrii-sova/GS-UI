import { Component, ElementRef, OnDestroy, inject } from '@angular/core';
import { ContentStore } from '../../core/content/content.store';
import { RevealDirective } from '../../shared/reveal.directive';

const SLOW_RATE = 0.25;

@Component({
  imports: [RevealDirective],
  selector: 'app-partners',
  templateUrl: './partners.html',
  host: { '(mouseenter)': 'setTarget(' + SLOW_RATE + ')', '(mouseleave)': 'setTarget(1)' },
})
export class PartnersComponent implements OnDestroy {
  readonly content = inject(ContentStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private rate = 1;
  private target = 1;
  private frame = 0;

  /** Eases the marquee speed to the target instead of stopping it abruptly. */
  protected setTarget(target: number): void {
    this.target = target;
    cancelAnimationFrame(this.frame);
    const step = () => {
      this.rate += (this.target - this.rate) * 0.08;
      if (Math.abs(this.target - this.rate) < 0.01) this.rate = this.target;
      for (const a of this.host.getAnimations({ subtree: true })) {
        if (a instanceof CSSAnimation && a.animationName === 'partners-scroll') a.updatePlaybackRate(this.rate);
      }
      if (this.rate !== this.target) this.frame = requestAnimationFrame(step);
    };
    step();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frame);
  }
}
