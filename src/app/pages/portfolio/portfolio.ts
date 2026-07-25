import { Component, inject, signal, computed, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangService } from '../../services/lang.service';
import { RegionsMapComponent } from '../../components/regions-map/regions-map';
import { EuropeMapComponent } from '../../components/europe-map/europe-map';

@Component({
  selector: 'app-portfolio-page',
  imports: [RouterLink, RegionsMapComponent, EuropeMapComponent],
  templateUrl: './portfolio.html',
})
export class PortfolioPageComponent {
  readonly lang = inject(LangService);

  /** `null` = "All" (always the first entry in `categories`), independent of the active language's label text. */
  readonly selectedCategory = signal<string | null>(null);

  readonly filteredItems = computed(() => {
    const items = this.lang.dict().portfolioPage.items;
    const category = this.selectedCategory();
    return category ? items.filter(item => item.category === category) : items;
  });

  constructor() {
    // Category labels are localized, so a selected filter can't survive a language switch — reset it.
    effect(() => {
      this.lang.lang();
      this.selectedCategory.set(null);
    });
  }

  selectCategory(category: string | null): void {
    this.selectedCategory.set(category);
  }
}
