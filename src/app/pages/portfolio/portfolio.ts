import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../shared/reveal.directive';
import { LangService } from '../../services/lang.service';
import { RegionsMapComponent } from '../../components/regions-map/regions-map';
import { EuropeMapComponent } from '../../components/europe-map/europe-map';
import { ContentStore } from '../../core/content/content.store';

@Component({
  selector: 'app-portfolio-page',
  imports: [RouterLink, RevealDirective, RegionsMapComponent, EuropeMapComponent],
  templateUrl: './portfolio.html',
})
export class PortfolioPageComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);

  /** `null` = "All". Otherwise a category key. */
  readonly selectedCategory = signal<string | null>(null);

  readonly filteredItems = computed(() => {
    const key = this.selectedCategory();
    const items = this.content.projects();
    return key ? items.filter((p) => p.categoryKey === key) : items;
  });

  /** True during the short fade-out before the grid swaps to the new category. */
  readonly leaving = signal(false);
  /** Changing this key re-creates the grid so its cards stagger in again. */
  private readonly gridKey = signal(0);
  protected readonly gridKeys = computed(() => [this.gridKey()]);

  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  selectCategory(key: string | null): void {
    if (key === this.selectedCategory()) return;
    clearTimeout(this.timer);
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const apply = () => {
      this.selectedCategory.set(key);
      this.gridKey.update((n) => n + 1);
      this.leaving.set(false);
    };
    if (reduce) return apply();
    this.leaving.set(true);
    this.timer = setTimeout(apply, 120);
  }
}
