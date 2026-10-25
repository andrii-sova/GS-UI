import { Component, inject } from '@angular/core';
import { RevealDirective } from '../../shared/reveal.directive';
import { ContentStore } from '../../core/content/content.store';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-regions-map',
  imports: [RevealDirective],
  templateUrl: './regions-map.html',
})
export class RegionsMapComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);

  isActive(key: string): boolean {
    return this.content.regionKeys().has(key);
  }

  regionName(key: string): string | null {
    return this.content.regions().find((r) => r.key === key)?.name ?? null;
  }
}
