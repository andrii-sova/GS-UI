import { Component, inject } from '@angular/core';
import { RevealDirective } from '../../shared/reveal.directive';
import { ContentStore } from '../../core/content/content.store';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-europe-map',
  imports: [RevealDirective],
  templateUrl: './europe-map.html',
})
export class EuropeMapComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);

  isActive(key: string): boolean {
    return this.content.exportCountryKeys().has(key);
  }

  regionName(key: string): string | null {
    return this.content.exportCountries().find((c) => c.key === key)?.name ?? null;
  }
}
