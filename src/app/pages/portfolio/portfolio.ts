import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangService } from '../../services/lang.service';
import { RegionsMapComponent } from '../../components/regions-map/regions-map';
import { EuropeMapComponent } from '../../components/europe-map/europe-map';
import { ContentStore } from '../../core/content/content.store';

@Component({
  selector: 'app-portfolio-page',
  imports: [RouterLink, RegionsMapComponent, EuropeMapComponent],
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

  selectCategory(key: string | null): void {
    this.selectedCategory.set(key);
  }
}
